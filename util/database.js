const Sequelize = require("sequelize");
const sequelize = new Sequelize("bookify", "root", "", {dialect: "mysql", host: 'localhost'});
module.exports = sequelize; 