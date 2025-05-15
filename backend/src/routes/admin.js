const express = require('express');
const router = express.Router();
const admin = require('../firebase-admin');
const { verifyAuth, requireAdmin } = require('../middleware/auth');

// Get all users
router.get('/users', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      role: user.customClaims?.role || 'user'
    }));
    res.json(users);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// Create a new user
router.post('/users', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Create the user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: true
    });
    
    // Set custom claims (role)
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });
    
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      role
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user role
router.put('/users/:uid/role', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;
    
    // Set custom claims (role)
    await admin.auth().setCustomUserClaims(uid, { role });
    
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user
router.delete('/users/:uid', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    await admin.auth().deleteUser(uid);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router; 