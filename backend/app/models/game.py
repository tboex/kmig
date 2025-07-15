from pydantic import BaseModel, Field


class Word(BaseModel):
    '''
    Model representing a word in the game.
    '''
    korean: str = Field('', description='Korean word')
    pronunciation: str | None = Field(None, description='Pronunciation of the word in Korean')
    hanja: str | None = Field(None, description='Hanja representation of the word, if applicable')
    part_of_speech: str | None = Field(None, description='Part of speech of the word (e.g., noun, verb)')
    definition: str | None = Field(None, description='Definition of the word in Korean')
    english_meaning: str | None = Field(None, description='English word')


class Player(BaseModel):
    '''
    Model representing a player in the game.
    '''
    id: str = Field(..., description='Unique identifier for the player')
    name: str = Field(..., description='Name of the player')


class SinglePlayerRequest(BaseModel):
    '''
    Request model for single player game.
    '''
    player_name: str = Field(..., description="Player's name")
    player_id: str = Field(..., description='Unique identifier for the player')
    guess_count: int = Field(5, description='Number of guesses allowed per player')
    max_time: int = Field(
        0,
        description='Maximum time allowed for the game in seconds, if 0 game is played without time limit',
    )
    max_fails: int = Field(
        3,
        description='Maximum number of failed attempts allowed per player before the game ends',
    )


class SinglePlayerResponse(BaseModel):
    '''
    Response model for single player game.
    '''
    game_id: str = Field(..., description='Unique identifier for the game')
    mode: str = Field('single', description="Game mode, always 'single' for single player")
    status: str = Field('waiting_for_player_turn', description='Current status of the game')
    player: Player | None = Field(None, description='Details of the player in the game')
    word: Word | None = Field(None, description='The word to be guessed in the game, if applicable')
    turn: Player | None = Field(None, description="Current player's turn in the game, if applicable")


class SubmitWordRequest(BaseModel):
    '''
    Request model for submitting a word in the game.
    '''
    word: str = Field(..., description='The word submitted by the player')
    player_id: str = Field(..., description='Unique identifier for the player submitting the word')
    player_name: str = Field(..., description='Name of the player submitting the word')


class SubmitWordResponse(SinglePlayerResponse):
    '''
    Response model for submitting a word in the game.
    '''
    success: bool = Field(False, description='Indicates whether the word submission was successful')
