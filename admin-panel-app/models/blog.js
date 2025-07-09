const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    country: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    hobbies: { type: [String], enum: ['Music', 'Coding', 'Travelling'] },
    description: String,
    profileImage: String,
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Admin', adminSchema);
