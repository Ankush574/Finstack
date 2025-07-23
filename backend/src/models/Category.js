
const mongoose = require('mongoose'); 

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true, 
      unique: true, 
    },
    type: {
      type: String,
      enum: ['income', 'expense'], 
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const Category = mongoose.model('Category', categorySchema); 

module.exports = Category; 