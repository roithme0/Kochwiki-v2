from pydantic import BaseModel, ConfigDict, Field


class CustomUserCreate(BaseModel):
    username: str = Field(min_length=1, max_length=50)


class CustomUserUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=1, max_length=50)


class CustomUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
