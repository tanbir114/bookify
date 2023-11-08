const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const SessionStore = require("express-session-sequelize")(expressSession.Store);
const csrf = require("csurf");
const flash = require("connect-flash");
const cors = require("cors");

const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");
const Record = require("./models/record");
const Shop = require("./models/shop");

const app = express();
const sequelizeSessionStore = new SessionStore({
  db: sequelize,
  table: "session",
});
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(
  expressSession({
    secret: "my secret",
    store: sequelizeSessionStore,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (req.session && req.session.user && req.session.user.email) {
    User.findByPk(req.session.user.email)
      .then((user) => {
        req.user = user;
        console.log(req.user);
        res.locals.hasShop = user.hasShop;
        console.log(res.locals.hasShop);
        next();
      })
      .catch((err) => {
        console.log(err);
        next();
      });
  } else {
    console.log("Not logged in");
    req.user = null;
    next();
  }
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
////
app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem});
Order.hasMany(Record, { as: "details" });
Record.belongsTo(Order, { as: 'order' });
User.hasOne(Shop, {foreignKey: "userEmail"});
// OrderItem.belongsTo(Order);
// Order.hasMany(OrderItem);
// Product.belongsToMany(Order, { through: OrderItem });

sequelize
  .sync()
  // .sync({force: true})
  .then(() => {
    app.listen(4000);
  })
  .catch((error) => {
    console.log(error);
  });
