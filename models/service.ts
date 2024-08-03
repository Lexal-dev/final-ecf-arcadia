import { DataTypes, Model } from 'sequelize';
import sequelizeInstance from '@/lib/db/sequelize.mjs';

export interface ServiceAttributes {
    id: number;
    name: string;
    description: string;
}

class Service extends Model<ServiceAttributes> implements ServiceAttributes {
    public id!: number;
    public name!: string;
    public description!: string;
}

Service.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [3, 30],
                    msg: 'Le nom doit être compris entre 3 et 30 caractères.',
                },
            },
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [3, 150],
                    msg: 'La description doit être comprise entre 3 et 150 caractères.',
                },
            },
        },
    },
    {
        sequelize: sequelizeInstance,
        tableName: 'services',
        timestamps: false,
    }
);

export default Service;