'use strict';
module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    id: {
	  type: DataTypes.INTEGER,
	  primaryKey: true
    },
    name: DataTypes.STRING
  }, {});
  Permission.associate = function(models) {

  };
  return Permission;
};