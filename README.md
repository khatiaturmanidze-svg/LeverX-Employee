<<<<<<< HEAD
The feature includes:

- Request creation form
- Form validation
- Integration with backend API
- User authentication check
- Error handling for invalid inputs

## Running the Project

Start Backend

- npm run start -w @mono/backend
  Start Frontend
- npm run dev -w @mono/frontend

## Test User Credentials

Use the following credentials to log in:
Email: anno.hideaki@leverx.com
Password: password11

to test sending request log in with:
manager credentials:
Email: misato.katsuragi@leverx.com
Password: password4
managed employee:
Email: pen.pen@leverx.com
Password: password9
=======
# setup and installation

### install dependencies

npm i

### configure env variables

Create a `.env` file in the root directory and define the following variables:
`VITE_API_PORT` -> The port the backend server runs on
`VITE_API_TARGET` -> The full URL the frontend proxies to
`VITE_AUTH_TOKEN` -> Static token for API authorization
`BCRYPT_SALT_ROUNDS` -> Cost factor for password hashing
`DATABASE_PATH` -> Relative path to the JSON database
`VITE_TEST_USER_EMAIL` -> Email for the auto-generated Admin
`VITE_TEST_USER_PASSWORD` -> Password for the auto-generated Admin

### database

- on the first run, the program will automatically generate a fresh db.json file (ignored by Git)
- send the database with they test user credentials defined in your .env (the role of test user is 'admin' by default)

# scripts to run from root directory

- npm run dev -> builds the project, then starts the frontend and backend in parallel
>>>>>>> da2c56d66358c35e8f74e5b59f0a51bd2d5e93df
