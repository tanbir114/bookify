const Product = require("../models/product");
const Order = require("../models/order");
const OrderDetail = require("../models/record");
const Record = require("../models/record");
const Shop = require("../models/shop");
const User = require("../models/user");
const Sequelize = require("sequelize");
const { Op, fn } = require("sequelize");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { Console } = require("console");

const ITEMS_PER_PAGE = 5;

function isIntegerString(value) {
  return /^\d+$/.test(value);
}

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE;
  let totalItems;
  function stock(qty) {
    if (qty > 0)
      return "In Stock";
    else
      return "Out Of Stock";
  }

  function color(qty) {
    if (qty > 0)
      return "rgb(13, 106, 112)";
    else
      return "green";
  }

  const sortOption = req.query.sort || 'default';
  const searchKind = req.query.searchType || 'default';

  let sortingCriteria = [];
  switch (sortOption) {
    case 'az':
      sortingCriteria = [['title', 'ASC']];
      break;
    case 'za':
      sortingCriteria = [['title', 'DESC']];
      break;
    case 'price-asc':
      sortingCriteria = [['price', 'ASC']];
      break;
    case 'price-desc':
      sortingCriteria = [['price', 'DESC']];
      break;
    default:
      sortingCriteria = [['title', 'ASC']];
  }

  var whereCondition = {};
  if (req.session.isLoggedIn) {
    whereCondition.userEmail= {
      [Sequelize.Op.ne]: req.user.email,
    };
  }
  Product.count({
    where:  whereCondition
  })
    .then((numProducts) => {
      totalItems = numProducts;
      console.log(totalItems);
      
      return Product.findAll({
        where: whereCondition,
        limit: ITEMS_PER_PAGE,
        offset: offset,
        order: sortingCriteria,
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
        sortOption: sortOption,
        searchKind: searchKind,
        stock: stock,
        color: color,
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
      req.user.createOrder().then((order) => {
        order.addProducts(
          products.map((product) => {
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

      function formatMonth(timestamp) {
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

exports.getOrderHistory = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/");
  }
  Order.findAll({
    where: {
      userEmail: req.user.email,
    },
    include: [
      {
        model: OrderDetail,
        as: "details",
      },
    ],
  })
    .then((orders) => {
      function formatDate(timestamp) {
        const date = new Date(timestamp);

        const day = date.getDate();
        return day;
      }

      function formatMonth(timestamp) {
        const date = new Date(timestamp);
        const monthAbbreviation = date.toLocaleDateString("en-US", {
          month: "short",
        });
        return monthAbbreviation;
      }

      res.render("shop/order-history", {
        path: "/order-history",
        pageTitle: "Order History",
        orders: orders,
        formatDate: formatDate,
        formatMonth: formatMonth,
      });
    })
    .catch((err) => console.log(err));
};

exports.getSearch = async (req, res, next) => {
  const searchTerm = req.query.q;
  const itemsPerPage = 1;
  const searchKind = req.query.searchType || 'book';
  function stock(qty) {
    if (qty > 0)
      return "In Stock";
    else
      return "Out Of Stock";
  }

  try {
    let searchCondition;


    switch (searchKind) {
      case 'author':
        searchCondition = { authorName: { [Op.substring]: searchTerm } };
        break;
      case 'year':
        searchCondition = { publishDate: { [Op.substring]: searchTerm } };
        break;

      case 'category':
        searchCondition = { category: { [Op.substring]: searchTerm } };
        break;
      default:
        // For 'book' or any other case
        searchCondition = {
          [Op.or]: [
            { title: { [Op.substring]: searchTerm } },

          ],
        };
    }



    const totalCount = await Product.count({
      where: {
        ...searchCondition,
        userEmail: {
          [Sequelize.Op.ne]: req.user.email,
        },

      },
    });

    const currentPage = parseInt(req.query.page) || 1;
    const offset = (currentPage - 1) * itemsPerPage;

    let sortOrder;
    const searchSort = req.query.filterSort || 'default';


    switch (searchSort) {
      case 'za':
        sortOrder = [['title', 'DESC']];
        break;
      case 'price-asc':
        sortOrder = [['price', 'ASC']];
        break;
      case 'price-desc':
        sortOrder = [['price', 'DESC']];
        break;
      default:
        sortOrder = [['title', 'ASC']];
    }


    console.log('Search Kind:', searchKind);
    console.log('Search Term:', searchTerm);
    console.log('After Switch - Search Condition:', searchCondition);

    const products = await Product.findAll({


      where: {
        ...searchCondition,
        userEmail: {
          [Sequelize.Op.ne]: req.user.email,
        },

      },
      order: sortOrder,
      limit: itemsPerPage,
      offset: offset,
    });

    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const hasPrevPage = currentPage > 1;
    const hasNextPage = itemsPerPage * currentPage < totalPages;
    const previousPage = currentPage - 1;
    const nextPage = currentPage + 1;
    const lastPage = totalPages;

    res.render('shop/search-results', {
      prods: products,
      pageTitle: 'Search Results',
      path: '/search',
      path: '/products',
      totalPages: totalPages,
      currentPage: currentPage,
      hasPrevPage: hasPrevPage,
      previousPage: previousPage,
      hasNextPage: hasNextPage,
      nextPage: nextPage,
      lastPage: lastPage,
      isAuthenticated: req.session.isLoggedIn,
      req: req,
      searchTerm: searchTerm,
      searchSort: searchSort,
      searchKind: searchKind,
      stock: stock, // Add the sortOption here
    });
    console.log('Final Query:', products.query);
  } catch (error) {
    console.error(error);
    next(error);
  }
};


exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const shopName = "Your Shop Name";
  const invoiceNo = "INV-" + orderId; // You can customize the invoice number generation
  const shopEmail = "shop@example.com";
  const shopLocation = "Shop Location, City, Country";

  Order.findAll({
    where: {
      Id: orderId,
    },
    include: [
      {
        model: OrderDetail,
        as: "details",
      },
    ],
  })
    .then((orders) => {
      if (!orders || orders.length === 0) {
        return next(new Error("No order found."));
      }

      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();

      // Stream the PDF directly to the response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(res);

      // Header Section
      pdfDoc.fontSize(26).text(shopName, { underline: true }).moveDown(0.5);
      pdfDoc.text(shopEmail).moveDown(0.2);
      pdfDoc.text(shopLocation).moveDown(0.5);

      // Invoice Information
      pdfDoc.fontSize(14);
      pdfDoc.text(`Invoice No: ${invoiceNo}`).moveDown(0.2);
      pdfDoc.text(`Date: ${getCurrentDate()}`).moveDown(0.5);

      // Line separator
      pdfDoc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, pdfDoc.y)
        .lineTo(550, pdfDoc.y)
        .stroke()
        .moveDown(0.5);

      // Order details
      orders.forEach((order) => {
        order.details.forEach((prod) => {
          pdfDoc
            .text(`${prod.name} - ${prod.quantity} x $${prod.price}`, {
              width: 500,
            })
            .moveDown(0.2);
        });
      });

      // Line separator
      pdfDoc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, pdfDoc.y)
        .lineTo(550, pdfDoc.y)
        .stroke()
        .moveDown(0.5);

      // Total Price
      pdfDoc
        .fontSize(18)
        .text(`Total Price: $${calculateTotalPrice(orders)}`, {
          align: "right",
        })
        .moveDown(1);

      pdfDoc.end();
    })
    .catch((err) => next(err));
};

function calculateTotalPrice(orders) {
  let totalPrice = 0;
  orders.forEach((order) => {
    order.details.forEach((prod) => {
      totalPrice += prod.quantity * prod.price;
    });
  });
  return totalPrice.toFixed(2);
}

function getCurrentDate() {
  const now = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString("en-US", options);
}








