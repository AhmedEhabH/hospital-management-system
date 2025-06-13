# Hospital Management System API Documentation

## Overview
RESTful API built with .NET 8 for comprehensive hospital management operations including patient care, medical records, lab reports, messaging, and administrative functions.

## Base URL
- **Development:** `https://localhost:7285/api`

## Architecture
- **.NET 8** Web API with Entity Framework Core
- **SQL Server** database with Code-First approach
- **AutoMapper** for object mapping
- **Serilog** for structured logging
- **JWT Authentication** for security
- **Swagger/OpenAPI** for documentation
- **Repository Pattern** with Dependency Injection
- **Unit & Integration Testing** with xUnit

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```


## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**

```
{
"userId": "string",
"password": "string",
"userType": "Admin|Doctor|Patient"
}
```

**Response:**
```
{
"success": true,
"message": "Login successful.",
"token": "jwt_token_here",
"user": {
"id": 1,
"userId": "admin",
"firstName": "Admin",
"lastName": "User",
"email": "admin@hospital.com",
"userType": "Admin"
}
}
```


#### POST /api/auth/register
Register a new user in the system.

**Request Body:**
```
{
"firstName": "string",
"lastName": "string",
"gender": "Male|Female",
"age": 0,
"userId": "string",
"password": "string",
"email": "string",
"address": "string",
"city": "string",
"state": "string",
"zip": "string",
"phoneNo": "string",
"userType": "Admin|Doctor|Patient"
}
```

### Medical History Endpoints

#### GET /api/medicalhistory/user/{userId}
Get all medical histories for a specific user.

#### GET /api/medicalhistory/{id}
Get specific medical history by ID.

#### POST /api/medicalhistory
Create new medical history record.

#### PUT /api/medicalhistory/{id}
Update existing medical history.

#### DELETE /api/medicalhistory/{id}
Delete medical history record.

### Feedback Endpoints

#### GET /api/feedback/user/{userId}
Get all feedback from a specific user.

#### POST /api/feedback
Submit new feedback.

### Lab Reports Endpoints

#### GET /api/labreports/patient/{patientId}
Get all lab reports for a patient.

#### POST /api/labreports
Create new lab report.

### Messages Endpoints

#### GET /api/messages/inbox/{userId}
Get inbox messages for user.

#### GET /api/messages/sent/{userId}
Get sent messages for user.

#### POST /api/messages
Send new message.

#### PUT /api/messages/mark-as-read/{id}
Mark message as read.

### Hospital Information Endpoints

#### GET /api/hospital
Get all hospital information.

#### POST /api/hospital
Add new hospital information.

## Data Models

### User Model
```
{
"id": 0,
"firstName": "string",
"lastName": "string",
"gender": "string",
"age": 0,
"userId": "string",
"email": "string",
"address": "string",
"city": "string",
"state": "string",
"zip": "string",
"phoneNo": "string",
"userType": "string",
"createdAt": "2025-06-13T00:00:00Z"
}
```

### Medical History Model
```
{
"id": 0,
"userId": 0,
"personalHistory": "string",
"familyHistory": "string",
"allergies": "string",
"frequentlyOccurringDisease": "string",
"hasAsthma": false,
"hasBloodPressure": false,
"hasCholesterol": false,
"hasDiabetes": false,
"hasHeartDisease": false,
"usesTobacco": false,
"cigarettePacksPerDay": 0,
"smokingYears": 0,
"drinksAlcohol": false,
"alcoholicDrinksPerWeek": 0,
"currentMedications": "string"
}
```

## Error Handling
All endpoints return standardized error responses:

```
{
"success": false,
"message": "Error description",
"details": "Additional error details"
}
```

## Status Codes
- **200 OK** - Successful GET, PUT
- **201 Created** - Successful POST
- **204 No Content** - Successful DELETE
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Missing or invalid authentication
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

## Testing
- **Unit Tests:** Comprehensive service and repository testing
- **Integration Tests:** End-to-end API testing
- **Swagger UI:** Interactive API testing at `/swagger`
- **Postman Collection:** Available for import

## Deployment
- **Docker Support:** Containerized deployment
- **CI/CD Pipeline:** Automated testing and deployment
- **Environment Configuration:** Development, staging, production

## Security Features
- JWT token-based authentication
- Role-based authorization (Admin, Doctor, Patient)
- Password hashing with BCrypt
- Input validation and sanitization
- SQL injection prevention
- CORS configuration

## Logging
Structured logging with Serilog:
- Request/response logging
- Error tracking
- Performance monitoring
- Audit trails

## Version History
- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added comprehensive testing suite
- **v1.2.0** - Enhanced security and logging

## Support
For technical support or questions, contact the development team.

---
*Last Updated: June 13, 2025*
*API Version: 1.2.0*
