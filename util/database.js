const Sequelize = require("sequelize");
const sequelize = new Sequelize("bookify", "root", "tanbir114", {dialect: "mysql", host: 'localhost'});
module.exports = sequelize;