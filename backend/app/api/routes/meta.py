from fastapi import APIRouter, Response

from app.core.config import get_settings

router = APIRouter()


@router.get("/meta/version", response_class=Response)
def get_version() -> Response:
    return Response(content=get_settings().app_version, media_type="text/plain")
