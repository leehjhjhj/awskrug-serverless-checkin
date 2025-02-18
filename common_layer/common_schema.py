from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Dict, Optional
    

class LambdaResponse(BaseModel):
    status_code: Optional[int] = Field(..., serialization_alias="statusCode")
    body: Optional[str] = None
    headers: Dict[str, str] = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://awskrug-sls.com",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept",
        "Access-Control-Expose-Headers": "x-amzn-RequestId,x-amzn-ErrorType"
    }
    
    def to_dict(self) -> dict:
        return self.model_dump(by_alias=True)