'use strict';
module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    id: {
  	  type: DataTypes.INTEGER,
  	  primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    roleId: DataTypes.INTEGER
  }, {});
  Permission.associate = function(models) {
    models.Permission.belongsTo(models.Role);
  };
  return Permission;
};