import pytest
from unittest.mock import AsyncMock

from app.services.game_management import bot_pick_word, Word


@pytest.mark.asyncio
async def test_bot_pick_word_selects_valid_word():
    # Mock state and redis_client
    class MockState:
        def __init__(self):
            self.dictionary = {
                '가게': {
                    'korean': '가게',
                    'pronunciation': '가ː게',
                    'hanja': '',
                    'part_of_speech': '명사',
                    'definition': '작은 규모로 물건을 펼쳐 놓고 파는 집.',
                    'english': 'shop; store',
                },
                '가구': {
                    'korean': '가구',
                    'pronunciation': '가구',
                    'hanja': '家具',
                    'part_of_speech': '명사',
                    'definition': '집 안에서 쓰이는 침대, 옷장, 식탁 등과 같은 도구.',
                    'english': 'furniture',
                },
            }
            self.redis_client = AsyncMock()
            # Simulate no previous words
            self.redis_client.lrange.return_value = []
            self.redis_client.rpush.return_value = None
            self.redis_client.expire.return_value = None

    state = MockState()
    game_id = 'test_game'

    word = await bot_pick_word(state, game_id)

    assert isinstance(word, Word)
    assert word.korean in state.dictionary


@pytest.mark.asyncio
async def test_bot_pick_word_with_euphonic_change():
    # Mock state and redis_client
    class MockState:
        def __init__(self):
            self.dictionary = {
                '여름': {
                    'korean': '여름',
                    'pronunciation': '여름',
                    'hanja': '',
                    'part_of_speech': '명사',
                    'definition': '1년 중 가장 더운 계절.',
                    'english': 'summer',
                },
                '음식': {
                    'korean': '음식',
                    'pronunciation': '음식',
                    'hanja': '飮食',
                    'part_of_speech': '명사',
                    'definition': '사람이 먹는 모든 것.',
                    'english': 'food; meal',
                }
            }
            self.redis_client = AsyncMock()
            # Simulate no previous words
            self.redis_client.lrange.return_value = ['여름']
            self.redis_client.rpush.return_value = None
            self.redis_client.expire.return_value = None

    state = MockState()
    game_id = 'test_game'

    word = await bot_pick_word(state, game_id)

    assert isinstance(word, Word)
    assert word.korean in state.dictionary
