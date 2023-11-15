const Product = require("../models/product");
const Order = require("../models/order");
const OrderDetail = require("../models/record");
const Record = require("../models/record");
const Shop = require("../models/shop");
const User = require("../models/user");
const Sequelize = require("sequelize");
const { Op, fn } = require("sequelize");

const ITEMS_PER_PAGE = 1;

function isIntegerString(value) {
  return /^\d+$/.test(value);
}


exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE;
  let totalItems;

  const sortOption = req.query.sort || 'default'; // Default sorting option
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
      // Default sorting, you can customize this as needed
      sortingCriteria = [['title', 'ASC']];
  }

  



    

     


  Product.count({
    where: {
      userEmail: {
        [Sequelize.Op.ne]: req.user.email,
      },
    },
  }) 
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.findAll({
        where: {
          userEmail: {
            [Sequelize.Op.ne]: req.user.email,
          },
        },
        limit: ITEMS_PER_PAGE,
        offset: offset,
        order: sortingCriteria, // Apply sorting criteria
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
        
      });
    })
    .catch((err) => {
      console.log(err);
    });
};


// exports.getProducts = async (req, res, next) => {
//   const page = +req.query.page || 1;
//   const offset = (page - 1) * ITEMS_PER_PAGE;
//   let totalItems;

//   const sortOption = req.query.sort || 'default'; // Default sorting option
//   const searchType = req.query.searchType || 'default'; // Default search type

//   let sortingCriteria = [];
//   switch (sortOption) {
//     case 'az':
//       sortingCriteria = [['title', 'ASC']];
//       break;
//     case 'za':
//       sortingCriteria = [['title', 'DESC']];
//       break;
//     case 'price-asc':
//       sortingCriteria = [['price', 'ASC']];
//       break;
//     case 'price-desc':
//       sortingCriteria = [['price', 'DESC']];
//       break;
//     default:
//       // Default sorting, you can customize this as needed
//       sortingCriteria = [['title', 'ASC']];
//   }

//   const searchCondition = {
//     userEmail: {
//       [Sequelize.Op.ne]: req.user.email,
//     },
//   };

//   // Add search conditions based on the searchType
//   if (searchType === 'author') {
//     // Add condition for searching by author
//     searchCondition.author = {
//       [Sequelize.Op.like]: `%${req.query.q}%`,
//     };
//   } else if (searchType === 'year') {
//     // Add condition for searching by year
//     searchCondition.year = req.query.q;
//   } else {
//     // Add default conditions for other cases
//     searchCondition[Sequelize.Op.or] = [
//       { title: { [Sequelize.Op.substring]: req.query.q } },
//       { description: { [Sequelize.Op.substring]: req.query.q } },
//     ];
//   }

//   try {
//     totalItems = await Product.count({
//       where: searchCondition,
//     });

//     const products = await Product.findAll({
//       where: searchCondition,
//       limit: ITEMS_PER_PAGE,
//       offset: offset,
//       order: sortingCriteria,
//     });

//     res.render("shop/product-list", {
//       prods: products,
//       pageTitle: "All Products",
//       path: "/products",
//       currentPage: page,
//       hasNextPage: ITEMS_PER_PAGE * page < totalItems,
//       hasPrevPage: page > 1,
//       nextPage: page + 1,
//       previousPage: page - 1,
//       lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
//       sortOption: sortOption,
//       searchType:searchType,
//     });
//   } catch (err) {
//     console.log(err);
//     next(err);
//   }
// };




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



exports.getSearch = async (req, res, next) => {
  const searchTerm = req.query.q;
  const itemsPerPage = 1;
  const searchKind = req.query.searchType || 'book';

  try {
    let searchCondition;


    switch (searchKind) {
      case 'author':
        searchCondition = { authorName:  { [Op.substring]: searchTerm } };
        break;
      case 'year':
        searchCondition = { publishDate:  { [Op.substring]: searchTerm } };
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
      where:{
        ...searchCondition,
        userEmail: {
             [Sequelize.Op.ne]: req.user.email,},
       
      },
    });

    const currentPage = parseInt(req.query.page) || 1;
    const offset = (currentPage - 1) * itemsPerPage;

    let sortOrder;
    const searchSort=req.query.filterSort || 'default';


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
      
      
      
      // where: {
      //    [Op.or]: [
      //     { title: { [Op.substring]: searchTerm } },
          
      //   ],
      //   userEmail: {
      //     [Sequelize.Op.ne]: req.user.email,
      //   },
       where:{
        ...searchCondition,
        userEmail: {
             [Sequelize.Op.ne]: req.user.email,},
       
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
      searchKind:searchKind, // Add the sortOption here
    });
    console.log('Final Query:', products.query);
  } catch (error) {
    console.error(error);
    next(error);
  }
};


// exports.getSearch = async (req, res, next) => {
//   const searchTerm = req.query.q;
//   const itemsPerPage = 1;
//   const searchType = req.query.searchType || 'book';

//   try {
//     const totalCount = await Product.count({
//       where: {
//         [Op.or]: [
//           { title: { [Op.substring]: searchTerm } },
//           { description: { [Op.substring]: searchTerm } },
//         ],
//         userEmail: {
//           [Sequelize.Op.ne]: req.user.email,
//         },
//       },
//     });

//     const currentPage = parseInt(req.query.page) || 1;
//     const offset = (currentPage - 1) * itemsPerPage;

//     let sortOrder;
//     const searchSort = req.query.filterSort || 'default';
//     // const searchType = req.query.searchType || 'book'; // Added searchType

//     switch (searchSort) {
//       case 'za':
//         sortOrder = [['title', 'DESC']];
//         break;
//       case 'price-asc':
//         sortOrder = [['price', 'ASC']];
//         break;
//       case 'price-desc':
//         sortOrder = [['price', 'DESC']];
//         break;
//       default:
//         sortOrder = [['title', 'ASC']];
//     }

//     let searchCondition;

//     switch (searchType) {
//       case 'author':
//         searchCondition = { author: searchTerm };
//         break;
//       case 'year':
//         searchCondition = { year: searchTerm };
//         break;
//       default:
//         // For 'book' or any other case
//         searchCondition = {
//           [Op.or]: [
//             { title: { [Op.substring]: searchTerm } },
//             { description: { [Op.substring]: searchTerm } },
//           ],
//         };
//     }

//     const products = await Product.findAll({
//       where: {
//         ...searchCondition,
//         userEmail: {
//           [Sequelize.Op.ne]: req.user.email,
//         },
//       },
//       order: sortOrder,
//       limit: itemsPerPage,
//       offset: offset,
//     });

//     const totalPages = Math.ceil(totalCount / itemsPerPage);
//     const hasPrevPage = currentPage > 1;
//     const hasNextPage = itemsPerPage * currentPage < totalPages;
//     const previousPage = currentPage - 1;
//     const nextPage = currentPage + 1;
//     const lastPage = totalPages;

//     res.render('shop/search-results', {
//       prods: products,
//       pageTitle: 'Search Results',
//       path: '/search',
//       path: '/products',
//       totalPages: totalPages,
//       currentPage: currentPage,
//       hasPrevPage: hasPrevPage,
//       previousPage: previousPage,
//       hasNextPage: hasNextPage,
//       nextPage: nextPage,
//       lastPage: lastPage,
//       isAuthenticated: req.session.isLoggedIn,
//       req: req,
//       searchTerm: searchTerm,
//       searchSort: searchSort,
//       searchType: searchType, // Added searchType
//     });
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };




