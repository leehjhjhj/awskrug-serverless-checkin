"""
Common Layer package for AWSKRUG Serverless Check-in
This allows importing from common_layer in local development
while maintaining Lambda Layer compatibility
"""

# Re-export commonly used modules for convenience
# This allows both:
# - from common_layer.model import Event (explicit)
# - from common_layer import Event (convenient)

from common_layer.model import (
    Base,
    Event,
    EventOrganization,
    EventRegistration,
    EventCheckIn,
)

from common_layer.settings import Settings

__all__ = [
    "Base",
    "Event",
    "EventOrganization",
    "EventRegistration",
    "EventCheckIn",
    "Settings",
]
