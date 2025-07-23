
const mongoose = require('mongoose'); 

const transactionSchema = mongoose.Schema(
  {
    description: {
      type: String,
      required: true, 
    },
    amount: {
      type: Number,
      required: true, 
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    category: {
      type: String,
      required: true, 
    },
    date: {
      type: Date,
      default: Date.now, 
    },
    
  },
  {
    timestamps: true, 
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema); // Model banaya

module.exports = Transaction; 
