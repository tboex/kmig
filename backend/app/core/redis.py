import logging

from redis.asyncio import Redis

from settings import REDIS_HOST, REDIS_PORT, LOGGER_NAME


logger = logging.getLogger(LOGGER_NAME)


async def setup_redis_client():
    redis_client = Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        decode_responses=True,
    )
    try:
        await redis_client.ping()
        logging.debug('Redis is connected')
    except Exception as exc:
        logging.critical('Redis is not connected')
        raise exc
    return redis_client
