const Product = require("../models/product");
const Order = require("../models/order");
const dayjs = require("dayjs");

exports.getProducts = (req, res, next) => {
	Product.find()
		.then((products) => {
			console.log(products);
			res.render("shop/product-list", {
				prods: products,
				pageTitle: "All Products",
				path: "/products",
			});
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.getIndex = (req, res, next) => {
	Product.find()
		.then((products) => {
			res.render("shop/index", {
				prods: products,
				pageTitle: "Shop",
				path: "/",
			});
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.getCart = (req, res, next) => {
	req.cart
		.populate("products.list.product_id")
		.execPopulate()
		.then((cart) => {
			const products = cart.products.list;
			res.render("shop/cart", {
				path: "/cart",
				pageTitle: "Your Cart",
				products: products,
				total: cart.total_price,
			});
		})
		.catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
	const item = req.body;
	Product.findById(item.product_id)
		.then((product) => {
			let itemMerged = {...product, ...item};
			return req.cart.addToCart(itemMerged);
		})
		.then((result) => {
			console.log(result);
			res.redirect("/cart");
		});
};

exports.postCartDeleteProduct = (req, res, next) => {
	const prodId = req.body.product_id;
	console.log(prodId);
	req.cart
		.removeFromCart(prodId)
		.then((result) => {
			res.redirect("/cart");
		})
		.catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
	req.cart
		.populate("products.list.product_id")
		.execPopulate()
		.then((cart) => {
			const products = cart.products.list.map((item) => {
				return {
					product: item,
				};
			});
			const order = new Order({
				user: {
					ecommerce_id: req.cart.ecommerce_id,
					customer_id: req.cart.customer_id,
				},
				products: products,
				cart: {
					cart_id: cart._id,
					date_checkout: dayjs().format("DD-MM-YYYY"),
					total: cart.total_price,
				},
			});
			return order.save();
		})
		.then((result) => {
			return req.cart.clearCart();
		})
		.then(() => {
			res.redirect("/orders");
		})
		.catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
	Order.find({"cart.cart_id": req.cart._id})
		.then((orders) => {
			res.render("shop/orders", {
				path: "/orders",
				pageTitle: "Your Orders",
				orders: orders,
			});
		})
		.catch((err) => console.log(err));
};
