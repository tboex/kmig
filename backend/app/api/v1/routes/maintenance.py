from fastapi import APIRouter, Depends
from core.state import get_state

router = APIRouter()


@router.post('/cleanup')
async def cleanup_stale_games(state=Depends(get_state)):
    cursor = 0
    cleaned = 0

    while True:
        cursor, keys = await state.redis_client.scan(
            cursor=cursor,
            match='game:*'
        )

        for key in keys:
            ttl = await state.redis_client.ttl(key)
            if ttl == -1:
                await state.redis_client.delete(key)
                cleaned += 1

        if cursor == 0:
            break

    return {'cleaned': cleaned}
