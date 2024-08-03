import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '@/lib/db/sequelize.mjs';

const SALT_ROUNDS = 10;

interface UserAttributes {
  id?: number; // Rendre id optionnel
  email: string;
  password: string;
  role: string;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public role!: string;

  // Méthode pour hacher le mot de passe avant de sauvegarder
  public async setPassword(password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    this.password = hashedPassword;
  }

  // Méthode pour comparer un mot de passe non haché avec un mot de passe haché
  public async comparePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USER', // Valeur par défaut
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
  }
);

export default User;