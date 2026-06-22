# AWSKRUG Serverless Attendance System

A serverless attendance tracking system for AWSKRUG meetups using AWS services.
![image](https://github.com/user-attachments/assets/4743cf44-1d92-4683-8939-2cdf919fe6db)


## Features

- QR Code-based attendance check-in system
- Bulk registration via CSV upload
- Real-time attendance tracking
- Individual attendance history tracking
- Automatic event code expiration

## Architecture

### AWS Services Used
- AWS Lambda
- Amazon DynamoDB
- Amazon S3
- Amazon CloudFront
- AWS SAM (Serverless Application Model)

### Database Schema

#### DynamoDB Tables
- **Event Table**: Stores event information
  - Primary Key: event_code (String)
  - Attributes: event_name, event_date_time, code_expired_at, description, qr_url

- **Event Registration Table**: Stores participant registrations
  - Partition Key: event_code (String)
  - Sort Key: phone (String)
  - Attributes: name, email

- **Event Check-in Table**: Records attendance
  - Partition Key: phone (String)
  - Sort Key: event_code (String)
  - Attributes: email, checked_at

## API Endpoints

### Check-in API
- **Endpoint**: POST /check
- **Purpose**: Records attendance for registered participants
- **Request Body**:
  ```json
  {
    "phone": "string",
    "event_code": "string"
  }


## symbolic lint

ln -s common_layer/model.py model.py && ln -s common_layer/settings.py settings.py && ln -s common_layer/db_connection.py db_connection.py && ln -s common_layer/hash_tool.py hash_tool.py && ln -s common_layer/common_schema.py common_schema.py && ln -s common_layer/dynamodb_model.py dynamodb_model.py && ln -s common_layer/transaction_manager.py transaction_manager.py && ln -s common_layer/parameter_store.py parameter_store.py && ln -s common_layer/exceptions exceptions