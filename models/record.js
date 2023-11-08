const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const OrderDetail = sequelize.define("orderDetail", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = OrderDetail;
