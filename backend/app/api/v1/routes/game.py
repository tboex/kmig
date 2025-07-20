from typing import Union
import logging
import json
from fastapi import APIRouter, Depends, WebSocket
from pydantic import ValidationError

from settings import LOGGER_NAME
from core.state import get_state
from models.game import (
    Player,
    GameStatusResponse,
    SinglePlayerRequest,
    SinglePlayerResponse,
    MultiplayerRequest,
    MultiplayerResponse,
    MultiplayerJoinRequest,
    SubmitWordRequest,
    SubmitWordResponse,
    NoActiveGameResponse,
    Status,
)
from services.game_management import (
    init_game,
    add_word,
    bot_take_turn,
    join_game,
)
from services.cache_management import (
    update_game_state,
    game_is_active,
    get_game_state,
    get_player_list,
)
from core.websocket import (
    ConnectionManager,
    handle_message,
)
from utils.hash import generate_hash

logger = logging.getLogger(LOGGER_NAME)

router = APIRouter()

manager = ConnectionManager()


@router.post('/single', response_model_exclude_none=True)
async def single(
    request: SinglePlayerRequest,
    state=Depends(get_state),
) -> SinglePlayerResponse:
    game_id = generate_hash()

    response = await init_game(
        state=state,
        game_id=game_id,
        mode='single',
        player=Player(
            id=request.player_id,
            name=request.player_name,
        ),
        word=request.word,
    )

    await update_game_state(
        state=state,
        game_id=game_id,
        round_state=response,
    )

    return SinglePlayerResponse(
        game_id=game_id,
        mode=response.get('mode', 'single'),
        status=response.get('status'),
        player=response.get('player', None),
        word=response.get('word', None),
        turn=response.get('turn', ''),
    )


@router.post('/multi', response_model_exclude_none=True)
async def multi(
    request: MultiplayerRequest,
    state=Depends(get_state),
) -> MultiplayerResponse:
    '''
    Start a multiplayer game and return the gameid.
    '''

    game_id = generate_hash()

    response = await init_game(
        state=state,
        game_id=game_id,
        mode='multi',
        player=Player(
            id=request.player_id,
            name=request.player_name,
        ),
        word=request.word,  # TODO: Do I want the ability to pass word in MP?
    )

    await update_game_state(
        state=state,
        game_id=game_id,
        round_state=response,
    )

    return MultiplayerResponse(
        game_id=game_id,
        mode=response.get('mode', 'multi'),
        status=response.get('status', None),
        player=response.get('player', None),
        word=response.get('word', None),
        turn=response.get('turn', ''),
    )


@router.post('/{game_id}/join', response_model_exclude_none=True)
async def join_multi(
    game_id: str,
    request: MultiplayerJoinRequest,
    state=Depends(get_state),
) -> GameStatusResponse:

    response = await join_game(
        state=state,
        game_id=game_id,
        player=Player(
            id=request.player_id,
            name=request.player_name,
        ),
    )

    await update_game_state(
        state=state,
        game_id=game_id,
        round_state=response,
    )

    players = await get_player_list(state, game_id)

    return GameStatusResponse(
        mode='multi',
        status=response['status'].status,
        message=response['status'].message,
        current_turn=response['turn'].id if response.get('turn') else 'n/a',
        players=players,
    )


@router.post('/{game_id}/submit', response_model_exclude_none=True)
async def submit_word(
    game_id: str,
    request: SubmitWordRequest,
    state=Depends(get_state),
) -> Union[SubmitWordResponse, NoActiveGameResponse]:

    if not await game_is_active(state, game_id):
        return NoActiveGameResponse(
            game_id=game_id,
            status=Status(
                status='INVALID',
                message='No Active Game',
            )
        )

    response = await add_word(
        state=state,
        game_id=game_id,
        word=request.word,
        player=Player(
            id=request.player_id,
            name=request.player_name,
        ),
    )

    await update_game_state(
        state=state,
        game_id=game_id,
        round_state=response,
    )

    return SubmitWordResponse(
        game_id=response.get('game_id', ''),
        mode=response.get('mode', 'single'),
        status=response['status'],
        player=response.get('player', None),
        word=response.get('word', None),
        turn=response.get('turn', None),
        success=response.get('success', False),
    )


@router.get('/{game_id}/bot-turn', response_model_exclude_none=True)
async def kmig_bot_turn(
    game_id: str,
    state=Depends(get_state),
) -> SinglePlayerResponse:

    response = await bot_take_turn(
        state=state,
        game_id=game_id,
    )

    await update_game_state(
        state=state,
        game_id=game_id,
        round_state=response,
    )

    return SinglePlayerResponse(
        game_id=response.get('game_id', ''),
        mode=response.get('mode', 'single'),
        status=response.get('status'),
        player=response.get('player', None),
        word=response.get('word', None),
        turn=response.get('turn'),
    )


@router.websocket('/ws/{game_id}')
async def websocket_endpoint(
    websocket: WebSocket,
    game_id: str,
):
    state = websocket.app.state
    await manager.connect(websocket)

    try:
        if not await game_is_active(state, game_id):
            await manager.send_personal_message(
                f'No active game for game_id: {game_id}', websocket
            )
            raise Exception(f'No active game for game_id: {game_id}')
        while True:
            data = await websocket.receive_text()
            try:
                await handle_message(
                    data,
                    game_id,
                    state,
                    manager,
                    websocket,
                )

            except (json.JSONDecodeError, ValidationError) as e:
                logger.error(f'Invalid payload: {str(e)}')
                await manager.send_personal_message(
                    f'Invalid payload: {str(e)}', websocket
                )
                continue
    except Exception as e:
        logger.error(f'WebSocket error: {e}')
    finally:
        logger.info(f'WebSocket connection closed for game_id: {game_id}')
        manager.disconnect(websocket)


@router.get('/{game_id}', response_model_exclude_none=True)
async def game_status(game_id: str, state=Depends(get_state)) -> GameStatusResponse:
    '''
    Get the current status of the game.
    Returns game details including players, words played, and current turn.
    '''

    response = await get_game_state(state, game_id)

    players = await get_player_list(state, game_id)

    return GameStatusResponse(
        mode=response.get('mode', ''),
        status=response.get('status', 'INACTIVE'),
        message=response.get('message', 'No active game'),
        previous_player=response.get('previous_player', ''),
        current_turn=response.get('current_turn', ''),
        players=players,
    )


@router.get('/{game_id}/forfeit', response_model_exclude_none=True)
async def forfeit_game(game_id: str) -> dict:
    '''
    Forfeit the current game.
    Returns a message indicating the game has been forfeited.
    '''

    # TODO NTI

    return {
        'game_id': game_id,
        'status': 'forfeited',
        'message': 'Game has been forfeited.'
    }
