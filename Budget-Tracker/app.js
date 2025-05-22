const express = require('express');
const path = require('path');
const Budget = require('./models/Budget');

const app = express();

const database = require('./config/database');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded()); 




app.get('/', async (req, res) => {
  const budget = await Budget.findOne({});
  let spent = 0;
  if (budget) {
    spent = budget.expenses.reduce((sum, item) => sum + item.amount, 0);
  }
  res.render('index', { budget, spent });
});

// POST Set Budget
app.post('/set-budget', async (req, res) => {
  await Budget.deleteMany({});
  const newBudget = new Budget({ total: req.body.total, expenses: [] });
  await newBudget.save();
  res.redirect('/');
});

// POST Add Expense
app.post('/add-expense', async (req, res) => {
  const { title, amount } = req.body;
  const budget = await Budget.findOne({});
  if (budget) {
    budget.expenses.push({ title, amount });
    await budget.save();
  }
  res.redirect('/');
});

// POST Delete Expense
app.post('/delete-expense/:id', async (req, res) => {
  const { id } = req.params;
  const budget = await Budget.findOne({});
  if (budget) {
    budget.expenses = budget.expenses.filter(exp => exp._id.toString() !== id);
    await budget.save();
  }
  res.redirect('/');
});

// Start server
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});