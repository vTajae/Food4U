from pydantic import BaseModel
from typing import Type, TypeVar

T = TypeVar('T', bound='Model')

class Model(BaseModel):
    # Pydantic automatically provides validation and serialization

    @classmethod
    def from_dict(cls: Type[T], dikt: dict) -> T:
        """Creates a model instance from a dictionary."""
        return cls(**dikt)  # Pydantic allows instantiation with dicts

    def to_dict(self) -> dict:
        """Returns the model as a dictionary."""
        return self.model_dump()

    def to_str(self) -> str:
        """Returns the string representation of the model."""
        return str(self)

    def __repr__(self) -> str:
        """For `print` and `pprint`."""
        return self.to_str()

    def __eq__(self, other) -> bool:
        """Compares two Pydantic model instances."""
        return self.model_dump() == other.model_dump() if isinstance(other, self.__class__) else False

    def __ne__(self, other) -> bool:
        """Checks if two objects are not equal."""
        return not self.__eq__(other)
