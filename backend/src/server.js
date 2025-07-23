// backend/src/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv'); // dotenv ko import kiya
const connectDB = require('./config/db'); // Database connection function ko import kiya
const Transaction = require('./models/Transaction'); // Transaction model ko import kiya
const Category = require('./models/Category'); // Category model ko import kiya

// .env file se environment variables load karein
dotenv.config();

// Database se connect karein
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all origins (for development)
app.use(bodyParser.json()); // Parse JSON request bodies

// --- API Routes ---

// Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    // Database se saari transactions fetch karein
    const transactions = await Transaction.find({});
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add a new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;

    // Nayi transaction create karein
    const newTransaction = new Transaction({
      description,
      amount,
      type,
      category,
      date: date || Date.now(), // Agar date provide nahi ki gayi, toh current date use karein
    });

    // Transaction ko database mein save karein
    const createdTransaction = await newTransaction.save();
    res.status(201).json(createdTransaction);
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    // Database se saari categories fetch karein
    const categories = await Category.find({});
    // Agar categories nahi hain, toh default categories add karein
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Food', type: 'expense' },
        { name: 'Income', type: 'income' },
        { name: 'Housing', type: 'expense' },
        { name: 'Dining', type: 'expense' },
        { name: 'Transport', type: 'expense' },
        { name: 'Utilities', type: 'expense' },
        { name: 'Entertainment', type: 'expense' },
        { name: 'Shopping', type: 'expense' },
        { name: 'Health', type: 'expense' },
      ];
      await Category.insertMany(defaultCategories);
      return res.json(defaultCategories); // Default categories return karein
    }
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Basic route for root
app.get('/', (req, res) => {
  res.send('Fintrack Backend API is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access backend at http://localhost:${PORT}`);
});
