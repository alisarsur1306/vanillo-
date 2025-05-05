const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
const http = require('http');
const WebSocket = require('ws');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const { menuData, restaurantInfo } = require('./menu-data.js');

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
if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
}

// Session configuration
app.use(session({
    store: new FileStore({
        path: sessionsDir,
        ttl: 24 * 60 * 60, // 24 hours
        reapInterval: 60 * 60 // Clean up expired sessions every hour
    }),
    secret: process.env.SESSION_SECRET || 'vanillo-secret-key',
    resave: true,
    saveUninitialized: true,
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
app.post('/api/orders', (req, res) => {
    try {
        const order = req.body;
        const orderId = Date.now().toString();
        
        // Create order file
        const orderFile = path.join(ordersDir, `order-${orderId}.json`);
        fs.writeFileSync(orderFile, JSON.stringify(order, null, 2));
        
        res.json({ success: true, orderId });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

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

// Modify the server start code to use the HTTP server
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

// Export the Express API
module.exports = app;
   