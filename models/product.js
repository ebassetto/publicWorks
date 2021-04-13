const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productsSchema = new Schema({
	sku: {
        type: String,
        required: true
    },
    name: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
});

module.exports = mongoose.model("Products", productsSchema);