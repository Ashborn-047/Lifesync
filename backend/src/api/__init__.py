"""
LifeSync Personality Engine - API Module
"""

# Removing app import to avoid circular dependency
# from .server import app
from .config import config, Config

__all__ = ['config', 'Config']
