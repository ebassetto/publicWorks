const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cartSchema = new Schema(
	{
		ecommerce_id: {
			type: String,
			required: true,
		},
		customer_id: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
		},
		total_price: {
			type: Number,
			required: true,
		},
		date_checkout: {
			type: String,
		},
		products: {
			list: [
				{
					product_id: {
						type: Schema.Types.ObjectId,
						ref: "Products",
						required: true,
					},
                    price: {
						type: Number,
                        require: true,
					},
                    name: {
                        type: String,
                    },
					quantity: {
						type: Number,
						required: true,
					},
					file_type: {
						type: String,
						required: true,
					},
					delivery_date: {
						type: String,
						required: true,
					},
				},
			],
		},
	},
	{
		timestamps: true,
	}
);

cartSchema.methods.addToCart = function (product) {
	const cartProductIndex = this.products.list.findIndex((cp) => {
		return cp.product_id.toString() === product.product_id.toString();
	});
	const updatedCartItems = [...this.products.list];

	if (cartProductIndex >= 0) {
		updatedCartItems[cartProductIndex].quantity = this.products.list[cartProductIndex].quantity + parseInt(product.quantity);
		updatedCartItems[cartProductIndex].file_type = product.file_type;
		updatedCartItems[cartProductIndex].delivery_date = product.delivery_date;
	} else {
		updatedCartItems.push({
			product_id: product.product_id,
            name: product._doc.name,
			quantity: parseInt(product.quantity),
			file_type: product.file_type,
			delivery_date: product.delivery_date,
			price: product._doc.price,
		});
	}

	this.status = "update";
	this.total_price = cartSchema.methods.getTotalPrice(updatedCartItems).toFixed(2);
	this.products = {
		list: updatedCartItems,
	};

	return this.save();
};

cartSchema.methods.removeFromCart = function (product_id) {
	const updatedCartItems = this.products.list.filter((item) => {
		return item.product_id.toString() !== product_id.toString();
	});
    this.total_price = cartSchema.methods.getTotalPrice(updatedCartItems).toFixed(2);
	this.products.list = updatedCartItems;
	this.status = "update";

	if (this.products.list.length == 0) {
		this.total_price = 0;
	}

	return this.save();
};

cartSchema.methods.clearCart = function () {
	this.total_price = 0;
    this.products = {
		list: [],
	};
	return this.save();
};

cartSchema.methods.getTotalPrice = function (products) {
	let total = 0;
	products.forEach((product) => {
		let quantityDiscount = cartSchema.methods.getQuantityDiscount(product.quantity),
			deliveryDiscount = cartSchema.methods.getDeliveryDiscount(product.delivery_date),
			typeDiscount = cartSchema.methods.getTypeDiscount(product.file_type),
			price = product.quantity * product.price * quantityDiscount * deliveryDiscount * typeDiscount;

		total += price;
	});
	return total;
};

cartSchema.methods.getQuantityDiscount = function (quantity) {
	let discount = 0;

	if (quantity >= 250) {
		discount = 5;
	}

	if (quantity >= 500) {
		discount = 10;
	}

	if (quantity >= 1000) {
		discount = 15;
	}

	if (quantity >= 2500) {
		discount = 20;
	}

	return Number(1 - discount / 100);
};

cartSchema.methods.getDeliveryDiscount = function (delivery) {
	let discount = 0;

	switch (delivery) {
		case 1:
			discount = 30;
			break;
		case 2:
			discount = 20;
			break;
		case 3:
			discount = 10;
			break;
	}

	return Number(1 + discount / 100);
};

cartSchema.methods.getTypeDiscount = function (type) {
	let discount = 0;

	switch (type) {
		case "pdf":
			discount = 15;
			break;
		case "psd":
			discount = 35;
			break;
		case "ai":
			discount = 25;
			break;
	}

	return Number(1 + discount / 100);
};

module.exports = mongoose.model("Cart", cartSchema);
