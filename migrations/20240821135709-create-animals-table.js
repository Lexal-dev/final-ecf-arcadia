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
                type: Sequelize.STRING(30), // Field size limit
                allowNull: false,
                unique: true,
            },
            etat: {
                type: Sequelize.STRING(100), // Field size limit
                allowNull: false,
            },
            specieId: {
                type: Sequelize.INTEGER,
                allowNull: true, // Set to false if the foreign key should not be null
                references: {
                    model: 'species',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL', // or 'CASCADE', depending on your need
            },
            habitatId: {
                type: Sequelize.INTEGER,
                allowNull: true, // Set to false if the foreign key should not be null
                references: {
                    model: 'habitats',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL', // or 'CASCADE', depending on your need
            },
            imageUrl: {
                type: Sequelize.JSON, // Use JSON for MySQL
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('animals');
    },
};