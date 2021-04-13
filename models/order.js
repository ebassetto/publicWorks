const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
	products: [
		{
			product: {
                type: Object, 
                required: true
            }
		},
	],
	user: {
		ecommerce_id: {
			type: String,
			required: true,
		},
		customer_id: {
			type: String,
			required: true,
		},
	},
    cart: {
        cart_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Cart',
        },
        date_checkout: {
            type: String,
            required: true,
        },
        total: {
            type: Number,
            required: true,
        }
    }
});

module.exports = mongoose.model("Order", orderSchema);
