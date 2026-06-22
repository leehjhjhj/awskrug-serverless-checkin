"""
Data Migration Script from DynamoDB to AWS DSQL (PostgreSQL)
"""
import boto3
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
from typing import List, Dict, Any
import os
from decimal import Decimal


class DynamoDBToAWSDSQLMigrator:
    def __init__(self,
                 dynamodb_table_prefix: str,
                 dsql_connection_string: str):
        """
        Initialize the migrator

        Args:
            dynamodb_table_prefix: Prefix for DynamoDB tables
            dsql_connection_string: PostgreSQL connection string for AWS DSQL
        """
        self.dynamodb = boto3.resource('dynamodb')
        self.table_prefix = dynamodb_table_prefix
        self.conn = psycopg2.connect(dsql_connection_string)
        self.cursor = self.conn.cursor()

    def convert_dynamodb_to_python(self, value: Any) -> Any:
        """Convert DynamoDB types to Python types"""
        if isinstance(value, Decimal):
            return float(value)
        return value

    def migrate_event_organizations(self, table_name: str):
        """Migrate EventOrganization data"""
        print(f"Migrating {table_name}...")
        table = self.dynamodb.Table(table_name)

        response = table.scan()
        items = response['Items']

        # Handle pagination
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response['Items'])

        if not items:
            print(f"No items found in {table_name}")
            return

        data = []
        for item in items:
            # Convert list to comma-separated string for AWS DSQL
            event_versions = item.get('event_version', [])
            if isinstance(event_versions, list):
                event_version_str = ','.join(event_versions)
            else:
                event_version_str = str(event_versions)

            data.append((
                item.get('partition_key'),  # organization_code
                item.get('organization_name'),
                item.get('logo_url'),
                event_version_str  # Comma-separated string
            ))

        sql = """
            INSERT INTO event_organization
            (organization_code, organization_name, logo_url, event_version)
            VALUES %s
            ON CONFLICT (organization_code) DO UPDATE SET
                organization_name = EXCLUDED.organization_name,
                logo_url = EXCLUDED.logo_url,
                event_version = EXCLUDED.event_version,
                updated_at = CURRENT_TIMESTAMP
        """
        execute_values(self.cursor, sql, data)
        self.conn.commit()
        print(f"Migrated {len(data)} event organizations")

    def migrate_events(self, table_name: str):
        """Migrate Event data"""
        print(f"Migrating {table_name}...")
        table = self.dynamodb.Table(table_name)

        response = table.scan()
        items = response['Items']

        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response['Items'])

        if not items:
            print(f"No items found in {table_name}")
            return

        data = []
        for item in items:
            data.append((
                item.get('partition_key'),  # event_code
                self._parse_datetime(item.get('event_date_time')),
                item.get('description'),
                item.get('event_name'),
                item.get('qr_url'),
                self._parse_datetime(item.get('code_expired_at')),
                item.get('event_version'),
                item.get('organization_code')
            ))

        sql = """
            INSERT INTO event
            (event_code, event_date_time, description, event_name, qr_url,
             code_expired_at, event_version, organization_code)
            VALUES %s
            ON CONFLICT (event_code) DO UPDATE SET
                event_date_time = EXCLUDED.event_date_time,
                description = EXCLUDED.description,
                event_name = EXCLUDED.event_name,
                qr_url = EXCLUDED.qr_url,
                code_expired_at = EXCLUDED.code_expired_at,
                event_version = EXCLUDED.event_version,
                organization_code = EXCLUDED.organization_code,
                updated_at = CURRENT_TIMESTAMP
        """
        execute_values(self.cursor, sql, data)
        self.conn.commit()
        print(f"Migrated {len(data)} events")

    def migrate_event_registrations(self, table_name: str):
        """Migrate EventRegistration data"""
        print(f"Migrating {table_name}...")
        table = self.dynamodb.Table(table_name)

        response = table.scan()
        items = response['Items']

        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response['Items'])

        if not items:
            print(f"No items found in {table_name}")
            return

        data = []
        for item in items:
            data.append((
                item.get('partition_key'),  # event_code
                item.get('sort_key'),  # phone
                item.get('name')
            ))

        sql = """
            INSERT INTO event_registration
            (event_code, phone, name)
            VALUES %s
            ON CONFLICT (event_code, phone) DO UPDATE SET
                name = EXCLUDED.name,
                updated_at = CURRENT_TIMESTAMP
        """
        execute_values(self.cursor, sql, data)
        self.conn.commit()
        print(f"Migrated {len(data)} event registrations")

    def migrate_event_checkins(self, table_name: str):
        """Migrate EventCheckIn data with denormalized organization_code"""
        print(f"Migrating {table_name}...")

        # First, get event information for denormalization
        print("Loading event-to-organization mapping...")
        self.cursor.execute("""
            SELECT event_code, organization_code
            FROM event
        """)
        event_to_org = {row[0]: row[1] for row in self.cursor.fetchall()}

        table = self.dynamodb.Table(table_name)

        response = table.scan()
        items = response['Items']

        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response['Items'])

        if not items:
            print(f"No items found in {table_name}")
            return

        data = []
        skipped = 0
        for item in items:
            event_code = item.get('sort_key')  # event_code

            # Get organization_code for denormalization
            if event_code not in event_to_org:
                print(f"Warning: Event {event_code} not found in event table, skipping check-in")
                skipped += 1
                continue

            organization_code = event_to_org[event_code]
            data.append((
                item.get('partition_key'),  # phone
                event_code,  # event_code
                item.get('name'),
                self._parse_datetime(item.get('checked_at')),
                item.get('event_version'),
                organization_code  # organization_code (denormalized)
            ))

        if skipped > 0:
            print(f"Skipped {skipped} check-ins due to missing event information")

        if not data:
            print("No valid check-in data to migrate")
            return

        sql = """
            INSERT INTO event_check_in
            (phone, event_code, name, checked_at, event_version, organization_code)
            VALUES %s
            ON CONFLICT (phone, event_code) DO UPDATE SET
                name = EXCLUDED.name,
                checked_at = EXCLUDED.checked_at,
                event_version = EXCLUDED.event_version,
                organization_code = EXCLUDED.organization_code
        """
        execute_values(self.cursor, sql, data)
        self.conn.commit()
        print(f"Migrated {len(data)} event check-ins")

    def _parse_datetime(self, value: Any) -> datetime:
        """Parse datetime from DynamoDB format"""
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            # Try different datetime formats
            try:
                return datetime.fromisoformat(value.replace('Z', '+00:00'))
            except:
                return datetime.strptime(value, '%Y-%m-%d %H:%M:%S')
        return value

    def migrate_all(self,
                   org_table: str = None,
                   event_table: str = None,
                   registration_table: str = None,
                   checkin_table: str = None):
        """
        Migrate all tables

        Args:
            org_table: EventOrganization table name
            event_table: Event table name
            registration_table: EventRegistration table name
            checkin_table: EventCheckIn table name
        """
        try:
            # Migrate in order to respect logical relationships
            if org_table:
                self.migrate_event_organizations(org_table)

            if event_table:
                self.migrate_events(event_table)

            if registration_table:
                self.migrate_event_registrations(registration_table)

            if checkin_table:
                self.migrate_event_checkins(checkin_table)

            print("Migration completed successfully!")

        except Exception as e:
            print(f"Migration failed: {str(e)}")
            self.conn.rollback()
            raise
        finally:
            self.cursor.close()
            self.conn.close()


if __name__ == "__main__":
    # Configuration
    DYNAMODB_TABLE_PREFIX = os.getenv('DYNAMODB_TABLE_PREFIX', 'awskrug-')
    DSQL_CONNECTION_STRING = os.getenv('DSQL_CONNECTION_STRING')

    if not DSQL_CONNECTION_STRING:
        raise ValueError("DSQL_CONNECTION_STRING environment variable is required")

    # Initialize migrator
    migrator = DynamoDBToAWSDSQLMigrator(
        dynamodb_table_prefix=DYNAMODB_TABLE_PREFIX,
        dsql_connection_string=DSQL_CONNECTION_STRING
    )

    # Run migration
    # Update these table names to match your actual DynamoDB table names
    migrator.migrate_all(
        org_table='EventOrganization',  # Update with actual table name
        event_table='Event',  # Update with actual table name
        registration_table='EventRegistration',  # Update with actual table name
        checkin_table='EventCheckIn'  # Update with actual table name
    )
