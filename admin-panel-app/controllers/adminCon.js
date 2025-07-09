const Admin = require('../models/blog');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
// In-memory OTP store
let otpStore = {};

// ===================== AUTH =====================
module.exports.registerPage = (req, res) => {
  res.render('register', { error: null });
};

module.exports.registerAdmin = async (req, res) => {
  try {
    const {
      firstName, lastName, email, password,
      mobileNumber, country, gender, hobbies, description
    } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.render('register', { error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const admin = new Admin({
      firstName, lastName, email, password: hashed,
      mobileNumber, country, gender,
      hobbies: Array.isArray(hobbies) ? hobbies : [hobbies],
      description,
      profileImage: req.file ? req.file.filename : null
    });

    await admin.save();
    res.redirect('/signin');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Something went wrong. Please try again.' });
  }
};


module.exports.signInPage = (req, res) => {
  res.render('signIn', { error: null });
};

module.exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.render('signIn', { error: 'Admin not found' });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.render('signIn', { error: 'Invalid password' });

    // ✅ Set cookie
    res.cookie('adminToken', admin._id.toString(), {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.redirect('/dashboard');
  } catch (err) {
    res.render('signIn', { error: 'Login failed' });
  }
};


module.exports.logout = (req, res) => {
  res.clearCookie('adminToken');
  res.redirect('/signin');
};


// ===================== DASHBOARD =====================

module.exports.dashboard = async (req, res) => {
  const adminCount = await Admin.countDocuments();
  res.render('dashboard', { adminCount });
};

// ===================== ADMIN CRUD =====================

const countriesList = ["India", "USA", "UK", "Canada", "Germany", "France"];

module.exports.addAdminPage = (req, res) => {
  const countriesList = ["India", "USA", "UK", "Canada", "Germany", "France"];
  res.render('addAdmin', {
    error: null,
    admin: {
      hobbies: [],
    }, 
    countries: countriesList,
    registerMode: true 
  });
};


module.exports.createAdmin = async (req, res) => {
  const countries = ['India', 'USA', 'UK', 'Canada', 'Germany', 'France'];

  try {
    const {
      firstName, lastName, email, password,
      mobileNumber, country, gender, hobbies, description
    } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.render('addAdmin', {
        error: 'Email already exists',
        countries
      });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPass,
      mobileNumber,
      country,
      gender,
      hobbies: Array.isArray(hobbies) ? hobbies : [hobbies],
      description,
      profileImage: req.file ? req.file.filename : null
    });

    await newAdmin.save();
    res.redirect('/view-admin');

  } catch (err) {
    console.log("Admin Create Error:", err);
    res.render('addAdmin', {
      error: 'Failed to add admin',
      registerMode: true,
      countries
    });
  }
};


module.exports.viewAdmins = async (req, res) => {
  const perPage = 5; // or whatever limit you want
  const page = parseInt(req.query.page) || 1;
  const searchQuery = req.query.search || '';

  const query = {
    $or: [
      { firstName: { $regex: searchQuery, $options: 'i' } },
      { lastName: { $regex: searchQuery, $options: 'i' } },
      { email: { $regex: searchQuery, $options: 'i' } }
    ]
  };

  try {
    const totalAdmins = await Admin.countDocuments(query);
    const totalPages = Math.ceil(totalAdmins / perPage);

    const admins = await Admin.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.render('viewAdmin', {
      admins,
      currentPage: page,
      totalPages,
      searchQuery
    });
  } catch (err) {
    res.status(500).send("Error while fetching admins");
  }
};




module.exports.editAdminPage = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.redirect('/admin/view-admin');
    }

    res.render('updateAdmin', {
      admin: admin,
      countries: countriesList,
      error: null
    });
  } catch (err) {
    console.log(err);
    res.redirect('/view-admin');
  }
};

module.exports.updateAdmin = async (req, res) => {
  try {
    const {
      firstName, lastName, email,
      mobileNumber, country, gender, hobbies, description
    } = req.body;

    const updatedData = {
      firstName, lastName, email,
      mobileNumber, country, gender,
      hobbies: Array.isArray(hobbies) ? hobbies : [hobbies],
      description
    };

    if (req.file) {
      updatedData.profileImage = req.file.filename;
    }

    await Admin.findByIdAndUpdate(req.params.id, updatedData);
    res.redirect('/view-admin');
  } catch (err) {
    res.render('updateAdmin', { error: 'Failed to update admin' });
  }
};

module.exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.redirect('/view-admin');
    }

    // Delete image from /Uploads folder
    if (admin.profileImage) {
      const imagePath = path.join(__dirname, '../Uploads', admin.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // delete image file
      }
    }

    // Delete admin from DB
    await Admin.findByIdAndDelete(req.params.id);

    res.redirect('/view-admin');
  } catch (err) {
    console.log('Error deleting admin:', err);
    res.redirect('/view-admin');
  }
};

exports.deleteMultipleAdmins = async (req, res) => {
  const ids = req.body.ids; // e.g., ["id1", "id2", ...]
  if (!ids || ids.length === 0) {
    return res.redirect('/view-admin');
  }

  try {
    const admins = await Admin.find({ _id: { $in: ids } });

    // Delete all images
    admins.forEach(admin => {
      if (admin.profileImage) {
        const imagePath = path.join(__dirname, '../Uploads', admin.profileImage);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    });

    // Delete all admins
    await Admin.deleteMany({ _id: { $in: ids } });

    res.redirect('/view-admin');
  } catch (err) {
    console.log('Multiple delete error:', err);
    res.redirect('/view-admin');
  }
};
// ===================== FORGOT PASSWORD FLOW =====================

module.exports.forgotPasswordPage = (req, res) => {
  res.render('forgotPassword/checkEmailPage', { error: null });
};

module.exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin) return res.render('forgotPassword/checkEmailPage', { error: 'Email not found' });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kabirkansara1140@gmail.com',
      pass: 'mozcmqzjzmskgwcq'
    }
  });

  await transporter.sendMail({
    from: 'Admin Panel',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}`
  });

  res.redirect(`/otp?email=${email}`);
};

module.exports.otpPage = (req, res) => {
  res.render('forgotPassword/otpPage', { email: req.query.email, error: null });
};

module.exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] == otp) {
    delete otpStore[email];
    res.redirect(`/change-password?email=${email}`);
  } else {
    res.render('forgotPassword/otpPage', { email, error: 'Invalid OTP' });
  }
};

module.exports.changePasswordPage = (req, res) => {
  res.render('changePassword', { email: req.query.email, error: null });
};

module.exports.updatePassword = async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  await Admin.findOneAndUpdate({ email }, { password: hashed });

  res.redirect('/signin');
};
