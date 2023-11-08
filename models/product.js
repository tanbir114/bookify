const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Product = sequelize.define('product',{
  id:{
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  price:{
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  description:{
    type: Sequelize.STRING,
    allowNull: false
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  publishDate:{
    type: Sequelize.DATE,
    allowNull: false
  },
  authorName:{
    type: Sequelize.STRING,
    allowNull: false
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false
  },
  quantity:{
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

module.exports = Product;
