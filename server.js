require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3002;
const http = require('http');
const WebSocket = require('ws');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const { menuData, restaurantInfo } = require('./menu-data.js');
const axios = require('axios');
const crypto = require('crypto');

// Authentication configuration
const USERS = {
    admin: {
        username: 'Ali',
        password: 'Sewar25021995!',
        role: 'admin'
    },
    orders: {
        username: 'Ali',
        password: 'Sewar25021995!',
        role: 'orders'
    }
};

// Create sessions directory if it doesn't exist
const sessionsDir = path.join(__dirname, 'sessions');
try {
    if (!fs.existsSync(sessionsDir)) {
        fs.mkdirSync(sessionsDir, { recursive: true, mode: 0o755 });
    }
} catch (error) {
    console.error('Error creating sessions directory:', error);
    // Continue without file-based sessions if directory creation fails
}

// Session configuration
app.use(session({
    store: new FileStore({
        path: sessionsDir,
        ttl: 24 * 60 * 60, // 24 hours
        reapInterval: 60 * 60, // Clean up expired sessions every hour
        retries: 3, // Add retry logic
        secret: process.env.SESSION_SECRET || 'vanillo-secret-key',
        logFn: function(message) {
            console.log('[Session]', message);
        }
    }),
    secret: process.env.SESSION_SECRET || 'vanillo-secret-key',
    resave: false, // Changed to false to reduce file system operations
    saveUninitialized: false, // Changed to false to reduce file system operations
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true
    }
}));

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://vanillo.onrender.com' : '*',
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Place the real /api/payment handler here
app.post('/api/payment', async (req, res) => {
    try {
        const items = req.body.items;
        const client_name = req.body.client_name || req.body.customer?.name || '';
        const client_email = req.body.client_email || req.body.customer?.email || '';
        const client_phone = req.body.client_phone || req.body.customer?.phone || '';
        const order_id = 'ORDER_' + Date.now();
        const request = {
            items,
            login: process.env.ALLPAY_LOGIN || ALLPAY_CONFIG.apiLogin,
            order_id,
            currency: 'ILS',
            lang: 'HE',
            notifications_url: process.env.API_BASE_URL ? `${process.env.API_BASE_URL}/api/payment/notify` : 'http://localhost:3002/api/payment/notify',
            client_name,
            client_email,
            client_phone,
            expire: Math.floor(Date.now() / 1000) + 3600
        };
        request.sign = generateAllpaySignature(request, process.env.ALLPAY_KEY || ALLPAY_CONFIG.apiKey);

        const response = await axios.post(ALLPAY_CONFIG.apiUrl, request, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data && response.data.payment_url) {
            res.json({ payment_url: response.data.payment_url });
        } else {
            res.status(400).json({ error: 'No payment link found', data: response.data });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error when submitting request', details: error.message });
    }
});

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Authentication routes
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Check both admin and orders accounts
    const adminUser = USERS.admin;
    const ordersUser = USERS.orders;
    
    if ((adminUser.username === username && adminUser.password === password) ||
        (ordersUser.username === username && ordersUser.password === password)) {
        req.session.user = {
            username: username,
            role: username === adminUser.username ? 'admin' : 'orders'
        };
        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                res.status(500).json({ error: 'Failed to save session' });
            } else {
                res.json({ success: true, role: req.session.user.role });
            }
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({ error: 'Failed to logout' });
        } else {
            res.json({ success: true });
        }
    });
});

app.get('/api/check-auth', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ authenticated: true, role: req.session.user.role });
    } else {
        res.json({ authenticated: false });
    }
});

// Create orders directory if it doesn't exist
const ordersDir = path.join(__dirname, 'orders');
if (!fs.existsSync(ordersDir)) {
    fs.mkdirSync(ordersDir, { recursive: true });
}

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    // Send initial orders data
    sendOrdersToClient(ws);
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Function to send orders to a specific client
function sendOrdersToClient(ws) {
    try {
        const orders = getAllOrders();
        ws.send(JSON.stringify({ type: 'orders', data: orders }));
    } catch (error) {
        console.error('Error sending orders to client:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Failed to load orders' }));
    }
}

// Function to broadcast orders to all connected clients
function broadcastOrders() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            sendOrdersToClient(client);
        }
    });
}

// Function to load menu data from JSON file
function loadMenuData() {
    try {
        const menuDataPath = path.join(__dirname, 'menu-data.json');
        if (fs.existsSync(menuDataPath)) {
            const data = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));
            Object.assign(menuData, data);
            console.log('Menu data loaded from JSON file');
        } else {
            // If JSON file doesn't exist, create it from the module
            const { menuData: moduleData } = require('./menu-data.js');
            fs.writeFileSync(menuDataPath, JSON.stringify(moduleData, null, 4));
            Object.assign(menuData, moduleData);
            console.log('Created menu-data.json from module');
        }
    } catch (error) {
        console.error('Error loading menu data:', error);
    }
}

// Load menu data on server start
loadMenuData();

// API endpoint to update menu data
app.put('/api/menu', (req, res) => {
    console.log('Received request to update menu data:', req.body);
    try {
        // Update the in-memory menu data
        const { categories, items } = req.body;
        
        if (categories) {
            // If updating a single category
            if (categories.id) {
                const categoryIndex = menuData.categories.findIndex(c => c.id === categories.id);
                if (categoryIndex !== -1) {
                    menuData.categories[categoryIndex] = {
                        ...menuData.categories[categoryIndex],
                        ...categories
                    };
                } else {
                    return res.status(404).json({
                        success: false,
                        error: 'Category not found'
                    });
                }
            } else {
                // If updating all categories
                menuData.categories = categories;
            }
        }
        
        if (items) {
            menuData.items = items;
        }

        // Write the updated data to menu-data.json
        const menuDataPath = path.join(__dirname, 'menu-data.json');
        fs.writeFileSync(menuDataPath, JSON.stringify(menuData, null, 4));
        console.log('Menu data updated successfully');
        
        res.json({ 
            success: true, 
            message: 'Menu data updated successfully',
            data: menuData
        });
    } catch (error) {
        console.error('Error updating menu data:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update menu data' 
        });
    }
});

// API endpoint to get menu data
app.get('/api/menu', (req, res) => {
    try {
        // Always read from the JSON file
        const menuDataPath = path.join(__dirname, 'menu-data.json');
        const data = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));
        res.json(data);
    } catch (error) {
        console.error('Error getting menu data:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get menu data' 
        });
    }
});

// API endpoint for restaurant info
app.get('/api/restaurant-info', (req, res) => {
    res.json(restaurantInfo);
});

// API endpoint to add a new menu item
app.post('/api/menu', (req, res) => {
    try {
        const newItem = req.body;
        
        // Validate required fields
        if (!newItem.name || !newItem.price || !newItem.categoryId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Generate a unique ID
        newItem.id = `${newItem.categoryId}-${Date.now()}`;
        
        // Add the new item to the items array
        menuData.items.push(newItem);
        
        // Save to file
        fs.writeFileSync('menu-data.json', JSON.stringify(menuData, null, 4));
        
        res.json({ success: true, item: newItem });
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ success: false, message: 'Error adding menu item' });
    }
});

// API endpoint to update a menu item
app.put('/api/menu/:id', (req, res) => {
    try {
        const itemId = req.params.id;
        const updatedItem = req.body;
        
        // Find the item index
        const itemIndex = menuData.items.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        
        // Update the item
        menuData.items[itemIndex] = { ...menuData.items[itemIndex], ...updatedItem };
        
        // Save to file
        fs.writeFileSync('menu-data.json', JSON.stringify(menuData, null, 4));
        
        res.json({ success: true, item: menuData.items[itemIndex] });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ success: false, message: 'Error updating menu item' });
    }
});

// API endpoint to delete a menu item
app.delete('/api/menu/:id', (req, res) => {
    try {
        const itemId = req.params.id;
        
        // Find the item index
        const itemIndex = menuData.items.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        
        // Remove the item
        menuData.items.splice(itemIndex, 1);
        
        // Save to file
        fs.writeFileSync('menu-data.json', JSON.stringify(menuData, null, 4));
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ success: false, message: 'Error deleting menu item' });
    }
});

// API endpoint to add a new category
app.post('/api/categories', (req, res) => {
    try {
        const newCategory = req.body;
        
        // Validate required fields
        if (!newCategory.name || !newCategory.id) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        // Add the new category
        menuData.categories.push(newCategory);
        
        // Save to file
        fs.writeFileSync('menu-data.json', JSON.stringify(menuData, null, 4));
        
        res.json({ success: true, category: newCategory });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ success: false, message: 'Error adding category' });
    }
});

// API endpoint to update a category
app.put('/api/categories/:id', (req, res) => {
    try {
        const categoryId = req.params.id;
        const updatedCategory = req.body;
        
        // Find the category index
        const categoryIndex = menuData.categories.findIndex(category => category.id === categoryId);
        
        if (categoryIndex === -1) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        
        // Update the category
        menuData.categories[categoryIndex] = { ...menuData.categories[categoryIndex], ...updatedCategory };
        
        // Save to file
        fs.writeFileSync('menu-data.json', JSON.stringify(menuData, null, 4));
        
        res.json({ success: true, category: menuData.categories[categoryIndex] });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, message: 'Error updating category' });
    }
});

// API endpoint to delete a category
app.delete('/api/categories/:id', (req, res) => {
    try {
        const categoryId = req.params.id;
        
        // Find the category index
        const categoryIndex = menuData.categories.findIndex(category => category.id === categoryId);
        
        if (categoryIndex === -1) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        
        // Check if there are items in this category
        const itemsInCategory = menuData.items.filter(item => item.categoryId === categoryId);
        if (itemsInCategory.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete category with existing items' 
            });
        }
        
        // Remove the category
        menuData.categories.splice(categoryIndex, 1);
        
        // Save to file
        fs.writeFileSync('menu-data.json', JSON.stringify(menuData, null, 4));
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: 'Error deleting category' });
    }
});

// Function to get the next order ID
function getNextOrderId() {
    const counterPath = path.join(__dirname, 'order-counter.json');
    let counter = { lastOrderId: 0 };
    
    if (fs.existsSync(counterPath)) {
        counter = JSON.parse(fs.readFileSync(counterPath, 'utf8'));
    }
    
    counter.lastOrderId += 1;
    fs.writeFileSync(counterPath, JSON.stringify(counter, null, 2));
    return counter.lastOrderId;
}

// Store active countdown timers
const activeTimers = new Map();

// Function to get remaining time for an order
function getOrderRemainingTime(orderId) {
    const orderFile = path.join(ordersDir, `order-${orderId}.json`);
    if (!fs.existsSync(orderFile)) {
        return { timeLeft: 0, prepTime: 0, countdownStartTime: null };
    }

    const orderData = JSON.parse(fs.readFileSync(orderFile, 'utf8'));
    if (!orderData.countdownStartTime || !orderData.prepTime) {
        return { timeLeft: 0, prepTime: 0, countdownStartTime: null };
    }

    const now = Date.now();
    const startTime = new Date(orderData.countdownStartTime).getTime();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const totalSeconds = orderData.prepTime * 60;
    const timeLeft = Math.max(0, totalSeconds - elapsedSeconds);

    // If time is up, update the order status to ready
    if (timeLeft <= 0 && orderData.status === 'preparing') {
        orderData.status = 'ready';
        fs.writeFileSync(orderFile, JSON.stringify(orderData, null, 2));
        
        // Broadcast the status change
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'order_update',
                    data: {
                        ...orderData,
                        timeLeft: 0,
                        prepTime: 0,
                        countdownStartTime: null
                    }
                }));
            }
        });
    }

    return {
        timeLeft,
        prepTime: orderData.prepTime,
        countdownStartTime: orderData.countdownStartTime
    };
}

// Function to start or update a countdown timer for an order
function handleOrderTimer(orderId, prepTime) {
    // Get the order file to check if it exists and get current state
    const orderFile = path.join(ordersDir, `order-${orderId}.json`);
    if (!fs.existsSync(orderFile)) {
        console.log(`Order file not found for ID ${orderId}`);
        return;
    }

    const orderData = JSON.parse(fs.readFileSync(orderFile, 'utf8'));
    
    // Always set a new countdown start time when starting preparation
    if (orderData.status !== 'preparing' || orderData.prepTime !== prepTime) {
        orderData.countdownStartTime = new Date().toISOString();
        orderData.prepTime = prepTime;
        
        // Save the updated order data immediately
        fs.writeFileSync(orderFile, JSON.stringify(orderData, null, 2));
        console.log(`Started new countdown for order ${orderId} with ${prepTime} minutes`);
    }

    // Get current countdown information
    const countdownInfo = getOrderRemainingTime(orderId);

    // Broadcast the update with countdown information
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'order_update',
                data: {
                    ...orderData,
                    ...countdownInfo
                }
            }));
        }
    });
}

// API endpoint to submit orders
app.post('/api/orders', async (req, res) => {
    try {
        const order = req.body;
        const orderId = Date.now().toString();
        
        // Ensure orders directory exists with proper permissions
        try {
            if (!fs.existsSync(ordersDir)) {
                fs.mkdirSync(ordersDir, { recursive: true, mode: 0o755 });
            }
        } catch (dirError) {
            console.error('Error creating orders directory:', dirError);
            return res.status(500).json({ 
                error: 'Server configuration error',
                details: 'Unable to create orders directory'
            });
        }

        // Create order file with error handling
        try {
            const orderFile = path.join(ordersDir, `order-${orderId}.json`);
            fs.writeFileSync(orderFile, JSON.stringify(order, null, 2), { mode: 0o644 });
        } catch (writeError) {
            console.error('Error writing order file:', writeError);
            return res.status(500).json({ 
                error: 'Failed to save order',
                details: 'Unable to write order data'
            });
        }

        // If payment method is credit card, generate Allpay payment URL
        if (order.paymentMethod === 'credit_card') {
            console.log('[Allpay] Attempting to generate payment URL for order:', orderId);
            try {
                const paymentUrl = await generateAllpayPaymentUrl(order);
                console.log('[Allpay] Payment URL generated:', paymentUrl);
                res.json({ 
                    success: true, 
                    orderId,
                    paymentUrl 
                });
            } catch (err) {
                console.error('[Allpay] Error generating payment URL:', err);
                res.status(500).json({ 
                    error: 'Failed to generate payment URL', 
                    details: err.message 
                });
            }
        } else {
            res.json({ 
                success: true, 
                orderId 
            });
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            error: 'Failed to create order',
            details: error.message
        });
    }
});

// Allpay configuration
const ALLPAY_CONFIG = {
    apiLogin: 'pp1009681',
    apiKey: 'B139E36C2D7BC6D0AE615360588D929A',
    apiUrl: 'https://allpay.to/app/?show=getpayment&mode=api8'
};

// Generate Allpay signature
function generateAllpaySignature(params, apiKey) {
    try {
        // Create a copy of params without the sign parameter
        const paramsCopy = { ...params };
        delete paramsCopy.sign;

        // Sort parameters alphabetically
        const sortedKeys = Object.keys(paramsCopy).sort();
        const chunks = [];

        sortedKeys.forEach((key) => {
            const value = paramsCopy[key];

            if (Array.isArray(value)) {
                // Handle items array
                value.forEach((item) => {
                    if (typeof item === 'object' && item !== null) {
                        // Sort item properties alphabetically
                        const sortedItemKeys = Object.keys(item).sort();
                        sortedItemKeys.forEach((itemKey) => {
                            const itemValue = item[itemKey];
                            if (typeof itemValue === 'string' && itemValue.trim() !== '') {
                                chunks.push(itemValue);
                            } else if (typeof itemValue === 'number') {
                                chunks.push(String(itemValue));
                            }
                        });
                    }
                });
            } else if (typeof value === 'string' && value.trim() !== '') {
                chunks.push(value);
            } else if (typeof value === 'number') {
                chunks.push(String(value));
            }
        });

        const signatureString = chunks.join(':') + ':' + apiKey;
        console.log('Signature string:', signatureString);

        return crypto
            .createHash('sha256')
            .update(signatureString)
            .digest('hex');
    } catch (error) {
        console.error('Error generating signature:', error);
        throw error;
    }
}

// Generate Allpay payment URL
async function generateAllpayPaymentUrl(paymentData) {
    try {
        console.log('Generating Allpay payment URL with data:', paymentData);
        
        // Validate required fields
        if (!paymentData.items || !Array.isArray(paymentData.items) || paymentData.items.length === 0) {
            throw new Error('Invalid or missing items in payment data');
        }

        if (!paymentData.customer || !paymentData.customer.name || !paymentData.customer.phone) {
            throw new Error('Invalid or missing customer information');
        }

        // Prepare the request with exact parameter order as per Allpay documentation
        const request = {
            login: ALLPAY_CONFIG.apiLogin,
            items: paymentData.items.map(item => ({
                name: item.name,
                price: item.price,
                qty: item.quantity || 1,
                vat: 1 // 18% VAT included
            })),
            order_id: paymentData.orderId || `ORDER_${Date.now()}`,
            client_name: paymentData.customer.name,
            client_email: paymentData.customer.email || '',
            client_phone: paymentData.customer.phone,
            currency: 'ILS',
            lang: 'HE',
            notifications_url: `${process.env.API_BASE_URL || 'http://localhost:3002'}/api/payment/notify`,
            success_url: process.env.NODE_ENV === 'production'
              ? 'https://vanillo.onrender.com/payment/success'
              : `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
            backlink_url: process.env.NODE_ENV === 'production'
              ? 'https://vanillo.onrender.com/payment/cancel'
              : `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
            expire: Math.floor(Date.now() / 1000) + 3600 // Link expires in 1 hour
        };

        console.log('Allpay request:', request);

        // Generate signature
        const sign = generateAllpaySignature(request, ALLPAY_CONFIG.apiKey);
        const requestWithSign = { ...request, sign };

        console.log('Sending request to Allpay with signature:', sign);
        console.log('Full request with signature:', JSON.stringify(requestWithSign, null, 2));

        // Send request to Allpay
        const response = await axios.post(ALLPAY_CONFIG.apiUrl, requestWithSign, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Allpay response:', response.data);

        if (!response.data || !response.data.payment_url) {
            throw new Error('Invalid response from Allpay');
        }

        return response.data.payment_url;
    } catch (error) {
        console.error('Error generating Allpay payment URL:', error);
        throw new Error('Failed to generate payment URL: ' + error.message);
    }
}

// Payment notification endpoint
app.post('/api/payment/notify', async (req, res) => {
    try {
        console.log('Received payment notification:', req.body);
        
        // Generate signature for verification
        const calculatedSign = generateAllpaySignature(req.body, ALLPAY_CONFIG.apiKey);
        console.log('Calculated signature:', calculatedSign);
        console.log('Received signature:', req.body.sign);
        
        // Verify signature and status
        if (req.body.status === 1 && calculatedSign === req.body.sign) {
            console.log('Payment verified successfully');
            const { order_id } = req.body;
            
            // Update order status
            const orderPath = path.join(ordersDir, `order-${order_id}.json`);
            if (fs.existsSync(orderPath)) {
                const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
                order.status = 'paid';
                fs.writeFileSync(orderPath, JSON.stringify(order, null, 2));
                broadcastOrders(); // Notify all connected clients
            }
            
            res.status(200).json({ received: true });
        } else {
            console.error('Invalid payment notification:', {
                status: req.body.status,
                signatureMatch: calculatedSign === req.body.sign
            });
            res.status(400).json({ error: 'Invalid payment notification' });
        }
    } catch (error) {
        console.error('Payment notification error:', error);
        res.status(500).json({ error: 'Failed to process payment notification' });
    }
});

// API endpoint to get all orders
app.get('/api/orders', (req, res) => {
    console.log('Received request for orders');
    try {
        const ordersDir = path.join(__dirname, 'orders');
        if (!fs.existsSync(ordersDir)) {
            return res.json([]);
        }
        
        const orderFiles = fs.readdirSync(ordersDir);
        const orders = orderFiles
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const orderPath = path.join(ordersDir, file);
                const orderData = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
                return orderData;
            })
            .sort((a, b) => b.id - a.id); // Sort by numeric ID in descending order
            
        console.log(`Retrieved ${orders.length} orders`);
        res.json(orders);
    } catch (error) {
        console.error('Error reading orders:', error);
        res.status(500).json({ error: 'Failed to load orders' });
    }
});

// API endpoint to get order history
app.get('/api/orders/history', (req, res) => {
    console.log('Received request for order history');
    try {
        const ordersDir = path.join(__dirname, 'orders');
        if (!fs.existsSync(ordersDir)) {
            return res.json([]);
        }
        
        const orderFiles = fs.readdirSync(ordersDir);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const orders = orderFiles
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const orderPath = path.join(ordersDir, file);
                const orderData = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
                return orderData;
            })
            .filter(order => {
                const orderDate = new Date(order.timestamp);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate < today && order.status === 'delivered';
            })
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
        console.log(`Retrieved ${orders.length} historical orders`);
        res.json(orders);
    } catch (error) {
        console.error('Error reading order history:', error);
        res.status(500).json({ error: 'Failed to load order history' });
    }
});

// API endpoint to get a specific order
app.get('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    console.log(`Retrieving order ${orderId}`);
    
    try {
        const orderFile = path.join(ordersDir, `order-${orderId}.json`);
        if (!fs.existsSync(orderFile)) {
            return res.status(404).json({ 
                success: false, 
                error: 'Order not found' 
            });
        }
        
        const orderData = JSON.parse(fs.readFileSync(orderFile, 'utf8'));
        // Ensure OrderID and orderNumber are set
        if (!orderData.OrderID) {
            orderData.OrderID = parseInt(orderId);
            orderData.orderNumber = `#${orderId}`;
            // Update the file with the OrderID and orderNumber
            fs.writeFileSync(orderFile, JSON.stringify(orderData, null, 2));
        } else if (!orderData.orderNumber) {
            orderData.orderNumber = `#${orderData.OrderID}`;
            // Update the file with the orderNumber
            fs.writeFileSync(orderFile, JSON.stringify(orderData, null, 2));
        }
        
        res.json(orderData);
    } catch (error) {
        console.error('Error retrieving order:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to retrieve order' 
        });
    }
});

// API endpoint to update an order
app.put('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    console.log(`Updating order ${orderId}:`, req.body);
    
    try {
        const orderFile = path.join(ordersDir, `order-${orderId}.json`);
        if (!fs.existsSync(orderFile)) {
            return res.status(404).json({ 
                success: false, 
                error: 'Order not found' 
            });
        }
        
        const orderData = JSON.parse(fs.readFileSync(orderFile, 'utf8'));
        
        // Update only the fields that are provided in the request
        const updatedOrder = {
            ...orderData,  // Keep all existing order data
            ...req.body,   // Override only the fields that are provided
            OrderID: orderData.OrderID,  // Ensure OrderID is preserved
            id: orderData.id,           // Ensure id is preserved
            orderNumber: orderData.orderNumber,  // Ensure orderNumber is preserved
            items: orderData.items,     // Ensure items are preserved
            total: orderData.total,     // Ensure total is preserved
            customer: orderData.customer // Ensure customer info is preserved
        };
        
        // Handle prepTime changes
        if (req.body.prepTime !== undefined && req.body.prepTime !== orderData.prepTime) {
            if (req.body.prepTime > 0) {
                handleOrderTimer(orderId, req.body.prepTime);
            } else {
                updatedOrder.prepTime = 0;
                updatedOrder.countdownStartTime = null;
            }
        }
        
        // Save updated order
        fs.writeFileSync(orderFile, JSON.stringify(updatedOrder, null, 2));
        console.log(`Order updated successfully: ${orderFile}`);

        // Get current countdown information
        const countdownInfo = getOrderRemainingTime(orderId);
        
        // Broadcast the update with countdown information
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ 
                    type: 'order_update', 
                    data: {
                        ...updatedOrder,
                        ...countdownInfo
                    }
                }));
            }
        });
        
        res.json({ 
            success: true, 
            message: 'Order updated successfully',
            order: {
                ...updatedOrder,
                ...countdownInfo
            }
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update order' 
        });
    }
});

// API endpoint to delete an order
app.delete('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    console.log(`Deleting order ${orderId}`);
    
    try {
        const orderFile = path.join(ordersDir, `order-${orderId}.json`);
        if (!fs.existsSync(orderFile)) {
            return res.status(404).json({ 
                success: false, 
                error: 'Order not found' 
            });
        }
        
        // Clear any active timer for this order
        if (activeTimers.has(orderId)) {
            clearInterval(activeTimers.get(orderId));
            activeTimers.delete(orderId);
        }
        
        // Delete the order file
        fs.unlinkSync(orderFile);
        console.log(`Order deleted successfully: ${orderFile}`);
        
        // Broadcast the deletion to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ 
                    type: 'order_deleted', 
                    orderId: orderId
                }));
            }
        });
        
        res.json({ 
            success: true, 
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete order' 
        });
    }
});

// Add new endpoint to get countdown time for an order
app.get('/api/orders/:id/countdown', (req, res) => {
    const orderId = req.params.id;
    const timeLeft = getOrderRemainingTime(orderId);
    res.json({ timeLeft });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Call migration function when server starts
migrateTimestampOrders();

// Helper function to get all orders
function getAllOrders() {
    const orders = [];
    const files = fs.readdirSync(ordersDir);
    
    for (const file of files) {
        if (file.endsWith('.json')) {
            const orderData = fs.readFileSync(path.join(ordersDir, file), 'utf8');
            const order = JSON.parse(orderData);
            // Ensure OrderID and orderNumber are set from the filename if not present
            if (!order.OrderID) {
                const orderId = parseInt(file.replace('order-', '').replace('.json', ''));
                order.OrderID = orderId;
                order.orderNumber = `#${orderId}`;
                // Update the file with the OrderID and orderNumber
                fs.writeFileSync(path.join(ordersDir, file), JSON.stringify(order, null, 2));
            } else if (!order.orderNumber) {
                order.orderNumber = `#${order.OrderID}`;
                // Update the file with the orderNumber
                fs.writeFileSync(path.join(ordersDir, file), JSON.stringify(order, null, 2));
            }
            orders.push(order);
        }
    }
    
    return orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Function to migrate timestamp-based orders to numeric IDs
function migrateTimestampOrders() {
    const ordersDir = path.join(__dirname, 'orders');
    if (!fs.existsSync(ordersDir)) return;
    
    const orderFiles = fs.readdirSync(ordersDir);
    let migrated = false;
    
    for (const file of orderFiles) {
        if (!file.endsWith('.json')) continue;
        
        // Skip if file already has numeric ID format
        if (file.match(/order-\d+\.json/)) continue;
        
        const filePath = path.join(ordersDir, file);
        const orderData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Generate new numeric ID
        const newId = getNextOrderId();
        const newFileName = `order-${newId}.json`;
        const newFilePath = path.join(ordersDir, newFileName);
        
        // Update order data with new ID and remove timestamp
        orderData.id = newId;
        delete orderData.timestamp;
        
        // Save with new filename
        fs.writeFileSync(newFilePath, JSON.stringify(orderData, null, 2));
        
        // Delete old file
        fs.unlinkSync(filePath);
        
        migrated = true;
        console.log(`Migrated order from ${file} to ${newFileName}`);
    }
    
    if (migrated) {
        console.log('Order migration completed');
    }
}

// Checkout endpoint
app.post('/api/checkout', async (req, res) => {
    try {
        const { items, customer, deliveryType, paymentMethod } = req.body;

        console.log('Received checkout request:', req.body);

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error('Missing or invalid items');
            return res.status(400).json({ error: 'At least one item is required' });
        }

        if (!customer || !customer.name || !customer.phone) {
            console.error('Missing or invalid customer information');
            return res.status(400).json({ error: 'Customer information is required' });
        }

        // Generate unique order ID
        const orderId = `ORDER_${Date.now()}`;

        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

        // Prepare order data
        const orderData = {
            status: 'pending',
            customer,
            deliveryType,
            items,
            total,
            orderTime: new Date().toISOString(),
            paymentMethod
        };

        // Prepare Allpay request
        const request = {
            login: ALLPAY_CONFIG.apiLogin,
            items: items.map(item => ({
                name: item.name,
                qty: item.quantity || 1,
                price: item.price,
                vat: 1 // 18% VAT included
            })),
            order_id: orderId,
            client_name: customer.name,
            client_email: customer.email || '',
            client_phone: customer.phone,
            currency: 'ILS',
            lang: 'HE',
            notifications_url: `${process.env.API_BASE_URL || 'http://localhost:3002'}/api/payment/notify`,
            success_url: process.env.NODE_ENV === 'production'
              ? 'https://vanillo.onrender.com/payment/success'
              : `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
            backlink_url: process.env.NODE_ENV === 'production'
              ? 'https://vanillo.onrender.com/payment/cancel'
              : `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
            expire: Math.floor(Date.now() / 1000) + 3600 // Link expires in 1 hour
        };

        console.log('Allpay request:', JSON.stringify(request, null, 2));

        // Generate signature
        const sign = generateAllpaySignature(request, ALLPAY_CONFIG.apiKey);
        const requestWithSign = { ...request, sign };

        console.log('Sending request to Allpay with signature:', sign);
        console.log('Full request with signature:', JSON.stringify(requestWithSign, null, 2));

        try {
            // Send request to Allpay
            const response = await axios.post(ALLPAY_CONFIG.apiUrl, requestWithSign, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Allpay response:', response.data);

            if (!response.data || !response.data.payment_url) {
                console.error('Invalid response from Allpay:', response.data);
                throw new Error('No payment URL received from Allpay');
            }

            // Save order details
            const orderFile = path.join(ordersDir, `order-${orderId}.json`);
            fs.writeFileSync(orderFile, JSON.stringify(orderData, null, 2));

            // Notify connected clients
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'order_created',
                        orderId: orderId,
                        details: orderData
                    }));
                }
            });

            // Return payment URL
            res.json({
                success: true,
                orderId: orderId,
                paymentUrl: response.data.payment_url
            });
        } catch (allpayError) {
            console.error('Error from Allpay:', {
                message: allpayError.message,
                response: allpayError.response ? {
                    data: allpayError.response.data,
                    status: allpayError.response.status,
                    headers: allpayError.response.headers
                } : null,
                request: allpayError.request ? {
                    method: allpayError.request.method,
                    path: allpayError.request.path,
                    headers: allpayError.request._header
                } : null
            });
            throw allpayError;
        }
    } catch (error) {
        console.error('Error processing checkout:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response ? {
                data: error.response.data,
                status: error.response.status,
                headers: error.response.headers
            } : null,
            request: error.request ? {
                method: error.request.method,
                path: error.request.path,
                headers: error.request._header
            } : null
        });
        res.status(500).json({ error: 'Error processing checkout', details: error.message });
    }
});

// Export the Express API
module.exports = app;
   