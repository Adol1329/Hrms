# Employment Management System

A comprehensive employee management system built with Spring Boot and PostgreSQL.

## Features

### Authentication & Security
- Role-based authentication (Admin and User roles)
- Two-factor authentication
- Email verification
- Password reset functionality
- JWT-based security

### Admin Dashboard
- Summary statistics (total employees, active contracts, departments)
- Recent hires
- Upcoming contract expirations
- Quick action buttons
- Department distribution charts

### Employee Management
- List of all employees with search/filter options
- Add/Edit/Delete employee functionality
- View employee details (personal info, position, department)
- Export to CSV/Excel option

### Department & Position Management
- Department list with employee counts
- Add/Edit/Delete departments
- Position hierarchy view
- Position details and requirements

### Contract Management
- Active/Expired/Terminated contracts view
- Contract renewal/termination interface
- Bulk contract operations
- Contract templates

### Salary Administration
- Salary overview by department/position
- Adjust base salaries/bonuses/deductions
- Salary history per employee
- Payroll generation tools

### User Dashboard
- Personal profile management
- Employment details view
- Salary & benefits information
- Time off requests

## Technical Features
- Global search functionality
- Pagination for all list views
- File upload support
- Email notifications
- Audit logging
- Responsive design

## Setup

### Prerequisites
- Java 17
- PostgreSQL
- Maven

### Database Setup
1. Create a PostgreSQL database:
```sql
CREATE DATABASE employment_management;
```

2. Update database configuration in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/employment_management
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Email Configuration
1. Update email configuration in `src/main/resources/application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-specific-password
```

### JWT Configuration
1. Update JWT configuration in `src/main/resources/application.properties`:
```properties
jwt.secret=your-256-bit-secret-key-here
jwt.expiration=86400000
```

### Admin Configuration
1. Update admin key in `src/main/resources/application.properties`:
```properties
admin.key=your-admin-key
```

### Building and Running
1. Build the project:
```bash
mvn clean install
```

2. Run the application:
```bash
mvn spring-boot:run
```

The application will be available at `http://localhost:8080`

## API Documentation

### Authentication Endpoints
- POST `/api/auth/register` - Register new user
- POST `/api/auth/verify-email` - Verify email
- POST `/api/auth/login` - Login with 2FA
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password

### Employee Endpoints
- GET `/api/employees` - List all employees
- POST `/api/employees` - Create employee
- GET `/api/employees/{id}` - Get employee details
- PUT `/api/employees/{id}` - Update employee
- DELETE `/api/employees/{id}` - Delete employee

### Department Endpoints
- GET `/api/departments` - List all departments
- POST `/api/departments` - Create department
- GET `/api/departments/{id}` - Get department details
- PUT `/api/departments/{id}` - Update department
- DELETE `/api/departments/{id}` - Delete department

### Contract Endpoints
- GET `/api/contracts` - List all contracts
- POST `/api/contracts` - Create contract
- GET `/api/contracts/{id}` - Get contract details
- PUT `/api/contracts/{id}` - Update contract
- DELETE `/api/contracts/{id}` - Delete contract

### Search Endpoints
- GET `/api/search/global` - Global search
- GET `/api/search/employees` - Search employees
- GET `/api/search/departments` - Search departments
- GET `/api/search/contracts` - Search contracts
- GET `/api/search/positions` - Search positions

### Dashboard Endpoints
- GET `/api/dashboard/admin/summary` - Admin dashboard summary
- GET `/api/dashboard/user/summary` - User dashboard summary
- GET `/api/dashboard/admin/recent-activities` - Recent activities
- GET `/api/dashboard/admin/upcoming-events` - Upcoming events

## Security

- All endpoints except authentication endpoints require JWT authentication
- Admin endpoints require ADMIN role
- User endpoints require authenticated user
- Passwords are encrypted using BCrypt
- Two-factor authentication using TOTP
- Email verification required for new accounts
- Password reset via email
- JWT token expiration
- CORS configuration
- CSRF protection disabled for stateless API

## Frontend Development

The frontend should be developed as a separate application using a modern framework like React or Angular. The backend provides all necessary APIs with proper CORS configuration to support this architecture.

Key frontend features to implement:
1. Responsive design
2. Light/dark mode
3. Interactive dashboard charts
4. Real-time notifications
5. Form validation
6. File upload interface
7. Search with autocomplete
8. Pagination controls
9. Sorting and filtering
10. Export functionality 