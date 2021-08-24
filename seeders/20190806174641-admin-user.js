'use strict';
var bcrypt = require('bcryptjs');
require("dotenv").config();

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      firstName : 'admin',
      lastName : 'admin',
      username : 'admin',
      email : 'admin@authservice.com',
      password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
      createdAt : new Date(),
      updatedAt : new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
