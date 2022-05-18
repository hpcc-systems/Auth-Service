# Auth-Service

A JWT token based authentication service. Tokens are signed and verified via key pairs. This service provides a UI to manage the users as well as API's to generate/verify tokens.

### Docker Setup:

1. Clone the repository
2. Create a Private/Public key pairs using tools like openssl and  store them under /keys directory (Public key must be a .pem file). This key pair will be used to sign the auth token
   1. To create private key run `openssl genrsa -out ./private_key 4096` 
   2. To extract private key run `openssl rsa -in private_key -pubout -outform PEM -out public_key.pem`
3. On the root create .env file and copy-paste content from .env.sample and update necessary values
    > **Important**: If you are not sure what values to enter, refer the comments on each section.
    Change the SSL related variables only if you are using SSL. If not using SSL, leave them as they are.
5. Go to `client/nginx/conf.d/`,  create new file `nginx.conf.template`, copy-paste content form `nginx.conf.template.sample`
    - If using SSL, fill in corresponding values on line 4 and 5.
    - If not using SSL, comment out line 3, 4, 5 in and un-comment line 2.
4. Run `docker-compose up -d`
5. The user interface to manage users should be available at http(s)://<hostname>:<web_exposed_port> once the application starts up successfully.
6. Log into the application with username : 'admin' and the password you have specified in the .env file.

### Development Setup (Without Docker):

1. Follow steps 1-4
2. From root run `npm run bootstrap` it will install server and client dependencies, create `authservice` schema in your database and populate it with all the tables and seed data.You can also run each script separately by executing `npm run [script name]`.
   > **WARNING**: This action will override `authservice` schema if already exists! If you like to change the name of the schema, please update the .env file DB_NAME value as well as 
   package.json scripts "createSchema" and "migrations" with the new schema name.
3. Now go inside the client, create a new file `.env`, copy-paste content from `.env.sample` and update necessary values
3. Once the installation is complete, you can start the app. To start the app  run command `npm run auth` from the root, it will start the server and front end app at the same time.
To start the server only, run `npm run dev`.
4. The user interface to manage users should be available at http(s)://<hostname>:<port> once the application starts up successfully.
5. Log into the application with username : 'admin' and the password you have specified in the .env file.