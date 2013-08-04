var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
  _id: {type: String, required: true},
  sku: { type: String, required: false },
  category: { type: String, required: true },
  name: { type: String, required: true },
  make: { type: String, required: false },
  model: { type: String, required: false },
  upc: { type: String, required: false },
  seo: { type: String, required: false },
  picture: {type: String, required: false},
  featured: { type: Boolean, required: false },

  shipping: {
    weight: { type: Number, required: false },
    dimensions: {
      width: { type: Number, required: false },
      height: { type: Number, required: false },
      depth: { type: Number, required: false }
    },
  },

  pricing: {
    list: { type: Number, required: false },
    retail: { type: Number, required: true },
    pct_savings: { type: Number, required: false }
  },

  details: {
    description: { type: String, required: false },
    artist: { type: String, required: false },
    genre: { type: String, required: false },
  },
});

module.exports = mongoose.model('Product', ProductSchema);
