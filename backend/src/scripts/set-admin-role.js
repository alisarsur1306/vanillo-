const admin = require('../firebase-admin');

async function setAdminRole(email) {
    try {
        // Get user by email
        const user = await admin.auth().getUserByEmail(email);
        
        // Set admin role
        await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
        
        console.log(`Successfully set admin role for user: ${email}`);
    } catch (error) {
        console.error('Error setting admin role:', error);
    }
}

// Set admin role for the admin user
setAdminRole('admin@vanillo.com'); 