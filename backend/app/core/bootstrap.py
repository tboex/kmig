import logging
import os
import sys

from fastapi import FastAPI
import google.cloud.logging
from uvicorn.logging import DefaultFormatter

from constants import KMIG_SERVICE_PREFIX, KMIG_VERSION_PREFIX, APITags
from settings import PACKAGE_SEVERITY_LEVELS, SEVERITY_LEVEL, LOGGER_NAME


def setup_routers(app: FastAPI) -> None:
    from api.v1.routes import health
    from api.v1.routes import game
    from api.v1.routes import maintenance

    app.include_router(
        health.router,
        prefix=f'/{KMIG_SERVICE_PREFIX}/{KMIG_VERSION_PREFIX}',
        tags=[APITags.HEALTH],
    )
    app.include_router(
        game.router,
        prefix=f'/{KMIG_SERVICE_PREFIX}/{KMIG_VERSION_PREFIX}/game',
        tags=[APITags.GAME],
    )
    app.include_router(
        maintenance.router,
        prefix=f'/{KMIG_SERVICE_PREFIX}/{KMIG_VERSION_PREFIX}/maintenance',
        tags=[APITags.MAINTENANCE],
    )


def configure_logging():
    logger = logging.getLogger(LOGGER_NAME)
    logger.setLevel(SEVERITY_LEVEL)

    if os.getenv('ENV', 'local') != 'local':
        # Configure Google Cloud Logging
        client = google.cloud.logging.Client()
        client.setup_logging()
    else:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(SEVERITY_LEVEL)
        console_handler.setFormatter(DefaultFormatter('%(levelprefix)s %(message)s'))

        logger.addHandler(console_handler)

    # Configure package-specific logging levels
    for package, level in PACKAGE_SEVERITY_LEVELS.items():
        logging.getLogger(package).setLevel(level)
