# Login Request/Response Logging Implementation

This document describes the comprehensive logging system implemented for the authentication endpoints in the Plutex Backend.

## 📋 Overview

The logging system captures detailed information about login requests and responses across multiple layers:

1. **Controller Layer** (`AuthController`) - HTTP request/response logging
2. **Service Layer** (`AuthService`) - Business logic and authentication flow logging  
3. **Data Layer** (`UsersService`) - Database query logging

## 🔍 What Gets Logged

### Incoming Requests
- **Request ID**: Unique identifier for tracing
- **Email**: User's login email
- **IP Address**: Client IP address
- **User Agent**: Client browser/application information
- **Timestamp**: ISO timestamp of request
- **Password**: Redacted as `[REDACTED]` for security

### Authentication Process
- **User Lookup**: Database query attempts and results
- **User Details**: ID, role, status, creation date
- **Password Verification**: Success/failure of password comparison
- **Password Hash**: First 10 characters (for debugging, safely truncated)
- **Database Performance**: Query execution time

### Token Generation
- **Token Creation**: JWT payload and generation process
- **Token Metadata**: Token lengths and previews
- **Performance**: Token generation duration

### Responses
- **Success Responses**: User details, token availability, response duration
- **Error Responses**: Error messages, stack traces, failure reasons
- **Performance Metrics**: Total request processing time

## 🏷️ Log Levels

### LOG (Info)
- High-level request/response summaries
- Success/failure outcomes
- Key business events

```
[AuthController] LOGIN REQUEST - Email: user@example.com, IP: 192.168.1.1
[AuthService] Login successful for user: user123, email: user@example.com, role: CUSTOMER
```

### DEBUG (Detailed)
- Full request/response objects
- Step-by-step processing details
- Performance metrics
- Token and user metadata

```
[AuthService] User found - ID: user123, Status: ACTIVE, Role: CUSTOMER
[AuthService] Password verification successful for user: user123
[UsersService] User details: {id: "user123", role: "CUSTOMER", hasPassword: true}
```

### WARN (Warnings)
- Authentication failures
- Invalid credentials
- Business logic warnings

```
[AuthService] User not found for email: invalid@example.com
[AuthService] Invalid password for user: user123, email: user@example.com
```

### ERROR (Errors)
- Exceptions and stack traces
- Database errors
- System failures

```
[AuthService] Login failed for email: user@example.com, Error: Invalid credentials
[UsersService] Error finding user by email: user@example.com
```

## 🆔 Request Tracing

Each login attempt gets a unique request ID that appears in all related log entries:

```
[req_1703123456789_abc123def] LOGIN REQUEST - Email: user@example.com
[login_1703123456790_xyz789] AuthService.login() - Starting login process
[query_1703123456791_def456] UsersService.findByEmail() - Searching for user
[token_1703123456792_ghi789] Generating tokens for user: user123
[req_1703123456789_abc123def] LOGIN SUCCESS - Duration: 245ms
```

## 🛠️ Usage

### Running the Backend with Logging
```bash
cd plutex-backend
npm run start:dev
```

### Testing the Logging System
```bash
# Run the test script to generate various login scenarios
node test-login-logs.js

# Or get help
node test-login-logs.js --help
```

### Viewing Logs
The logs appear in your backend console output. Different log levels can be controlled by NestJS configuration.

## 🔒 Security Considerations

- **Passwords**: Never logged in plain text, always shown as `[REDACTED]`
- **Tokens**: Only metadata logged (length, preview), not full tokens
- **Personal Data**: User emails are logged for debugging but should be monitored
- **IP Addresses**: Logged for security monitoring
- **Stack Traces**: Include full error details for debugging

## 📊 Log Examples

### Successful Login
```
[AuthController] [req_1703123456789_abc123def] LOGIN REQUEST - Email: john@example.com, IP: 192.168.1.100, User-Agent: Mozilla/5.0...
[AuthService] [login_1703123456790_xyz789] AuthService.login() - Starting login process for email: john@example.com
[UsersService] [query_1703123456791_def456] UsersService.findByEmail() - Searching for user with email: john@example.com  
[UsersService] [query_1703123456791_def456] User found - ID: user_john_123, Role: CUSTOMER, Status: ACTIVE, Query duration: 15ms
[AuthService] [login_1703123456790_xyz789] Password verification successful for user: user_john_123
[AuthService] [token_1703123456792_ghi789] Generating tokens for user: user_john_123, email: john@example.com, role: CUSTOMER
[AuthService] [token_1703123456792_ghi789] Tokens generated - AccessToken length: 180, RefreshToken length: 185
[AuthService] [login_1703123456790_xyz789] Login successful for user: user_john_123, email: john@example.com, role: CUSTOMER
[AuthController] [req_1703123456789_abc123def] LOGIN SUCCESS - User ID: user_john_123, Email: john@example.com, Duration: 89ms
```

### Failed Login (Invalid Password)
```
[AuthController] [req_1703123456800_def456] LOGIN REQUEST - Email: john@example.com, IP: 192.168.1.100
[AuthService] [login_1703123456801_abc789] AuthService.login() - Starting login process for email: john@example.com
[UsersService] [query_1703123456802_xyz123] User found - ID: user_john_123, Role: CUSTOMER, Status: ACTIVE, Query duration: 12ms  
[AuthService] [login_1703123456801_abc789] Invalid password for user: user_john_123, email: john@example.com
[AuthService] [login_1703123456801_abc789] Login failed for email: john@example.com, Error: Invalid credentials
[AuthController] [req_1703123456800_def456] LOGIN FAILED - Email: john@example.com, Error: Invalid credentials, Duration: 67ms
```

### Failed Login (User Not Found)
```
[AuthController] [req_1703123456850_ghi789] LOGIN REQUEST - Email: nonexistent@example.com, IP: 192.168.1.100
[AuthService] [login_1703123456851_def123] AuthService.login() - Starting login process for email: nonexistent@example.com
[UsersService] [query_1703123456852_abc456] UsersService.findByEmail() - Searching for user with email: nonexistent@example.com
[UsersService] [query_1703123456852_abc456] No user found for email: nonexistent@example.com, Query duration: 8ms
[AuthService] [login_1703123456851_def123] User not found for email: nonexistent@example.com
[AuthService] [login_1703123456851_def123] Login failed for email: nonexistent@example.com, Error: Invalid credentials  
[AuthController] [req_1703123456850_ghi789] LOGIN FAILED - Email: nonexistent@example.com, Error: Invalid credentials, Duration: 45ms
```

## 🛡️ Privacy & Compliance

When using this logging system in production:

1. **Data Retention**: Ensure logs are rotated and old logs are purged
2. **Access Control**: Restrict access to logs containing personal data
3. **Monitoring**: Set up alerts for suspicious login patterns
4. **Compliance**: Review logging practices against GDPR/privacy requirements
5. **Encryption**: Consider encrypting logs at rest if they contain sensitive data

## 🚀 Production Considerations

- Configure appropriate log levels for production (typically INFO and above)
- Set up log aggregation (e.g., ELK stack, CloudWatch)
- Implement log rotation to manage disk space
- Add structured logging for better parsing
- Consider performance impact of detailed logging