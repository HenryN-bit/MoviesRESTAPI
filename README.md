# Movies REST API

## Overview
The Movies REST API was developed as an academic project for the CAB230 Web Computing unit at Queensland University of Technology (QUT). It provides endpoints for retrieving movie and people information, user authentication using JSON Web Tokens (JWT) and access to protected resources.

It is the backend component of the Movies React Web Application developed using Express and MySQL. It is responsible for handling movie and people data, user authentication and communication with a MySQL database through RESTful API endpoints.

It communicates with the companion Movies React Web Application, which is maintained in the **MoviesReactWebApplication** repository.

## Note

This API runs over HTTPS using a self-signed certificate for local development. When accessing https://localhost:3000 for the first time, your browser will show a security warning (e.g. "Your connection is not private"). This is expected, click "Advanced" and then "Proceed to localhost (unsafe)" (wording varies by browser) to continue. This warning only appears because the certificate isn't issued by a public certificate authority; it does not indicate any actual security issue on your local machine.

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

## Setup

On the Movies REST API:

1. Copy .env.example to .env
2. Generate a JWT secret through the terminal/Command Prompt and add it to .env
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
3. Copy the output into the JWT_SECRET value in your .env file
4. Fill in your own MySQL database credentials in .env (DB_USER, DB_PASSWORD)
5. Install dependencies:

```text
npm install
```

## Database
The API connects to a local MySQL database restored using the provided `dump.sql` file.
Run this after creating an empty movies database in MySQL and before starting the server. 

```text
mysql -u root -p movies < dump.sql
```

## Running the Full Application

This API is designed to work with the **Movies React Web Application**, which is maintained in the **MoviesReactWebApplication** repository.

Clone both repositories **or** download them as zip files.

After completing Setup and Database above: 

1. Start the **Movies REST API** in the Movies REST API directory in terminal/Command Prompt:

```bash
npm run dev
```

2. Navigate to the **Movies React Web Application directory** and start the frontend in the terminal/Command Prompt.

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
npm run dev
```

3. To open the Swagger UI:
```text
https://localhost:3000