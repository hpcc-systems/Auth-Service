# Auth-Service

A JWT token based authentication service. Tokens are signed and verified via key pairs. This service provides a UI to manage the users as well as API's to generate/verify tokens.   
### Docker Setup:
1. Clone the repository
2. Create a Private/Public key pairs and store them under /keys directory (/keys directory needs to be created). 
3. Rename .env.sample to .env.
    a. Provide the database details in .env file
    b. Provide key names and modify Ports if required
    c. For SSL, provide cert path
4. Provide admin account info in /seeders/20190806174641-admin-user.js file    
5. Run docker-compose up -d   
6. The user interface to manage users should be available at http(s)://<hostname>:<WEB_EXPOSED_PORT> once the application starts up succesfully. 

### Development Setup:
1. Follow steps 1-4
2. run npm install under root
3. run npx sequelize-cli db:migrate from root directory to create database schema
4. Run app.js (nodemon app.js)
5. run npm install under /client
6. run npm start /client
7. The user interface to manage users should be available at http(s)://<hostname>:<Port> once the application starts up succesfully. 
