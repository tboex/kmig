from fastapi import APIRouter

router = APIRouter()


@router.post('/login')
async def login() -> None:
    pass


@router.post('/signup')
async def signup() -> None:
    pass


@router.post('/guest')
async def guest() -> None:
    pass
