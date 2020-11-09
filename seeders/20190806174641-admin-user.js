'use strict';
var bcrypt = require('bcryptjs');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      firstName : '<admin account first name>',
      lastName : '<admin account last name>',
      username : '<admin account user name>',
      email : '<admin account email address>',
      password: bcrypt.hashSync('<admin account password>', 10),
      createdAt : new Date(),
      updatedAt : new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
