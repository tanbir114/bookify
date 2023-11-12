const Product = require("../models/product");
const Order = require("../models/order");
const OrderDetail = require("../models/record");
const Record = require("../models/record");
const Shop = require("../models/shop");
const User = require("../models/user");
const Sequelize = require("sequelize");

const ITEMS_PER_PAGE = 1;

function isIntegerString(value) {
  return /^\d+$/.test(value);
}

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE;
  let totalItems;

  Product.count({
    where: {
      userEmail: {
        [Sequelize.Op.ne]: req.user.email, // Exclude rows with the specific email
      },
    },
  }) 
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.findAll({
        where: {
          userEmail: {
            [Sequelize.Op.ne]: req.user.email, // Exclude rows with the specific email
          },
        },
        limit: ITEMS_PER_PAGE,
        offset: offset,
      });
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  console.log(prodId);
  if (isIntegerString(prodId)) {
    console.log("1111111111111111111111");
    Product.findByPk(prodId)
      .then((product) => {
        res.render("shop/product-detail", {
          product: product,
          pageTitle: product.title,
          path: "/products",
        });
      })
      .catch((err) => console.log(err));
  } else {
    console.log("122222222222222222");
    next();
  }
};

exports.getProductCategory = (req, res, next) => {
  const prodCat = req.params.productCategory;
  Product.findAll({ where: { category: prodCat } })
    .then((product) => {
      res.render("shop/product-list", {
        prods: product,
        pageTitle: " Fictional Books",
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  const page = req.query.page || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE;
  Shop
    .findAll
    // {
    // limit: ITEMS_PER_PAGE,
    // offset: offset,
    // }
    ()
    .then((shops) => {
      res.render("shop/index", {
        shops: shops,
        pageTitle: "Shop",
        path: "/shops",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getShop = (req, res, next) => {
  const shopId = req.params.shopId;
  Shop.findByPk(shopId)
    .then((product) => {
      res.render("shop/shop-details", {
        product: product,
        pageTitle: product.title,
        path: "/shops",
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart
        .getProducts()
        .then((products) => {
          res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: products,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  let newName = "";
  req.user
    .getProducts({ where: { id: prodId } })
    .then((products) => {
      const product = products[0];
      console.log(product);
      if (product) {
        newName = product.title;
      }
    })
    .then(() => {
      req.user
        .getCart()
        .then((cart) => {
          fetchedCart = cart;
          console.log(fetchedCart);
          return cart.getProducts({ where: { id: prodId } });
        })
        .then((products) => {
          let product;
          if (products.length > 0) {
            product = products[0];
          }
          if (product) {
            const oldQuantity = product.cartItem.quantity;
            newQuantity = oldQuantity + 1;
            newName = product.title;
            return product;
          }
          return Product.findByPk(prodId);
        })
        .then((product) => {
          return fetchedCart.addProduct(product, {
            through: { name: newName, quantity: newQuantity },
          });
        })
        .then(() => {
          res.redirect("/cart");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  let orderDetails;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      console.log("uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu");
      console.log(products);
      req.user.createOrder().then((order) => {
        order.addProducts(
          products.map((product) => {
            console.log(
              "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
            );
            console.log(product.cartItem);
            console.log(product.cartItem.quantity);
            product.orderItem = {
              name: product.title,
              quantity: product.cartItem.quantity,
            };
            return product;
          })
        );
        orderDetails = products.map((product) => ({
          name: product.title,
          quantity: product.cartItem.quantity,
          orderId: order.id,
          shopEmail: product.userEmail,
        }));
        return Promise.all(
          orderDetails.map((orderDetail) => Record.create(orderDetail))
        );
      });
    })
    .then(() => {
      return fetchedCart.setProducts(null);
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/");
  }
  Order.findAll({
    include: [
      {
        model: OrderDetail,
        as: "details",
        where: {
          shopEmail: req.user.email,
        },
      },
    ],
  })
    .then((orders) => {
      function formatDate(timestamp) {
        const date = new Date(timestamp);
        
        const day = date.getDate();
        return day;
      }

      function formatMonth(timestamp){
        const date = new Date(timestamp);
        const monthAbbreviation = date.toLocaleDateString("en-US", {
          month: "short",
        });
        return monthAbbreviation;
      }

      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        formatDate: formatDate,
        formatMonth: formatMonth,
      });
    })
    .catch((err) => console.log(err));
};
