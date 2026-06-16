"""Put `pipeline/` on sys.path so `import tcmpipe` works when pytest runs."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
