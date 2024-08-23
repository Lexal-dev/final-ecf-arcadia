'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('animals', {
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
            etat: {
                type: Sequelize.STRING(100), // Limite de la taille du champ
                allowNull: false,
                validate: {
                    len: {
                        args: [3, 100],
                        msg: 'Le message d\'état doit être compris entre 3 et 100 caractères.',
                    },
                },
            },
            specieId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'species',
                    key: 'id',
                },
            },
            habitatId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'habitats',
                    key: 'id',
                },
            },
            imageUrl: {
                type: Sequelize.JSONB, // Utilisez JSONB pour PostgreSQL pour stocker des tableaux de chaînes
                allowNull: true,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('animals');
    },
};