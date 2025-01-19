import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.SQL_DB_NAME, process.env.SQL_DB_USERNAME, process.env.SQL_DB_PASSWORD, {
    host: process.env.SQL_DB_HOST,
    dialect: 'mysql',
    logging: false
});

export default sequelize;