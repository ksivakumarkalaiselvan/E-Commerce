import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  transactionId: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Completed',
  },
  receiptUrl: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  details: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    get() {
      const raw = this.getDataValue('details');
      try {
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    },
    set(val) {
      this.setDataValue('details', typeof val === 'string' ? val : JSON.stringify(val || {}));
    },
  },
}, {
  timestamps: true,
  tableName: 'payments',
});

export default Payment;
