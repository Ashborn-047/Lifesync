"""
LifeSync Personality Engine - Configuration
Loads environment variables and provides configuration settings
"""

import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
# Handle BOM (Byte Order Mark) that Windows editors sometimes add
import codecs
env_path = ".env"
if os.path.exists(env_path):
    # Read file and remove BOM if present
    with open(env_path, 'rb') as f:
        content = f.read()
        if content.startswith(codecs.BOM_UTF8):
            content = content[len(codecs.BOM_UTF8):]
            # Write back without BOM
            with open(env_path, 'wb') as fw:
                fw.write(content)

load_dotenv()


class Config:
    """Configuration class for LifeSync Personality Engine"""
    
    # Supabase Configuration
    # Load and clean values (handle quotes and whitespace)
    def _clean_env_value(key: str) -> str:
        value = os.getenv(key, "") or ""
        # Remove quotes and whitespace, handle multi-line values
        value = value.replace('\n', '').replace('\r', '').strip().strip('"').strip("'")
        return value
    
    SUPABASE_URL: str = _clean_env_value("SUPABASE_URL")
    SUPABASE_KEY: str = _clean_env_value("SUPABASE_KEY")
    SUPABASE_SERVICE_ROLE: str = _clean_env_value("SUPABASE_SERVICE_ROLE")
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Gemini Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Grok Configuration
    GROK_API_KEY: str = os.getenv("GROK_API_KEY", "")
    
    # LLM Provider Configuration
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini").lower()
    
    # API Configuration
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_RELOAD: bool = os.getenv("API_RELOAD", "false").lower() == "true"
    
    # LLM Configuration
    DEFAULT_LLM_MODEL: str = os.getenv("DEFAULT_LLM_MODEL", "gpt-4")
    DEFAULT_GEMINI_MODEL: str = os.getenv("DEFAULT_GEMINI_MODEL", "gemini-2.0-flash-exp")
    
    @classmethod
    def validate(cls) -> tuple:
        """
        Validate that required environment variables are set.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        required_vars = {
            "SUPABASE_URL": cls.SUPABASE_URL,
            "SUPABASE_KEY": cls.SUPABASE_KEY
        }
        
        missing = [var for var, value in required_vars.items() if not value or value.startswith("your-") or value.startswith("sk-YOUR") or "your-project" in value]
        
        if missing:
            return False, f"Missing or placeholder environment variables: {', '.join(missing)}"
        
        return True, None
    
    @classmethod
    def get_supabase_url(cls) -> str:
        """Get Supabase URL"""
        return cls.SUPABASE_URL
    
    @classmethod
    def get_supabase_key(cls, use_service_role: bool = False) -> str:
        """
        Get Supabase key (anon or service role).
        
        Args:
            use_service_role: If True, return service role key; otherwise return anon key
        
        Returns:
            Supabase API key
        """
        if use_service_role:
            return cls.SUPABASE_SERVICE_ROLE or cls.SUPABASE_KEY
        return cls.SUPABASE_KEY
    
    
    @classmethod
    def get_gemini_key(cls) -> str:
        """Get Gemini API key"""
        return cls.GEMINI_API_KEY


# Global config instance
config = Config()

