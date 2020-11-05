# Auth-Service

A JWT token based authentication service. Tokens are signed and verified via key pairs. This service provides a UI to manage the users as well as API's to generate/verify tokens.   
### Docker Setup:
1. Clone the repository
2. Create a Private/Public key pairs and store them under /keys directory (/keys directory needs to be created). 
3. Rename .env.sample to .env.
  a) Provide the database details in .env file
  b) Provide Private/Public key names and modify Ports if required
  c) For SSL, provide cert path   
4. Modify client/nginx/nginx.conf file with ssl cert names and server names.    
4. Run docker-compose up -d   
5. The user interface to manage users should be available at http(s)://<hostname>:<WEB_EXPOSED_PORT> once the application starts up succesfully. 

### Development Setup:
1. Follow steps 1-3
2. run npm install under root
3. Run app.js (nodemon app.js)
4. run npm install under /client
5. run npm start /client
6. The user interface to manage users should be available at http(s)://<hostname>:3003 once the application starts up succesfully. 
  


