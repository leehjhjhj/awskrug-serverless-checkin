from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, Optional


@dataclass
class LambdaResponse:
    status_code: Optional[int]
    body: Optional[str] = None
    headers: Dict[str, str] = field(default_factory=lambda: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://checkin.awskr.org",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept",
        "Access-Control-Expose-Headers": "x-amzn-RequestId,x-amzn-ErrorType"
    })

    def to_dict(self) -> dict:
        return {
            "statusCode": self.status_code,
            "body": self.body,
            "headers": self.headers
        }