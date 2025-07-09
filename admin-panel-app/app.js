const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const adminRoutes = require('./routes/blogRoutes');
require('./config/database');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));
app.use(cookieParser());

// View Engine
app.set('view engine', 'ejs');

app.use('/assets', express.static(path.join(__dirname, 'assets')));


// EJS locals
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.cookies && req.cookies.adminToken;
  next();
});


// Redirect root to register
app.get('/', (req, res) => {
  res.redirect('/register');
});

// Mount routes
app.use('/', adminRoutes);

// Start
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server started at http://localhost:${PORT}`));
