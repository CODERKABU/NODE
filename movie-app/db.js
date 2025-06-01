const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/movieDB');

const db = mongoose.connection;

db.once('open', function(err) {
    if(err){
        console.log(err)
        return false
    }
  console.log('Connected to MongoDB');
});

module.exports = db;
