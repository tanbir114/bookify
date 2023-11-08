const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const User = sequelize.define("user", {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  resetToken: {
    type: Sequelize.STRING,
  },
  resetTokenExpiration: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  hasShop: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  }
});

module.exports = User;

// module.exports = class User {
//     constructor(username, email, cart, id) {
//         this.name = username;
//         this.email = email;
//         this.cart = cart;
//         this.id = id;
//     }
//     save() {
//         const db = getDb();
//         db.collection('users').updatedOne(this);
//     }

//     addToCart(product) {
//         // const cartProduct = this.cart.items.findIndex(cp => {
//         //     return cp.id === product.id;
//         // })

//         product.quantity = 1;
//         const updatedCart = { items: [{ ...product, quantity: 1 }] };
//         const db = getDb();
//         db.collection('users').updateOne({ id: new ObjectId(this.id) }, { $set: { cart: updatedCart } })
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db
//             .collection('users')
//             .findOne({ id: new ObjectId(userId) })
//             .then(user => { console.log(user); return user; })
//             .catch(err => { console.log(err) });
//     }
// }
