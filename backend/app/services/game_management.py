from typing import Optional
import random
import logging

from models.game import (
    Word,
    Player,
)
from constants import KMIG_BOT_NAME, KMIG_BOT_ID, KEY_EXPIRY
from settings import LOGGER_NAME


logger = logging.getLogger(LOGGER_NAME)


async def init_game(state, game_id: str, mode: str, player: Player) -> dict:
    game_status = {
        'game_id': game_id,
        'mode': mode,
        'status': 'waiting_for_opening_move',
        'player': None,
        'word': None,
        'turn': player,
    }

    await state.redis_client.hset(
        f'game:{game_id}',
        mapping={
            'mode': mode,
            'status': 'waiting' if mode == 'multi' else 'playing',
            'turn': player.id,
        },
    )
    await state.redis_client.expire(f'game:{game_id}', KEY_EXPIRY)  # 30 minutes expiration
    await add_player(state, game_id, player)

    if mode == 'single':
        # For single player mode, randomly decide who starts
        player_start = random.choice([True, False])
        bot_player = Player(id=KMIG_BOT_ID, name=KMIG_BOT_NAME)
        await add_player(state, game_id, bot_player)

        if not player_start:
            await state.redis_client.setex(f'game:{game_id}:turn', KEY_EXPIRY, KMIG_BOT_ID)
            bot_word = await bot_pick_word(state, game_id)
            if bot_word:
                game_status['turn'] = await get_next_player(state, game_id)
                game_status['word'] = bot_word
                game_status['player'] = bot_player
                game_status['status'] = 'waiting_for_player_turn'
            else:
                game_status['status'] = 'victory_no_valid_words'

    logging.info(f'Started Solo Game: {game_id}')
    return game_status


async def is_valid_word(state, game_id: str, word: str) -> tuple[bool, str, Word | None]:
    dictionary = state.dictionary

    words = await state.redis_client.lrange(f'game:{game_id}:words', 0, -1)

    if word in words:
        return (False, 'word already used', Word(
            korean=word,
            pronunciation=None,
            hanja=None,
            part_of_speech=None,
            definition=None,
            english_meaning=None,
        ))

    response_word = dictionary.get(word, '')
    if not response_word:
        return (False, 'word not in dictionary', None)

    if not words:
        return (True, 'first word is always valid', response_word)

    last_character = words[-1][-1]  # Last character of the last word played
    if word[0] == last_character:
        return (True, 'word is valid', response_word)
    else:
        # If the first character of the new word does not match the last character of the last word
        return (False, 'first character does not match last character of the last word', response_word)


async def add_word(state, game_id: str, player: Player, word: str) -> dict:
    stored_state = await state.redis_client.hgetall(f'game:{game_id}')
    game_status = {
        'game_id': game_id,
        'mode': stored_state.get('mode', 'single'),
        'status': 'waiting_for_player_turn',
        'player': player,
        'word': None,
        'turn': player,
    }

    valid, status, response_word = await is_valid_word(state,game_id, word)
    game_status['success'], game_status['status'], game_status['word'] = valid, status, response_word

    if valid:
        await state.redis_client.rpush(f'game:{game_id}:words', word)
        game_status['turn'] = await get_next_player(state, game_id)

    return game_status


async def add_player(state, game_id: str, player: Player) -> None:
    await state.redis_client.rpush(f'game:{game_id}:players', player.id)
    await state.redis_client.expire(f'game:{game_id}:players', KEY_EXPIRY)
    await state.redis_client.hset(f'game:{game_id}:player{player.id}', mapping={
        'id': player.id,
        'name': player.name,
    })
    await state.redis_client.expire(f'game:{game_id}:player', KEY_EXPIRY)


async def get_next_player(state, game_id: str) -> Optional[Player]:
    players = await state.redis_client.lrange(f'game:{game_id}:players', 0, -1)
    current_turn = await state.redis_client.get(f'game:{game_id}:turn')

    if not players or not current_turn:
        return None

    current_index = players.index(current_turn)
    next_index = (current_index + 1) % len(players)
    next_player = players[next_index]

    await state.redis_client.setex(f'game:{game_id}:turn', KEY_EXPIRY, next_player)
    return await state.redis_client.hget(f'game:{game_id}:player', next_player)


async def bot_take_turn(state, game_id: str) -> dict:
    game_status = {
        'game_id': game_id,
        'mode': 'single',
        'status': 'waiting_for_player_turn',
        'player': None,
        'word': None,
        'turn': None,
    }

    await state.redis_client.setex(f'game:{game_id}:turn', KEY_EXPIRY, KMIG_BOT_ID)
    bot_word = await bot_pick_word(state, game_id)
    bot_player = Player(id=KMIG_BOT_ID, name=KMIG_BOT_NAME)

    if bot_word:
        game_status['turn'] = await get_next_player(state, game_id)
        game_status['word'] = bot_word
        game_status['player'] = bot_player
        game_status['status'] = 'waiting_for_player_turn'
    else:
        game_status['status'] = 'victory_no_valid_words'

    return game_status


async def bot_pick_word(state, game_id: str) -> Optional[Word]:
    dictionary = state.dictionary
    random_word = random.choice(list(dictionary.items()))
    word_dict = random_word[1]

    previous_words = await state.redis_client.lrange(f'game:{game_id}:words', 0, -1)
    if not previous_words:
        await state.redis_client.rpush(f'game:{game_id}:words', random_word[0])
        await state.redis_client.expire(f'game:{game_id}:words', KEY_EXPIRY)

        return Word(
            korean=word_dict.get('korean'),
            pronunciation=word_dict.get('pronunciation'),
            hanja=word_dict.get('hanja', ''),
            part_of_speech=word_dict.get('part_of_speech'),
            definition=word_dict.get('definition'),
            english_meaning=word_dict.get('english'),
        )

    last_character = previous_words[-1][-1]  # Last character of the last word played

    valid_words = []
    for word in state.dictionary:
        if word.startswith(last_character) and word not in previous_words:
            valid_words.append(word)

    if valid_words:
        chosen_word = random.choice(valid_words)
        chosen_word_dict = chosen_word[1]
        await state.redis_client.rpush(
            f'game:{game_id}:words',
            chosen_word_dict.get('korean'),
        )
        await state.redis_client.expire(f'game:{game_id}:words', KEY_EXPIRY)
        return Word(
            korean=chosen_word_dict.get('korean'),
            pronunciation=chosen_word_dict.get('pronunciation'),
            hanja=chosen_word_dict.get('hanja', ''),
            part_of_speech=chosen_word_dict.get('part_of_speech'),
            definition=chosen_word_dict.get('definition'),
            english_meaning=chosen_word_dict.get('english'),
        )

    return None
