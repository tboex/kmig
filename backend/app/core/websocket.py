import json
from typing import Union
from fastapi import WebSocket

from models.game import (
    WSJoinRequest,
    WSSubmitWordRequest,
    WSChatRequest,
    WSStatusRequest,
    Player,
)
from services.game_management import (
    init_game,
    join_game,
    add_word,
    chose_starting_player,
)
from services.cache_management import (
    update_game_state,
    get_player_list,
    get_game_state,
)


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


async def handle_message(
    message: str,
    game_id: str,
    state,
    manager: ConnectionManager,
    websocket: WebSocket,
) -> Union[WSJoinRequest, WSSubmitWordRequest, WSChatRequest, WSStatusRequest]:
    '''
    Determine the type of message based on its content.
    This is a placeholder function and should be implemented based on actual requirements.
    '''
    payload = json.loads(message)

    if (payload_type := payload.get('type')) == 'join':
        request = WSJoinRequest(
            game_id=game_id,
            player_id=payload.get('player_id', ''),
            player_name=payload.get('player_name', '')
        )

        await handle_websocket_join_request(request, state, manager, websocket)
        return request
    elif payload_type == 'submit':
        request = WSSubmitWordRequest(
            game_id=game_id,
            player_id=payload.get('player_id', ''),
            player_name=payload.get('player_name', ''),
            word=payload.get('word', '')
        )

        await handle_websocket_submit_word_request(request, state, manager, websocket)
        return request
    elif payload_type == 'chat':
        request = WSChatRequest(
            game_id=game_id,
            player_id=payload.get('player_id', ''),
            player_name=payload.get('player_name', ''),
            message=payload.get('message', '')
        )

        await handle_websocket_chat_request(request, state, manager, websocket)
        return request
    elif payload_type == 'status':
        request = WSStatusRequest(
            game_id=game_id,
            player_id=payload.get('player_id', ''),
            player_name=payload.get('player_name', '')
        )
        await handle_websocket_status_request(request, state, manager, websocket)
        return request
    elif payload_type == 'restart':
        request = WSJoinRequest(
            game_id=game_id,
            player_id=payload.get('player_id', ''),
            player_name=payload.get('player_name', '')
        )
        await handle_websocket_restart_request(request, state, manager, websocket)
        return request
    else:
        raise ValueError(f'Unknown message type: {payload_type}')


async def handle_websocket_status_request(
    request: WSStatusRequest,
    state,
    manager: ConnectionManager,
    websocket: WebSocket,
):
    status = await get_game_state(state, request.game_id)

    players = await get_player_list(state, request.game_id)

    await manager.send_personal_message(
        json.dumps({
            'type': 'status',
            'status': status.get('status', 'UNKNOWN'),
            'current_turn': status.get('current_turn', 'n/a'),
            'players': players,
        }),
        websocket,
    )


async def handle_websocket_join_request(
    request: WSJoinRequest,
    state,
    manager: ConnectionManager,
    websocket: WebSocket,
):
    status = await join_game(
        state=state,
        game_id=request.game_id,
        player=Player(
            id=request.player_id,
            name=request.player_name,
        ),
    )

    await update_game_state(
        state=state,
        game_id=request.game_id,
        round_state=status,
    )

    players = await get_player_list(state, request.game_id)

    await manager.send_personal_message(
        json.dumps({
            'type': 'status',
            'status': status['status'].status,
            'message': status['status'].message,
            'current_turn': status['turn'].id if status.get('turn') else 'n/a',
            'players': players,
        }),
        websocket,
    )
    await manager.broadcast(
        json.dumps({
            'type': 'player_joined',
            'game_id': request.game_id,
            'current_turn': status['turn'].id if status.get('turn') else 'n/a',
            'players': players,
        })
    )


async def handle_websocket_restart_request(
    request: WSJoinRequest,
    state,
    manager: ConnectionManager,
    websocket: WebSocket,
):
    status = await init_game(
        state=state,
        game_id=request.game_id,
        mode='multi',
        player=Player(
            id=request.player_id,
            name=request.player_name,
        ),
    )

    starting_player = await chose_starting_player(
        state=state,
        game_id=request.game_id,
    )

    status['turn'] = starting_player
    status['server_status'] = 'READY'


    await update_game_state(
        state=state,
        game_id=request.game_id,
        round_state=status,
    )

    players = await get_player_list(state, request.game_id)

    await manager.broadcast(
        json.dumps({
            'type': 'game_restarted',
            'game_id': request.game_id,
            'current_turn': status['turn'].id if status.get('turn') else 'n/a',
            'players': players,
        })
    )


async def handle_websocket_submit_word_request(
    request: WSSubmitWordRequest,
    state,
    manager: ConnectionManager,
    websocket: WebSocket,
):
    status = await add_word(
        state=state,
        game_id=request.game_id,
        word=request.word,
        player=Player(
            id=request.player_id,
            name=request.player_name,
        ),
    )

    await update_game_state(
        state=state,
        game_id=request.game_id,
        round_state=status,
    )

    await manager.broadcast(
        json.dumps({
            'type': 'word_submitted',
            'game_id': request.game_id,
            'player_id': request.player_id,
            'player_name': request.player_name,
            'current_turn': status['turn'].id if status.get('turn') else 'n/a',
            'status': status['status'].status,
            'message': status['status'].message,
            'word': status['word'] if status.get('word') else None,
        })
    )


async def handle_websocket_chat_request(
    request: WSChatRequest,
    state,
    manager: ConnectionManager,
    websocket: WebSocket,
):
    await manager.broadcast(
        json.dumps({
            'type': 'chat',
            'game_id': request.game_id,
            'player_id': request.player_id,
            'player_name': request.player_name,
            'message': request.message,
        })
    )
