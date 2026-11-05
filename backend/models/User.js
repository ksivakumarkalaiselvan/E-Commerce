import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
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
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  phone: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  addresses: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('addresses');
      try {
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    },
    set(val) {
      this.setDataValue('addresses', typeof val === 'string' ? val : JSON.stringify(val || []));
    },
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
  },
}, {
  timestamps: true,
  tableName: 'users',
});

// Instance method to check password
User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to generate JWT
User.prototype.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this.id, role: this.role, email: this.email },
    process.env.JWT_SECRET || 'aura_super_secure_jwt_secret_key_2026_!@#$',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Hash password hook before creating
User.beforeCreate(async (user) => {
  if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Hash password hook before updating
User.beforeUpdate(async (user) => {
  if (user.changed('password') && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

export default User;
