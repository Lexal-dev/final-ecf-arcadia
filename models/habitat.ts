import { DataTypes, Model } from 'sequelize';
import sequelizeInstance from '@/lib/db/sequelize.mjs';

class Habitat extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public comment!: string;
  public imageUrl!: string[] | null;
}

Habitat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(30), // Limit the length of the name to 30 characters
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [3, 30],
          msg: "Le nom doit être compris entre 3 et 30 caractères",
        },
      },
    },
    description: {
      type: DataTypes.STRING(200), // Limit the length of the description to 200 characters
      allowNull: false,
      validate: {
        len: {
          args: [3, 200],
          msg: "La description doit être comprise entre 3 et 200 caractères",
        },
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [3, 100],
          msg: "Le commentaire doit être compris entre 3 et 100 caractères",
        },
      },
    },
    imageUrl: {
      type: DataTypes.JSON, // Use JSON for imageUrl, or TEXT if necessary
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeInstance,
    tableName: 'habitats',
    timestamps: false,
  }
);

export default Habitat;