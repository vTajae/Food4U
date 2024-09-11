from pydantic import BaseModel


class InlineResponse200(BaseModel):
    class Config:
        orm_mode = True
