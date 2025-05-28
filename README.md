# SvinChat

SvinChat is a modern, feature-rich chat application built with Node.js and Express. It combines simplicity with powerful functionality, making it an excellent choice for both personal and community use. The application is designed with scalability in mind and includes support for user authentication, real-time messaging, and a clean user interface.

## Features

- **User Authentication**: Secure login and registration system using Passport.js
- **Real-Time Messaging**: Efficient communication using long polling
- **Markdown Support**: Format your messages with Markdown syntax
- **File Uploads**: Share files with other users
- **Session Management**: Persistent sessions using PostgreSQL
- **Docker Support**: Easy deployment for both development and production environments
- **Admin Interface**: Access to Adminer for database management

## Prerequisites

Before you start, ensure you have the following installed on your system:

- Docker
- Docker Compose
- Node.js

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/gugdun/svin-chat.git
    cd svin-chat
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file using the example below:
    ```env
    SESSION_SECRET=...
    MESSAGE_SECRET=...
    COOKIE_MAX_AGE=2592000000
    POSTGRES_DB=db
    POSTGRES_PASSWORD=password
    POSTGRES_CONNECTION=postgres://postgres:password@postgres:5432/db
    ```

## Running SvinChat

### Development Environment

To start SvinChat in development mode with Docker Compose:

```bash
docker compose --profile dev up -d
```

This will start the application and automatically rebuild when changes are detected.

### Production Environment

For production deployment:

```bash
docker compose --profile prod up -d
```

### Accessing the Application

- **SvinChat**: `http://localhost:3000`
- **Adminer**: `http://localhost:5000`

## License

Copyright (c) 2025 gugdun

All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, modification, or use of this code, via any medium, is strictly prohibited.

The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the author or copyright holder be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.
