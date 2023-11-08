const Product = require("../models/product");
const Cart = require("../models/cart");
const CartItem = require("../models/cart-item");
const Shop = require("../models/shop");
const User = require("../models/user");
const OrderItem = require("../models/order-item");
const Sequelize = require("sequelize");
const { Op, fn } = require("sequelize");
const sequelize = require("../util/database");


exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const publishDate = req.body.publish;
  const authorName = req.body.author;
  const category = req.body.category;
  const quantity = req.body.quantity;
  console.log(publishDate);
  req.user
    .createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description,
      publishDate: publishDate,
      authorName: authorName,
      category: category,
      quantity: quantity,
    })
    .then((result) => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCreateShop = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  res.render("admin/create-shop", {
    pageTitle: "Add Product",
    path: "/admin/create-shop",
    editing: false,
  });
};

exports.postCreateShop = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const location = req.body.location;
  const description = req.body.description;
  Shop.create({
    title: title,
    location: location,
    imageUrl: imageUrl,
    description: description,
    userEmail: req.user.email,
  })
    .then(() => {
      console.log("Created Shop");
      User.update(
        { hasShop: true },
        {
          where: { email: req.user.email },
        }
      );
    })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  req.user
    .getProducts({ where: { id: prodId } })
    .then((products) => {
      const product = products[0];
      if (!product) {
        return res.redirect("/");
      }
      console.log(product.publishDate);
      const date = new Date(product.publishDate);
      const formattedDate = date.toISOString().split("T")[0];
      console.log(formattedDate);
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        date: formattedDate,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.findByPk(prodId)
    .then((product) => {
      if (product.userEmail !== req.user.email) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save().then((result) => {
        console.log("UPDATED PRODUCT!");
        res.redirect("/admin/products");
      });
    })

    .catch((err) => console.log(err));
  CartItem.findAll({ where: { productId: prodId } })
    .then((cartItems) => {
      if (cartItems.length > 0) {
        const updatePromises = cartItems.map((cartItem) => {
          cartItem.name = updatedTitle;
          return cartItem.save();
        });
        return Promise.all(updatePromises);
      } else {
        console.log("No CartItems found");
      }
    })
    .then(() => {
      console.log("CartItems updated successfully");
    })
    .catch((error) => {
      console.error("Error updating CartItems:", error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.findAll({ where: { userEmail: req.user.email } })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then((product) => {
      if (product.userEmail !== req.user.email) {
        return res.redirect("/");
      }
      return product.destroy().then(() => {
        console.log("DESTROYED PRODUCT");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => console.log(err));
};

exports.getSales = async (req, res, next) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const salesData = await OrderItem.findAll({
    attributes: [
      [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"],
      "productId",
    ],
    where: {
      createdAt: {
        [Op.gte]: startDate,
      },
    },
    group: ["productId"],
    // order: ['productid'],
  });

  console.log(salesData);

  const totalQuantities = salesData.map(
    (item) => item.dataValues.totalQuantity
  );
  const productTitle = [];

  for(let i=0; i<salesData.length; i++){
    // console.log("ProdId: " + salesData[i].dataValues.productId);
    await Product.findByPk(salesData[i].dataValues.productId, {
      attributes: ["title"],
    })
    .then(product => {
      productTitle.push(product.title);
    })
  }

  const intArray = totalQuantities.map(str => parseInt(str, 10));
  
  res.render("admin/sales", {
    intArray: JSON.stringify(intArray), // Convert to JSON string
    productTitle: JSON.stringify(productTitle),
    pageTitle: "Admin Products",
    path: "/admin/sales",
  });
};
