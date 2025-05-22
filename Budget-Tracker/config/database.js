const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/budgetapp');

const database = mongoose.connection;

database.once('open', function(err) {
    if(err){
        console.log(err)
        return false
    }
  console.log('Connected to MongoDB');
});

module.exports = database;