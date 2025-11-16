"""
LifeSync Personality Engine - Provider Failure Exception
"""


class ProviderFailure(Exception):
    """Exception raised when an LLM provider fails after all retries"""
    
    def __init__(self, provider_name: str, model_name: str, error: Exception, retries: int):
        self.provider_name = provider_name
        self.model_name = model_name
        self.original_error = error
        self.retries = retries
        message = f"{provider_name} ({model_name}) failed after {retries} retries: {str(error)}"
        super().__init__(message)

