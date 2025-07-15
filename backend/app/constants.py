from enum import Enum

KMIG_SERVICE_PREFIX = 'kmig'
KMIG_VERSION_PREFIX = 'v1'


class APITags(str, Enum):
    HEALTH = 'health'
    AUTH = 'auth'
    GAME = 'game'
    WORDS = 'words'


KMIG_BOT_NAME = 'kmig_bot'
KMIG_BOT_ID = 'kmig_bot_id'

KEY_EXPIRY = 1800  # 30 minutes in seconds
