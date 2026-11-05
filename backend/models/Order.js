import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const raw = this.getDataValue('shippingAddress');
      try {
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    },
    set(val) {
      this.setDataValue('shippingAddress', typeof val === 'string' ? val : JSON.stringify(val || {}));
    },
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentResult: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    get() {
      const raw = this.getDataValue('paymentResult');
      try {
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    },
    set(val) {
      this.setDataValue('paymentResult', typeof val === 'string' ? val : JSON.stringify(val || {}));
    },
  },
  itemsPrice: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  taxPrice: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  shippingPrice: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  discountAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  paidAt: {
    type: DataTypes.DATE,
  },
  orderStatus: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'),
    defaultValue: 'Pending',
  },
  statusTimeline: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('statusTimeline');
      try {
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    },
    set(val) {
      this.setDataValue('statusTimeline', typeof val === 'string' ? val : JSON.stringify(val || []));
    },
  },
  trackingNumber: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  deliveredAt: {
    type: DataTypes.DATE,
  },
  cancelledAt: {
    type: DataTypes.DATE,
  },
  cancelReason: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
}, {
  timestamps: true,
  tableName: 'orders',
});

export default Order;
