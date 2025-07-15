from fastapi import APIRouter


router = APIRouter()


@router.get('/health')
async def health() -> dict:
    '''
    Health check endpoint.
    Returns a simple message indicating the service is running.
    '''
    return {'status': 'ok', 'message': 'KMIG API is running.'}


@router.get('/version')
async def version() -> dict:
    '''
    Version endpoint.
    Returns the current version of the KMIG API.
    '''
    return {'version': '1.0.0', 'service': 'KMIG API'}


@router.get('/ready')
async def ready() -> dict:
    '''
    Readiness check endpoint.
    Returns a message indicating the service is ready to accept requests.
    '''
    return {'status': 'ready', 'message': 'KMIG API is ready.'}
