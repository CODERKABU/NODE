const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: String,
  amount: Number
});

const budgetSchema = new mongoose.Schema({
  total: Number,
  expenses: [expenseSchema]
});

module.exports = mongoose.model('Budget', budgetSchema);
