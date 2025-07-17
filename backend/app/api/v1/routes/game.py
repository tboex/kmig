from typing import Union
from fastapi import APIRouter, Depends

from core.state import get_state
from models.game import (
    Player,
    GameStatusResponse,
    SinglePlayerRequest,
    SinglePlayerResponse,
    SubmitWordRequest,
    SubmitWordResponse,
    NoActiveGameResponse,
    Status,
)
from services.game_management import (
    init_game,
    add_word,
    bot_take_turn,
)
from services.cache_management import (
    update_game_state,
    game_is_active,
    get_game_state,
)
from utils.hash import generate_hash

router = APIRouter()


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
async def multi() -> None:
    return None


@router.post('/multi/join', response_model_exclude_none=True)
async def join_multi() -> None:
    return None


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

    return SinglePlayerResponse(
        game_id=response.get('game_id', ''),
        mode=response.get('mode', 'single'),
        status=response.get('status'),
        player=response.get('player', None),
        word=response.get('word', None),
        turn=response.get('turn'),
    )


@router.get('/{game_id}', response_model_exclude_none=True)
async def game_status(game_id: str, state=Depends(get_state)) -> GameStatusResponse:
    '''
    Get the current status of the game.
    Returns game details including players, words played, and current turn.
    '''

    response = await get_game_state(state, game_id)

    return GameStatusResponse(
        mode=response.get('mode', ''),
        status=response.get('status', 'INACTIVE'),
        message=response.get('message', 'No active game'),
        previous_player=response.get('previous_player', ''),
        current_turn=response.get('current_turn', ''),
    )


@router.get('/{game_id}/forfeit', response_model_exclude_none=True)
async def forfeit_game(game_id: str) -> dict:
    '''
    Forfeit the current game.
    Returns a message indicating the game has been forfeited.
    '''
    return {
        'game_id': game_id,
        'status': 'forfeited',
        'message': 'Game has been forfeited.'
    }
