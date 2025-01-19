import { DataTypes } from "sequelize";
import sequelize from "../../db/sqlIndex.js";

const OrderProducts = sequelize.define('OrderProducts', {
    orderId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Orders', // Reference to Order model
            key: 'id',
        },
    },
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Products', // Reference to Product model
            key: 'id',
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    priceAtPurchase: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
});

export { OrderProducts };