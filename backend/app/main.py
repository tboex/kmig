from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from core.bootstrap import setup_routers, configure_logging
from core.redis import setup_redis_client
from utils.dictionary import load_dictionary
from settings import LOGGER_NAME


redits_client = None
configure_logging()
logger = logging.getLogger(LOGGER_NAME)


async def startup():
    app.state.redis_client = await setup_redis_client()
    app.state.dictionary = load_dictionary('app/utils/dictionary.csv')


async def shutdown():
    await app.state.redis_client.close()


app = FastAPI(
    title='KMIG API',
    description='끝말잇기 게임 API',
    version='1.0.0',
    on_startup=[startup],
    on_shutdown=[shutdown],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # Later add FE Url
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
setup_routers(app)
