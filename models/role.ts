import { DataTypes, Model } from 'sequelize';
import sequelizeInstance from '@/lib/db/sequelize.mjs';
import User from './user'; // Importer le modèle User

interface RoleAttributes {
    id: number;
    name: string;
}

class Role extends Model<RoleAttributes> implements RoleAttributes {
    public id!: number;
    public name!: string;
}

Role.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize: sequelizeInstance,
        tableName: 'roles',
        timestamps: false,
    }
);

// Définir la relation
Role.belongsToMany(User, {
    through: 'UserRole', // Nom de la table de liaison
    foreignKey: 'roleId',
    otherKey: 'userId',
});

export default Role;