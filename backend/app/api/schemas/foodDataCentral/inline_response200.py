from pydantic import BaseModel


class InlineResponse200(BaseModel):
    class Config:
        from_attributes = True
