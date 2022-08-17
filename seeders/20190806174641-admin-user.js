'use strict';
const crypto = require("crypto");
require("dotenv").config();

 let hashPassword = (password) => {
   let salt = password.substring(0, 2);
   return crypto
     .createHash("sha256")
     .update(salt + password)
     .digest("base64");
 };

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'select * from Users where username="admin" and deletedAt is null', {
      type: queryInterface.sequelize.QueryTypes.SELECT
    }).then(user => {
      if(!user || user.length == 0) {     
        return queryInterface.bulkInsert('Users', [{
          firstName : 'admin',
          lastName : 'admin',
          username : 'admin',
          email : 'admin@authservice.com',
          password: hashPassword(process.env.ADMIN_PASSWORD),
          createdAt : new Date(),
          updatedAt : new Date()
        }], {});
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
