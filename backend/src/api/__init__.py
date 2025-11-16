"""
LifeSync Personality Engine - API Module
"""

from .server import app
from .config import config, Config

__all__ = ['app', 'config', 'Config']
