'use strict';
module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('Refreshtoken', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    client_id: DataTypes.STRING, 
    username: DataTypes.STRING,
    token: DataTypes.STRING,
    last_accessed: DataTypes.DATE,
    revoked:  {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {});
  RefreshToken.associate = function(models) {
    // associations can be defined here
  };
  return RefreshToken;
};