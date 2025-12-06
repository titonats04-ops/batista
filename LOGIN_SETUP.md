# Real Login System Setup Guide

## Overview
Your login system has been upgraded from a demo to a real authentication system with MySQL database backend.

## Prerequisites
- XAMPP or local MySQL server running
- PHP 7.0+

## Setup Instructions

### Step 1: Initialize the Database
1. Open a browser and navigate to: `http://localhost/phpmyadmin/`
2. Click on "New" to create a new database OR
3. Run the setup script by going to: `http://localhost/webdev/setup_db.php`

The setup script will:
- Create a `webdev_db` database
- Create a `users` table with proper schema
- Insert a demo user account (optional)

### Step 2: Database Configuration
Edit `config.php` if your MySQL credentials differ:
- DB_HOST: localhost (default)
- DB_USER: root (default for XAMPP)
- DB_PASS: empty string (default for XAMPP)
- DB_NAME: webdev_db

### Step 3: Demo User Login
Once setup is complete, you can login with:
- **Email**: demo@example.com
- **Password**: demo1234

### Step 4: Create New Users (Optional)
Create new user records in MySQL:
```sql
INSERT INTO users (email, username, password_hash, full_name) 
VALUES ('user@example.com', 'username', '[hashed_password]', 'Full Name');
```

Use PHP's `password_hash()` to generate hashed passwords:
```php
echo password_hash('your_password', PASSWORD_BCRYPT);
```

## API Endpoints

### POST `/api_login.php`
Authenticates a user with email/username and password.
- **Request**: `{ "identifier": "email@example.com", "password": "password" }`
- **Response**: `{ "success": true, "user": {...} }`

### POST `/api_logout.php`
Logs out the current user and destroys the session.

### GET `/api_check_session.php`
Checks if a user is currently logged in.
- **Response**: `{ "success": true, "logged_in": true/false, "user": {...} }`

## Files Added
- `config.php` - Database configuration
- `setup_db.php` - Database initialization script
- `api_login.php` - Login endpoint
- `api_logout.php` - Logout endpoint
- `api_check_session.php` - Session check endpoint

## Security Features
- Passwords are hashed using bcrypt (PASSWORD_BCRYPT)
- Sessions are handled server-side
- User credentials are only sent via POST (not stored in localStorage permanently)
- Basic input validation

## Next Steps
1. Run the setup script at http://localhost/webdev/setup_db.php
2. Test login with demo credentials
3. Create additional user accounts as needed
4. Consider adding password reset functionality
5. Add email verification for new signups

## Troubleshooting

**"Database connection failed" error:**
- Make sure MySQL is running
- Check credentials in config.php
- Verify database name matches

**"Invalid email/username or password" on correct credentials:**
- Run setup_db.php again to recreate the users table
- Check that the password was hashed with PASSWORD_BCRYPT

**Session not persisting:**
- Ensure session.save_path is writable by PHP
- Check browser cookie settings
