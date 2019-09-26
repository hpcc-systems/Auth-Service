# Auth-Service

A JWT token based authentication service. Tokens are signed and verified via key pairs. This service provides a UI to manage the users as well as API's to generate/verify tokens.   

1. Clone the repository
2. Create a Private/Public key pairs and place it under keys directory
3. Rename .env.sample to .env.
4. Provide the database details in .env file
5. npm install
6. Run app.js (nodemon app.js)
7. To run as Docker container - docker-compose up -d
8. The user interface to manage users should be available at http(s)://<hostname>:3003 once the application starts up succesfully. 
