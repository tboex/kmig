import os
import logging


PACKAGE_SEVERITY_LEVELS = {
    'uvicorn': logging.DEBUG
}
SEVERITY_LEVEL = os.getenv('SECURITY_LEVEL', 'DEBUG')
LOGGER_NAME = os.getenv('LOGGER_NAME', 'kmig')

REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
