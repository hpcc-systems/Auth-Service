module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "users",
        "accountVerified",
        {
          type: Sequelize.DataTypes.BOOLEAN,
          allowNull: false,
          after: "password",
        },
        { transaction }
      );
      await queryInterface.addColumn(
        "users",
        "registrationConfirmationCode",
        {
          type: Sequelize.DataTypes.UUID,
          after: "accountVerified",
          allowNull: true,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn("users", "accountVerified", { transaction });
      await queryInterface.removeColumn("users", "registrationConfirmationCode", { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
