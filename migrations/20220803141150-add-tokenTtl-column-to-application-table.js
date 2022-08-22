module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'application',
        'tokenTtl',
        {
          type: Sequelize.DataTypes.SMALLINT,
          allowNull: true,
          after: "owner",
        },
        { transaction }
      );
      await queryInterface.addColumn(
        "application",
        "registrationConfirmationRequired",
        {
          type: Sequelize.DataTypes.BOOLEAN,
          default: false,
          after: "owner",
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
      await queryInterface.removeColumn('application', 'tokenTtl', { transaction });
      await queryInterface.removeColumn("application", "registrationConfirmationRequired", { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};