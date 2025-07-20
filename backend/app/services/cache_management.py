import logging

from models.game import (
    Player,
)
from constants import KEY_EXPIRY
from settings import LOGGER_NAME


logger = logging.getLogger(LOGGER_NAME)


async def init_game_state(state, game_id:str, mode: str) -> None:
    await state.redis_client.hset(
        f'game:{game_id}',
        mapping={
            'mode': mode,
            'status': 'WAITING',
            'message': 'First turn not taken',
            'previous_player': 'n/a',
            'current_turn': 'n/a',
        },
    )
    await state.redis_client.expire(f'game:{game_id}', KEY_EXPIRY)


async def add_player(state, game_id: str, player: Player) -> None:
    if not await state.redis_client.exists(f'game:{game_id}:player:{player.id}'):
        await state.redis_client.rpush(f'game:{game_id}:players', player.id)
        await state.redis_client.expire(f'game:{game_id}:players', KEY_EXPIRY)
        await state.redis_client.hset(f'game:{game_id}:player:{player.id}', mapping={
            'id': player.id,
            'name': player.name,
        })
        await state.redis_client.expire(f'game:{game_id}:player:{player.id}', KEY_EXPIRY)


async def is_valid_turn(state, game_id: str, player_id: str) -> bool:
    current_turn = await state.redis_client.hget(f'game:{game_id}', 'current_turn')
    return current_turn == player_id


async def game_is_active(state, game_id:str) -> bool:
    return await state.redis_client.exists(f'game:{game_id}')


async def update_game_state(state, game_id: str, round_state: dict) -> None:
    current_game_state = await state.redis_client.hgetall(f'game:{game_id}')
    await state.redis_client.hset(
        f'game:{game_id}',
        mapping={
            'status': round_state.get('server_status') if round_state.get('server_status') else current_game_state.get('status'),  # noqa: E501
            'previous_player': getattr(round_state.get('player'), 'id', None) if getattr(round_state.get('player'), 'id', None) else current_game_state.get('previous_player'),  # noqa: E501
            'current_turn': getattr(round_state.get('turn'), 'id', None) if getattr(round_state.get('turn'), 'id', None) else current_game_state.get('current_turn'),  # noqa: E501
        },
    )


async def get_game_state(state, game_id: str) -> dict:
    return await state.redis_client.hgetall(f'game:{game_id}')


async def get_player_list(state, game_id: str) -> list[str]:
    players = await state.redis_client.lrange(f'game:{game_id}:players', 0, -1)
    return players


async def get_player_details(state, game_id: str, player_id: str) -> Player | None:
    player_data = await state.redis_client.hgetall(f'game:{game_id}:player:{player_id}')
    if not player_data:
        return None
    return Player(
        id=player_data.get('id'),
        name=player_data.get('name'),
    )
