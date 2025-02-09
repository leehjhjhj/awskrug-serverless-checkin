from typing import Dict, Any, List
import boto3
from contextlib import contextmanager
from datetime import datetime


class TransactionManager:
    def __init__(self, region: str):
        self.client = boto3.client('dynamodb', region_name=region)
        self._transaction_items: List[Dict[str, Any]] = []

    def add_transaction_item(self, item: Dict[str, Any]):
        """
        트랜잭션 아이템을 추가하면서 형식 변환
        """
        if 'Put' in item:
            item['Put']['Item'] = self._serialize_item(item['Put']['Item'])
        elif 'Update' in item:
            item['Update']['Key'] = self._serialize_item(item['Update']['Key'])
            if 'ExpressionAttributeValues' in item['Update']:
                item['Update']['ExpressionAttributeValues'] = self._serialize_item(
                    item['Update']['ExpressionAttributeValues']
                )
        elif 'Delete' in item:
            item['Delete']['Key'] = self._serialize_item(item['Delete']['Key'])

        self._transaction_items.append(item)

    def commit(self):
        if self._transaction_items:
            self.client.transact_write_items(TransactItems=self._transaction_items)
        self._transaction_items.clear()

    def rollback(self):
        self._transaction_items.clear()

    def _serialize_value(self, value: Any) -> Dict[str, Any]:
        """
        값을 DynamoDB 형식으로 변환
        """
        if isinstance(value, str):
            return {'S': value}
        elif isinstance(value, (int, float)):
            return {'N': str(value)}
        elif isinstance(value, bool):
            return {'BOOL': value}
        elif isinstance(value, datetime):
            return {'S': value.isoformat()}
        elif isinstance(value, (list, set)):
            return {'L': [self._serialize_value(v) for v in value]}
        elif isinstance(value, dict):
            return {'M': {k: self._serialize_value(v) for k, v in value.items()}}
        elif value is None:
            return {'NULL': True}
        raise ValueError(f"Unsupported type: {type(value)}")

    def _serialize_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """
        아이템 전체를 DynamoDB 형식으로 변환
        """
        return {k: self._serialize_value(v) for k, v in item.items()}

class TransactionScope:
    def __init__(self, *models, region: str):
        self.models = models
        self.region = region
        
    @contextmanager
    def transaction(self):
        tx_manager = TransactionManager(region=self.region)
        try:
            for model in self.models:
                model.set_transaction_manager(tx_manager)
            yield tx_manager
            tx_manager.commit()
        except Exception as e:
            tx_manager.rollback()
            raise Exception(f"Transaction failed: {str(e)}")
        finally:
            for model in self.models:
                model.set_transaction_manager(None)