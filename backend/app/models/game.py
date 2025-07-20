import datetime
from pydantic import BaseModel, Field


class Status(BaseModel):
    status: str = Field('success', description='Status indicator for server')
    message: str = Field('', description='Human readable message')
    timestamp: str = str(datetime.datetime.now())


class Word(BaseModel):
    '''
    Model representing a word in the game.
    '''
    korean: str = Field('', description='Korean word')
    pronunciation: str | None = None
    hanja: str | None = None
    part_of_speech: str | None = None
    definition: str | None = None
    english: str | None = None


class Player(BaseModel):
    '''
    Model representing a player in the game.
    '''
    id: str = Field(..., description='Unique identifier for the player')
    name: str = Field(..., description='Name of the player')


class GameStatusResponse(BaseModel):
    '''
    Model representing the response from the server
    '''
    mode: str
    status: str = ''
    message: str = ''
    previous_player: str = 'n/a'
    current_turn: str = 'n/a'
    players: list[str] = Field(default_factory=list, description='List of player IDs in the game')


class SinglePlayerRequest(BaseModel):
    '''
    Request model for single player game.
    '''
    player_name: str = Field(..., description="Player's name")
    player_id: str = Field(..., description='Unique identifier for the player')
    word: str = Field('', description='The word to be played in the game')
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
    status: Status | None = Field(None, description='Status of Submission')
    player: Player | None = None
    word: Word | None = None
    turn: Player | None = None


class MultiplayerRequest(SinglePlayerRequest):
    '''
    Request model for multiplayer game.
    '''
    pass


class MultiplayerResponse(SinglePlayerResponse):
    '''
    Response model for multiplayer game.
    '''
    pass


class MultiplayerJoinRequest(BaseModel):
    '''
    Request model for joining a multiplayer game.
    '''
    player_id: str = Field(..., description='Unique identifier for the player joining the game')
    player_name: str = Field(..., description='Name of the player joining the game')


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
    success: bool = False


class NoActiveGameResponse(BaseModel):
    '''
    Indicates that there is no active game for that game id
    '''
    game_id: str = Field(..., description='Unique identifier for the game')
    status: Status = Field(..., description='Current status of the game')


class WSJoinRequest(BaseModel):
    '''
    Request model for joining a game via WebSocket.
    '''
    game_id: str = Field(..., description='Unique identifier for the game')
    player_id: str = Field(..., description='Unique identifier for the player')
    player_name: str = Field(..., description='Name of the player joining the game')


class WSSubmitWordRequest(SubmitWordRequest):
    '''
    Request model for submitting a word via WebSocket.
    '''
    game_id: str = Field(..., description='Unique identifier for the game')


class WSChatRequest(BaseModel):
    '''
    Request model for sending a chat message via WebSocket.
    '''
    game_id: str = Field(..., description='Unique identifier for the game')
    player_id: str = Field(..., description='Unique identifier for the player')
    player_name: str = Field(..., description='Name of the player sending the message')
    message: str = Field(..., description='Chat message content')


class WSStatusRequest(BaseModel):
    '''
    Request model for sending a status update via WebSocket.
    '''
    game_id: str = Field(..., description='Unique identifier for the game')
    player_id: str = Field(..., description='Unique identifier for the player')
    player_name: str = Field(..., description='Name of the player sending the status update')
