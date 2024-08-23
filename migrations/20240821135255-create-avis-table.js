'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('avis', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            pseudo: {
                type: Sequelize.STRING(30), // Limite de la taille du champ
                allowNull: false,
                validate: {
                    len: [3, 30],
                },
            },
            comment: {
                type: Sequelize.STRING(150), // Limite de la taille du champ
                allowNull: false,
                validate: {
                    len: [3, 150],
                },
            },
            isValid: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('avis');
    },
};