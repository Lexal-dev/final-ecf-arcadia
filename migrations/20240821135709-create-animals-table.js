"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("animals", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      etat: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      specieId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "species",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      habitatId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "habitats",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      imageUrl: {
        type: Sequelize.JSON,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("animals");
  },
};
