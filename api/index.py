import os
import sys

# Add backend directory to sys.path so modules (agents, services, models, config) import cleanly
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from backend.main import app as app
