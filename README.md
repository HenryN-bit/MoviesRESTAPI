```markdown
# Movies REST API

## Overview
This REST API was developed as part of the CAB230 Web Computing unit at Queensland University of Technology (QUT). It provides endpoints for retrieving movie and people information, user authentication and access to protected resources.

This Express REST API provides the backend services for the Movies React Web Application. It is responsible for handling movie and people data, user authentication and communication with a MySQL database through RESTful API endpoints.

The React Movie Web Application communicates with this API to retrieve movie information, authenticate users using JSON Web Tokens (JWT) and access protected endpoints.

## Technologies Used

- Node.js
- Express
- MySQL
- Knex
- JWT Authentication
- Swagger
- HTTPS

## Features

- Search movies
- View movie details
- View people details
- User registration
- User login
- JWT authentication
- Protected API endpoints

## Database
The API connects to a local MySQL database restored using the provided `dump.sql` file.

## Running the Full Application
This API is designed to work with the Movies React Web Application, which is maintained in a separate repository.

To run the full application:
1. Clone both repositories (or download them as zip files).
2. Install the dependencies for each project.

**Movies REST API dependencies**:
```bash
npm install
```

**Movies React Web Application dependencies**:
```bash
npm install
```

3. Start the Movies REST API.

```bash
npm run dev
```

4. In a separate terminal, navigate to the Movies React Web Application directory and start the frontend.
```bash
npm run dev
```

## Running the API

If you only want to run the backend API:

1. Install the dependencies
```bash
npm install
```
2. Start the API
```bash
`npm run dev`
```

3. To open the Swagger UI:
https://localhost:3000
```