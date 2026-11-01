from fastapi import Depends
from app.api.client.fdc_cli import FDC_AuthClient
from app.api.services.fdc.fdc_service import FDC_Service

# Dependency Injection for FDC_AuthClient
async def get_fdc_client() -> FDC_AuthClient:
    """
    Dependency to provide the FDC_AuthClient instance.
    """
    return FDC_AuthClient()

# Dependency Injection for FDC_Service
async def get_fdc_service(fdc_client: FDC_AuthClient = Depends(get_fdc_client)) -> FDC_Service:
    """
    Dependency to provide the FDC_Service instance using FDC_AuthClient.
    """
    return FDC_Service(fdc_client)
