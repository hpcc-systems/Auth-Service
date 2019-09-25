'use strict';
module.exports = (sequelize, DataTypes) => {
  const Audit = sequelize.define('Audit', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    username: DataTypes.STRING,
    action: DataTypes.STRING
  }, {});
  Audit.associate = function(models) {
    // associations can be defined here
  };
  return Audit;
};