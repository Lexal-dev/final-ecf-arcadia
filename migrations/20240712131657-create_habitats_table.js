'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('habitats', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(30), // Limite de la longueur du nom à 30 caractères
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.STRING(200), // Limite de la longueur de la description à 200 caractères
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      imageUrl: {
        type: Sequelize.JSON, // Utilisation de JSON pour imageUrl, ou TEXT si nécessaire
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('habitats');
  }
};