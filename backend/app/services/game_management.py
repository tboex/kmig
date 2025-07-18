from typing import Optional, Any
import random
import logging

from services.cache_management import (
    add_player,
    init_game_state,
)
from models.game import (
    Word,
    Player,
    Status,
)
from constants import KMIG_BOT_NAME, KMIG_BOT_ID, KEY_EXPIRY
from settings import LOGGER_NAME


logger = logging.getLogger(LOGGER_NAME)


async def init_game(state, game_id: str, mode: str, player: Player, word: str) -> dict[str, Any]:
    game_status = {
        'game_id': game_id,
        'mode': mode,
        'status': Status(status='WAITING', message='First turn not taken'),
        'player': None,
        'word': None,
        'turn': player,
    }

    await init_game_state(state=state, game_id=game_id, mode=mode)
    await add_player(state, game_id, player)

    if mode == 'single':
        # For single player mode, randomly decide who starts
        player_start = random.choice([True, False])

        bot_player = Player(id=KMIG_BOT_ID, name=KMIG_BOT_NAME)
        await add_player(state, game_id, bot_player)

        if not player_start:
            game_status = await bot_take_turn(state, game_id)
        elif word:
            await state.redis_client.hset(
                f'game:{game_id}',
                mapping={
                    'previous_player': player.id,
                    'current_turn': player.id,
                },
            )
            game_status = await add_word(state, game_id, player, word)

    logging.info(f'Started Solo Game: {game_id}')
    return game_status


async def is_valid_word(state, game_id: str, word: str) -> tuple[bool, Status, Word | None]:
    dictionary = state.dictionary

    words = await state.redis_client.lrange(f'game:{game_id}:words', 0, -1)

    if word in words:
        return (False, Status(status='INVALID', message='Word already used'), Word(
            korean=word,
            pronunciation=None,
            hanja=None,
            part_of_speech=None,
            definition=None,
            english=None,
        ))

    response_word = dictionary.get(word, '')
    if not response_word:
        return (False, Status(status='INVALID', message='Word not in dictionary'), None)

    if not words:
        return (True, Status(status='VALID', message='First word is always valid'), response_word)

    last_character = words[-1][-1]  # Last character of the last word played
    if word[0] == last_character:
        return (True, Status(status='VALID', message='Word is valid'), response_word)
    else:
        # If the first character of the new word does not match the last character of the last word
        return (
            False,
            Status(status='INVALID', message='First character does not match last character of the previous word'),
            response_word,
        )


async def add_word(state, game_id: str, player: Player, word: str) -> dict:
    stored_state = await state.redis_client.hgetall(f'game:{game_id}')
    game_status = {
        'game_id': game_id,
        'mode': stored_state.get('mode', 'single'),
        'status': None,
        'player': player,
        'word': None,
        'turn': player,
    }

    valid, status, response_word = await is_valid_word(state, game_id, word)
    game_status['success'], game_status['status'], game_status['word'] = valid, status, response_word

    if valid:
        await state.redis_client.rpush(f'game:{game_id}:words', word)
        game_status['turn'] = await get_next_player(state, game_id)

    return game_status


async def get_next_player(state, game_id: str) -> Optional[Player]:
    players = await state.redis_client.lrange(f'game:{game_id}:players', 0, -1)
    current_turn = await state.redis_client.hget(f'game:{game_id}', 'current_turn')

    if not players or not current_turn:
        return None

    current_index = players.index(current_turn)
    next_index = (current_index + 1) % len(players)
    next_player = players[next_index]

    next_player_details = await state.redis_client.hgetall(f'game:{game_id}:player:{next_player}')

    return Player(
        id=next_player_details.get('id'),
        name=next_player_details.get('name')
    )


async def bot_take_turn(state, game_id: str) -> dict[str, Any]:
    game_status = {
        'game_id': game_id,
        'mode': 'single',
        'status': None,
        'player': None,
        'word': None,
        'turn': None,
    }

    await state.redis_client.hset(f'game:{game_id}', 'current_turn', KMIG_BOT_ID)
    bot_word = await bot_pick_word(state, game_id)
    bot_player = Player(id=KMIG_BOT_ID, name=KMIG_BOT_NAME)

    if bot_word:
        game_status['turn'] = await get_next_player(state, game_id)
        game_status['word'] = bot_word
        game_status['player'] = bot_player
        game_status['status'] = Status(status='VALID', message='Bot response successful')
    else:
        game_status['status'] = Status(status='VICTORY', message='No valid words')

    return game_status


async def bot_pick_word(state, game_id: str) -> Optional[Word]:
    dictionary = state.dictionary
    random_word = random.choice(list(dictionary.items()))

    while len(random_word[0]) < 1:
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
            english=word_dict.get('english'),
        )

    last_character = previous_words[-1][-1]  # Last character of the last word played

    valid_words = []
    for word in state.dictionary:
        if word.startswith(last_character) and word not in previous_words:
            valid_words.append(word)

    if valid_words:
        chosen_word = random.choice(valid_words)
        while len(chosen_word) <= 1:
            chosen_word = random.choice(valid_words)

        chosen_word_dict = state.dictionary.get(chosen_word)
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
            english=chosen_word_dict.get('english'),
        )

    return None
