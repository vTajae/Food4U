from fastapi import Depends
from app.api.client.spoon_cli import Spoon_AuthClient
from app.api.services.spoon_service import Spoon_Service

# Dependency Injection for Spoon_AuthClient
async def get_spoon_client() -> Spoon_AuthClient:
    """
    Dependency to provide the Spoon_AuthClient instance.
    """
    return Spoon_AuthClient()

# Dependency Injection for Spoon_Service
async def get_spoon_service(
    spoon_client: Spoon_AuthClient = Depends(get_spoon_client)
) -> Spoon_Service:
    """
    Dependency to provide the Spoon_Service instance using Spoon_AuthClient.
    
    
    """
    return Spoon_Service(spoon_client)
