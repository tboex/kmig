from fastapi import Request


async def get_state(request: Request):
    '''
    Get the application state from the request.
    This is useful for accessing shared resources like Redis client or dictionary.
    '''
    return request.app.state
