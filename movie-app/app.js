const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const movieRoutes = require('./routes/movieRoutes');
const db = require('./config/db');



const app = express();



// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', movieRoutes);

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
