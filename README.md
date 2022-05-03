# Auth-Service

A JWT token based authentication service. Tokens are signed and verified via key pairs. This service provides a UI to manage the users as well as API's to generate/verify tokens.

### Docker Setup:

1. Clone the repository
2. Create a Private/Public key pairs and store them under /keys directory (Public key should be a .pem file).
   1. tools like openssl can be used to generate the key pair. this key pair will be used to sign the auth token
   2. to extract the pub key from existing private key, please use openssl rsa -in <private key> -pubout -out <public key>.pem
3. Rename .env.sample to .env.
   - Provide the database details in .env file
   - Provide key names and modify Ports if required
   - To enable SSL for AuthService URL, provide CERT_PATH value and update nginx config, go to `client/nginx/conf.d/nginx.conf.template` fill in coresponding values on line 4 and 5.
   - If you do not use SSL, comment out line 3, 4, 5 in `client/nginx/conf.d/nginx.conf.template` ex. `# ssl_certificate <cert_path.pem>;`.
   - Provide ADMIN_PASSWORD in .env
   - HOST_PORT - This the FQDN (<http/https>:<hostname>:<port>) of AuthService. This will be used in the token
4. Run `docker-compose up -d`
5. The user interface to manage users should be available at http(s)://<hostname>:<WEB_EXPOSED_PORT> once the application starts up successfully.

### Development Setup:

1. Follow steps 1-4
2. We have created an NPM script to install all the necessary dependencies and launch the app, to run the script execute the command `npm run bootstrap` it will install server and client dependencies, create `authservice` schema in your database and populate it with all the tables and seed data.
   > **WARNING**: This action will override `authservice` schema if already exists!

If you like to change the name of the schema, please update the .env file DB_NAME value as well as package.json scripts "createSchema" and "migrations" with the new schema name.
You can also run each script separately by executing `npm run [script name]`.
After installations are done, you can start the app. To start the app with UI run command `npm run auth`, it will start the server and front end app at the same time.
To start the server only, run `npm run dev`.

3. The user interface to manage users should be available at http(s)://<hostname>:<Port> once the application starts up successfully.
