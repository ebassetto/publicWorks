const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");
const Cart = require("./models/cart");
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(
	express.urlencoded({
		extended: false,
	})
);
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
	Cart.findById("6074a09a33be1b3914f5dc59")
		.then((cart) => {
			req.cart = cart;
			next();
		})
		.catch((err) => console.log(err));
});
app.use(shopRoutes);
app.use(errorController.get404);

mongoose
	.connect("mongodb+srv://ebassetto:KYJB0RxjHanUVbAP@cluster0.xodzl.mongodb.net/shop?retryWrites=true&w=majority")
	.then((result) => {
		Cart.findOne().then((cart) => {
			if (!cart) {
				const cart = new Cart({
					ecommerce_id: "EU",
					customer_id: "Guest",
					ecommerceId: "EU",
					status: "create",
					totale_price: 0,
					products: {
						list: [],
					},
				});
				cart.save();
			}
		});
		app.listen(3000);
	})
	.catch((err) => {
		console.log(err);
	});
