const express = require('express');
const router = express.Router();
const adminCon = require('../controllers/adminCon');
const multer = require('multer');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ✅ Cookie-based middleware
const isAuthenticated = (req, res, next) => {
  if (req.cookies && req.cookies.adminToken) return next();
  return res.redirect('/signin');
};

router.get('/', (req, res) => res.redirect('/register'));

// Auth
router.get('/register', adminCon.registerPage);
router.post('/register', upload.single('profileImage'), adminCon.registerAdmin);
router.get('/signin', adminCon.signInPage);
router.post('/signin', adminCon.signIn);
router.get('/logout', adminCon.logout);

// Admin CRUD
router.get('/add-admin', isAuthenticated, adminCon.addAdminPage);
router.post('/add-admin', isAuthenticated, upload.single('profileImage'), adminCon.createAdmin);
router.get('/view-admin', isAuthenticated, adminCon.viewAdmins);
router.get('/edit-admin/:id', isAuthenticated, adminCon.editAdminPage);
router.get('/update-admin/:id', isAuthenticated, adminCon.editAdminPage);
router.post('/update-admin/:id', isAuthenticated, upload.single('profileImage'), adminCon.updateAdmin);
router.get('/delete-admin/:id', isAuthenticated, adminCon.deleteAdmin);
router.post('/multiple-delete', isAuthenticated, adminCon.deleteMultipleAdmins);

// Forgot Password
router.get('/forgot-password', adminCon.forgotPasswordPage);
router.post('/forgot-password', adminCon.sendOTP);
router.get('/otp', adminCon.otpPage);
router.post('/otp', adminCon.verifyOTP);
router.get('/change-password', adminCon.changePasswordPage);
router.post('/change-password', adminCon.updatePassword);

// Dashboard
router.get('/dashboard', isAuthenticated, adminCon.dashboard);

module.exports = router;
