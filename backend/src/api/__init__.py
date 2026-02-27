"""
LifeSync Personality Engine - API Module
"""

# Removing app import to avoid circular dependency
# from .server import app
from .config import Config, config

__all__ = ['config', 'Config']
