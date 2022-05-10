# Auth-Service

A JWT token based authentication service. Tokens are signed and verified via key pairs. This service provides a UI to manage the users as well as API's to generate/verify tokens.

### Docker Setup:

1. Clone the repository
2. Create a Private/Public key pairs and using tools like openssl and  store them under /keys directory (Public key must be a .pem file). This key pair will be used to sign the auth token
   1. To create private key run `openssl genrsa -out ./private_key 4096` 
   2. To extract private key run `openssl rsa -in private_key -pubout -outform PEM -out public_key.pem`
3. Rename .env.sample to .env.
4. Open the .env file and update necessary values. 
    > **Important**: If you are not sure what values to enter, refer the comments on each section.
    Change the SSL related variables only if you are using SSL. If not using SSL, you don't have to change.
5. To enable SSL for AuthService URL, provide CERT_PATH value and update nginx config, 
    - Go to `client/nginx/conf.d/nginx.conf.template` fill in corresponding values on line 4 and 5.
    - If you do not use SSL, comment out line 3, 4, 5 in `client/nginx/conf.d/nginx.conf.template` and un-comment line 2.
4. Run `docker-compose up -d`
5. The user interface to manage users should be available at http(s)://<hostname>:<WEB_EXPOSED_PORT> once the application starts up successfully.
6. Log into the application with username : 'admin' and the password you have specified in the .env file.

### Development Setup:

1. Follow steps 1-4
2. We have created an NPM script to install all the necessary dependencies and launch the app, to run the script execute the command `npm run bootstrap` it will install server and client dependencies,
 create `authservice` schema in your database and populate it with all the tables and seed data.You can also run each script separately by executing `npm run [script name]`.
   > **WARNING**: This action will override `authservice` schema if already exists! If you like to change the name of the schema, please update the .env file DB_NAME value as well as 
   package.json scripts "createSchema" and "migrations" with the new schema name.

3. Once the installations are done, you can start the app. To start the app with UI run command `npm run auth`, it will start the server and front end app at the same time.
To start the server only, run `npm run dev`.
4. The user interface to manage users should be available at http(s)://<hostname>:<Port> once the application starts up successfully.
5. Log into the application with username : 'admin' and the password you have specified in the .env file.

