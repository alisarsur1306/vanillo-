const admin = require('../firebase-admin');

async function createAdminUser() {
    try {
        // Create the admin user
        const userRecord = await admin.auth().createUser({
            email: 'admin@vanillo.com',
            password: 'admin123',
            emailVerified: true
        });

        // Set admin role
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'admin' });

        console.log('Admin user created successfully:', {
            uid: userRecord.uid,
            email: userRecord.email,
            role: 'admin'
        });
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

createAdminUser(); 