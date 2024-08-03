export interface AvisAttributes {
    id: number;
    pseudo: string;
    comment: string;
    isValid: boolean;
}

import { DataTypes, Model } from 'sequelize';
import sequelizeInstance from '@/lib/db/sequelize.mjs';

class Avis extends Model<AvisAttributes> implements AvisAttributes {
    public id!: number;
    public pseudo!: string;
    public comment!: string;
    public isValid!: boolean;
}

Avis.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        pseudo: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [3, 30],
                    msg: 'Le pseudo doit être compris entre 3 et 30 caractères.',
                },
            },
        },
        comment: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [3, 150],
                    msg: 'Le commentaire doit être compris entre 3 et 150 caractères.',
                },
            },
        },
        isValid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize: sequelizeInstance,
        tableName: 'avis',
        timestamps: false,
    }
);

export default Avis;