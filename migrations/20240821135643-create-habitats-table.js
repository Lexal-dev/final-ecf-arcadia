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
                type: Sequelize.STRING(30), // Limite de la taille du champ
                allowNull: false,
                unique: true,
                validate: {
                    len: {
                        args: [3, 30],
                        msg: 'Le nom doit être compris entre 3 et 30 caractères.',
                    },
                },
            },
            description: {
                type: Sequelize.STRING(200), // Limite de la taille du champ
                allowNull: false,
                validate: {
                    len: {
                        args: [3, 200],
                        msg: 'La description doit être comprise entre 3 et 200 caractères.',
                    },
                },
            },
            comment: {
                type: Sequelize.TEXT,
                allowNull: true,
                validate: {
                    len: {
                        args: [3, 100],
                        msg: 'Le commentaire doit être compris entre 3 et 100 caractères.',
                    },
                },
            },
            imageUrl: {
                type: Sequelize.JSONB, // Utilisez JSONB pour PostgreSQL pour stocker des tableaux de chaînes
                allowNull: true,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('habitats');
    },
};