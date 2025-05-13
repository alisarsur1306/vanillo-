const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

// Protected routes - require authentication
router.use(auth);

// Admin only routes
router.get('/', adminAuth, userController.getAllUsers);
router.post('/', adminAuth, userController.createUser);
router.get('/:id', adminAuth, userController.getUser);
router.put('/:id', adminAuth, userController.updateUser);
router.delete('/:id', adminAuth, userController.deleteUser);

// Password change route (accessible by the user themselves)
router.post('/:id/change-password', userController.changePassword);

module.exports = router; 