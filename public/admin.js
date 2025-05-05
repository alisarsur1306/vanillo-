// Global variables
let menuData = {
    categories: [],
    items: [],
    orders: []
};
let currentUser = null;
let currentSection = 'dashboard';

// DOM Elements
let elements = {};

// Add this at the top of the file with other global variables
const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2U8L3RleHQ+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuN2VtIj5Ob3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    
    // Check for existing session
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log("Found saved user:", currentUser);
            showAdminPanel();
        } catch (error) {
            console.error("Error parsing saved user:", error);
            localStorage.removeItem('adminUser');
            showLoginForm();
        }
    } else {
        console.log("No saved user found");
        showLoginForm();
    }

    // Setup login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error("Login form not found!");
    }

    setupEventListeners();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

// Initialize DOM elements
function initializeElements() {
    elements = {
        loginContainer: document.getElementById('loginContainer'),
        loginForm: document.getElementById('loginForm'),
        mainContent: document.querySelector('.main-content'),
        sidebarToggle: document.getElementById('sidebarToggle'),
        sidebar: document.querySelector('.sidebar'),
        currentSection: document.getElementById('currentSection'),
        currentTime: document.getElementById('currentTime'),
        sections: document.querySelectorAll('.section'),
        navLinks: document.querySelectorAll('.nav-link'),
        categoriesList: document.getElementById('categoriesList'),
        menuItemsList: document.getElementById('menuItemsList'),
        ordersList: document.getElementById('ordersList'),
        totalCategories: document.getElementById('totalCategories'),
        totalItems: document.getElementById('totalItems'),
        activeOrders: document.getElementById('activeOrders'),
        itemCategorySelect: document.getElementById('itemCategory'),
        editItemCategorySelect: document.getElementById('editItemCategory'),
        bulkCategoryId: document.getElementById('bulkCategoryId'),
        bulkExtrasContainer: document.getElementById('bulkExtrasContainer'),
        bulkCategoryUpdateModal: document.getElementById('bulkCategoryUpdateModal'),
        editItemId: document.getElementById('editItemId'),
        editItemName: document.getElementById('editItemName'),
        editItemNameEn: document.getElementById('editItemNameEn'),
        editItemCategory: document.getElementById('editItemCategory'),
        editItemPrice: document.getElementById('editItemPrice'),
        editItemCurrency: document.getElementById('editItemCurrency'),
        editItemDescription: document.getElementById('editItemDescription'),
        editItemImage: document.getElementById('editItemImage'),
        extrasContainer: document.getElementById('extrasContainer'),
        editMenuItemModal: document.getElementById('editMenuItemModal')
    };
    
    // Ensure login container is properly initialized
    if (elements.loginContainer) {
        console.log("Login container found");
        // Remove any inline styles
        elements.loginContainer.removeAttribute('style');
        
        // Set initial display based on authentication
        const savedUser = localStorage.getItem('adminUser');
        if (savedUser) {
            elements.loginContainer.style.display = 'none';
            elements.mainContent.style.display = 'block';
        } else {
            elements.loginContainer.style.display = 'block';
            elements.mainContent.style.display = 'none';
        }
    } else {
        console.error("Login container not found!");
    }

    // Verify all required elements exist
    Object.entries(elements).forEach(([key, element]) => {
        if (!element) {
            console.error(`Required element not found: ${key}`);
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Login form submission
    if (elements.loginForm) {
        console.log("Setting up login form event listener");
        elements.loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error("Login form not found in setupEventListeners");
    }

    // Sidebar toggle for mobile
    elements.sidebarToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('active');
    });

    // Navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('data-section')) {
                e.preventDefault();
                switchSection(link.getAttribute('data-section'));
            }
        });
    });

    // Order filter buttons
    const filterButtons = document.querySelectorAll('[data-filter]');
    console.log("Found", filterButtons.length, "filter buttons");
    
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            console.log("Filter button clicked:", e.target.getAttribute('data-filter'));
            
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            e.target.classList.add('active');
            
            // Apply filter
            filterOrders(e.target.getAttribute('data-filter'));
        });
    });
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = { username, role: data.role };
            localStorage.setItem('adminUser', JSON.stringify(currentUser));
            showAdminPanel();
            // Force reload the page to ensure proper initialization
            window.location.reload();
        } else {
            errorElement.textContent = data.error || 'Invalid credentials';
            errorElement.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorElement.textContent = 'An error occurred during login. Please try again.';
        errorElement.style.display = 'block';
    }
}

function checkAuth() {
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log("Found saved user:", currentUser);
            showAdminPanel();
        } catch (error) {
            console.error("Error parsing saved user:", error);
            localStorage.removeItem('adminUser');
            showLoginForm();
        }
    } else {
        console.log("No saved user found");
        showLoginForm();
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('adminUser');
    showLoginForm();
}

// UI functions
function showLoginForm() {
    console.log("Showing login form");
    if (elements.loginContainer && elements.mainContent) {
        elements.loginContainer.style.display = 'flex';
        elements.mainContent.style.display = 'none';
        // Reset form and hide error message
        const loginForm = document.getElementById('loginForm');
        const errorElement = document.getElementById('loginError');
        if (loginForm) {
            loginForm.reset();
        }
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    } else {
        console.error("Login container or main content not found in showLoginForm");
    }
}

function showAdminPanel() {
    console.log("Showing admin panel");
    if (elements.loginContainer && elements.mainContent) {
        elements.loginContainer.style.display = 'none';
        elements.mainContent.style.display = 'block';
        
        // Initialize the admin panel
        loadMenuData();
        switchSection('dashboard');
        updateCurrentTime();
    } else {
        console.error("Login container or main content not found in showAdminPanel");
    }
}

function updateCurrentTime() {
    const now = new Date();
    elements.currentTime.textContent = now.toLocaleTimeString();
}

function switchSection(section) {
    currentSection = section;
    elements.currentSection.textContent = section.charAt(0).toUpperCase() + section.slice(1);
    
    // Hide all sections first
    elements.sections.forEach(s => {
        s.style.display = 'none';
    });
    
    // Show the selected section
    const selectedSection = document.getElementById(`${section}Section`);
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }

    // Update navigation links
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === section) {
            link.classList.add('active');
        }
    });

    // Update mobile sidebar
    if (window.innerWidth < 768) {
        elements.sidebar.classList.remove('active');
    }

    // Load section data
    switch(section) {
        case 'dashboard':
            updateDashboardStats();
            break;
        case 'categories':
            updateCategoriesList();
            break;
        case 'items':
            updateMenuItemsList();
            break;
        case 'orders':
            updateOrdersList();
            break;
    }
}

// Data management functions
async function loadMenuData() {
    try {
        const response = await fetch('/api/menu');
        if (!response.ok) throw new Error('Failed to load menu data');
        
        const data = await response.json();
        console.log('Menu data received:', data);
        
        // Update menuData with the received data
        menuData = {
            categories: data.categories || [],
            items: data.items || [],
            orders: data.orders || []
        };
        
        console.log('Processed menu data:', menuData);
        
        // Update UI
        updateDashboardStats();
        updateCategoriesList();
        updateMenuItemsList();
        updateOrdersList();
        updateCategorySelects();
    } catch (error) {
        console.error('Error loading menu data:', error);
        showAlert('Failed to load menu data', 'danger');
    }
}

function updateDashboardStats() {
    // Initialize menuData if it doesn't exist
    if (!menuData) {
        menuData = {
            categories: [],
            items: [],
            orders: []
        };
    }
    
    // Ensure categories and items arrays exist
    if (!menuData.categories) menuData.categories = [];
    if (!menuData.items) menuData.items = [];
    if (!menuData.orders) menuData.orders = [];
    
    // Update dashboard statistics
    elements.totalCategories.textContent = menuData.categories.length;
    elements.totalItems.textContent = menuData.items.length;
    elements.activeOrders.textContent = menuData.orders.filter(order => order.status === 'pending').length;
    
    console.log("Dashboard stats updated:", {
        categories: menuData.categories.length,
        items: menuData.items.length,
        activeOrders: menuData.orders.filter(order => order.status === 'pending').length
    });
}

function updateCategoriesList() {
    if (!elements.categoriesList) {
        console.error("Categories list element not found");
        return;
    }
    
    // Ensure categories array exists
    if (!menuData.categories) {
        menuData.categories = [];
    }
    
    console.log("Updating categories list with", menuData.categories.length, "categories");
    
    // Clear existing content
    elements.categoriesList.innerHTML = '';
    
    // Add each category
    menuData.categories.forEach(category => {
        const itemCount = menuData.items.filter(item => item.categoryId === category.id).length;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="/images/${category.image || 'default-category.png'}" 
                         alt="${category.name}" 
                         class="item-image me-3"
                         onerror="this.src='${placeholderImage}'">
                    <div>
                        <div class="category-name">${category.name}</div>
                        <div class="category-name-en">${category.nameEn}</div>
                    </div>
                </div>
            </td>
            <td>${itemCount}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary edit-category-btn" data-category='${JSON.stringify(category)}'>
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="openBulkCategoryUpdate('${category.id}')">
                        <i class="bi bi-arrow-repeat"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory('${category.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        elements.categoriesList.appendChild(row);
    });

    // Add event listeners for edit buttons
    document.querySelectorAll('.edit-category-btn').forEach(button => {
        button.addEventListener('click', function() {
            const category = JSON.parse(this.dataset.category);
            editCategory(category);
        });
    });
}

function updateMenuItemsList() {
    if (!elements.menuItemsList) {
        console.error("Menu items list element not found");
        return;
    }
    
    // Ensure items array exists
    if (!menuData.items) {
        menuData.items = [];
    }
    
    console.log("Updating menu items list with", menuData.items.length, "items");
    
    elements.menuItemsList.innerHTML = menuData.items.map(item => {
        // Map image filenames to actual files
        let imagePath = item.image;
        if (imagePath) {
            const filename = imagePath.split('/').pop();
            const imageMap = {
                'mickey.jpg': 'baby-fish-vanillo.jpg',
                'pancake-3.jpg': '3-pancakes.jpg',
                'pancake-lotus.jpg': 'lotus-pancake.jpg',
                'pancake-12.jpg': '12-small-pancakes.jpg',
                'pancake-small.jpg': 'small-pancake.jpg',
                'pancake-large.jpg': 'large-pancake.jpg',
                'cocktail.jpg': 'vanillo-cocktail.jpg',
                'milkshake.jpg': 'vanillo-milkshake.jpg',
                'gross.jpg': 'souffle.jpg',
                'coffee.jpg': 'iced-coffee.jpg'
            };
            imagePath = `/images/${imageMap[filename] || filename}`;
        }

        return `
            <tr>
                <td>
                    <img src="${imagePath || '/images/default-item.png'}" 
                         alt="${item.name}" 
                         class="item-image"
                         onerror="this.src='${placeholderImage}'">
                </td>
                <td>
                    <div class="category-name">${item.name}</div>
                    <div class="category-name-en">${item.nameEn}</div>
                </td>
                <td>${item.category}</td>
                <td>${item.price} ${item.currency || 'SAR'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary edit-item-btn" data-item='${JSON.stringify(item)}'>
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteMenuItem('${item.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Add event listeners for edit buttons
    document.querySelectorAll('.edit-item-btn').forEach(button => {
        button.addEventListener('click', function() {
            const item = JSON.parse(this.dataset.item);
            editMenuItem(item);
        });
    });
}

function updateOrdersList() {
    if (!elements.ordersList) {
        console.error("Orders list element not found");
        return;
    }
    
    // Add reset button at the top
    const resetButton = document.createElement('div');
    resetButton.className = 'mb-3';
    resetButton.innerHTML = `
        <button class="btn btn-danger" onclick="resetAllOrders()">
            <i class="bi bi-trash"></i> Reset All Orders
        </button>
    `;
    
    // Find the orders container and add the reset button at the top
    const ordersContainer = document.getElementById('ordersSection');
    const existingResetButton = ordersContainer.querySelector('.mb-3');
    if (existingResetButton) {
        existingResetButton.remove();
    }
    ordersContainer.insertBefore(resetButton, ordersContainer.firstChild);
    
    // Ensure orders array exists
    if (!menuData.orders) {
        menuData.orders = [];
    }
    
    console.log("Updating orders list with", menuData.orders.length, "orders");
    
    elements.ordersList.innerHTML = menuData.orders.map(order => {
        const statusClass = order.status === 'pending' ? 'warning' : 'success';
        const statusText = order.status || 'unknown';
        
        return `
            <tr>
                <td>${order.id}</td>
                <td>${order.items.map(item => item.name).join(', ')}</td>
                <td>${order.total} ${order.currency || 'SAR'}</td>
                <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewOrder('${order.id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${order.status === 'pending' ? `
                        <button class="btn btn-sm btn-outline-success" onclick="completeOrder('${order.id}')">
                            <i class="bi bi-check"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function updateCategorySelects() {
    const options = menuData.categories.map(category => 
        `<option value="${category.id}">${category.name} (${category.nameEn})</option>`
    ).join('');
    
    if (elements.itemCategorySelect) {
        elements.itemCategorySelect.innerHTML = options;
    }
    if (elements.editItemCategorySelect) {
        elements.editItemCategorySelect.innerHTML = options;
    }
}

// Category management functions
async function addCategory() {
    const name = document.getElementById('categoryName').value;
    const nameEn = document.getElementById('categoryNameEn').value;
    const description = document.getElementById('categoryDescription').value;
    const image = document.getElementById('categoryImage').value;

    try {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                nameEn,
                description,
                image,
                id: Date.now().toString(36) // Generate a unique ID
            })
        });

        if (!response.ok) throw new Error('Failed to add category');

        const newCategory = await response.json();
        menuData.categories.push(newCategory.category);
        
        updateCategoriesList();
        updateCategorySelects();
        
        bootstrap.Modal.getInstance(document.getElementById('addCategoryModal')).hide();
        showAlert('Category added successfully', 'success');
    } catch (error) {
        console.error('Error adding category:', error);
        showAlert('Failed to add category', 'danger');
    }
}

async function editCategory(category) {
    document.getElementById('editCategoryId').value = category.id;
    document.getElementById('editCategoryName').value = category.name;
    document.getElementById('editCategoryNameEn').value = category.nameEn;
    document.getElementById('editCategoryDescription').value = category.description || '';
    document.getElementById('editCategoryImage').value = category.image;

    new bootstrap.Modal(document.getElementById('editCategoryModal')).show();
}

async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete category');

        menuData.categories = menuData.categories.filter(c => c.id !== id);
        menuData.items = menuData.items.filter(i => i.categoryId !== id);
        
        updateCategoriesList();
        updateMenuItemsList();
        updateCategorySelects();
        
        showAlert('Category deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting category:', error);
        showAlert('Failed to delete category', 'danger');
    }
}

async function updateCategory() {
    const id = document.getElementById('editCategoryId').value;
    const name = document.getElementById('editCategoryName').value;
    const nameEn = document.getElementById('editCategoryNameEn').value;
    const description = document.getElementById('editCategoryDescription').value;
    const image = document.getElementById('editCategoryImage').value;

    try {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                nameEn,
                description,
                image
            })
        });

        if (!response.ok) throw new Error('Failed to update category');

        const updatedCategory = await response.json();
        const index = menuData.categories.findIndex(c => c.id === id);
        if (index !== -1) {
            menuData.categories[index] = updatedCategory.category;
        }

        updateCategoriesList();
        updateCategorySelects();
        
        bootstrap.Modal.getInstance(document.getElementById('editCategoryModal')).hide();
        showAlert('Category updated successfully', 'success');
    } catch (error) {
        console.error('Error updating category:', error);
        showAlert('Failed to update category', 'danger');
    }
}

// Menu item management functions
async function addMenuItem() {
    const name = document.getElementById('itemName').value;
    const nameEn = document.getElementById('itemNameEn').value;
    const categoryId = document.getElementById('itemCategory').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const currency = document.getElementById('itemCurrency').value;
    const description = document.getElementById('itemDescription').value;
    const image = document.getElementById('itemImage').value;

    try {
        const response = await fetch('/api/menu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                nameEn,
                categoryId,
                price,
                currency,
                description,
                image
            })
        });

        if (!response.ok) throw new Error('Failed to add menu item');

        const newItem = await response.json();
        menuData.items.push(newItem.item);
        
        updateMenuItemsList();
        
        bootstrap.Modal.getInstance(document.getElementById('addMenuItemModal')).hide();
        showAlert('Menu item added successfully', 'success');
    } catch (error) {
        console.error('Error adding menu item:', error);
        showAlert('Failed to add menu item', 'danger');
    }
}

// Extra management functions
function addExtraField(containerId = 'extrasContainer', extra = null) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found`);
        showAlert('Failed to add extra field: Container not found', 'danger');
        return;
    }

    const extraId = extra ? extra.id : `extra_${Date.now()}`;
    const extraDiv = document.createElement('div');
    extraDiv.className = 'extra-field mb-2';
    extraDiv.innerHTML = `
        <div class="input-group">
            <input type="text" class="form-control" placeholder="Extra Name (Arabic)" value="${extra ? extra.name : ''}" required>
            <input type="text" class="form-control" placeholder="Extra Name (English)" value="${extra ? extra.nameEn : ''}" required>
            <input type="number" class="form-control" placeholder="Price" value="${extra ? extra.price : ''}" required>
            <button class="btn btn-outline-danger" type="button" onclick="this.parentElement.parentElement.remove()">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(extraDiv);
}

function addBulkExtraField() {
    addExtraField('bulkExtrasContainer');
}

function getExtrasFromContainer(containerId) {
    const container = document.getElementById(containerId);
    const extras = [];
    container.querySelectorAll('.extra-field').forEach(field => {
        const inputs = field.querySelectorAll('input');
        if (inputs[0].value && inputs[1].value && inputs[2].value) {
            extras.push({
                id: `extra_${Date.now()}`,
                name: inputs[0].value,
                nameEn: inputs[1].value,
                price: parseFloat(inputs[2].value)
            });
        }
    });
    return extras;
}

// Modified editMenuItem function to handle extras
async function editMenuItem(item) {
    if (!item || !item.id) {
        console.error('Invalid item data provided to editMenuItem');
        showAlert('Failed to edit menu item: Invalid data', 'danger');
        return;
    }

    try {
        // Check if all required elements exist
        if (!elements.editItemId || !elements.editItemName || !elements.editItemNameEn || 
            !elements.editItemCategory || !elements.editItemPrice || !elements.editItemCurrency || 
            !elements.editItemDescription || !elements.editItemImage || !elements.extrasContainer || 
            !elements.editMenuItemModal) {
            console.error('Required form elements not found');
            showAlert('Failed to edit menu item: Form elements not found', 'danger');
            return;
        }

        // Set form values
        elements.editItemId.value = item.id;
        elements.editItemName.value = item.name || '';
        elements.editItemNameEn.value = item.nameEn || '';
        elements.editItemCategory.value = item.categoryId || '';
        elements.editItemPrice.value = item.price || '';
        elements.editItemCurrency.value = item.currency || 'ILS';
        elements.editItemDescription.value = item.description || '';
        elements.editItemImage.value = item.image || '';

        // Clear and populate extras
        elements.extrasContainer.innerHTML = '';
        if (item.extras && Array.isArray(item.extras)) {
            item.extras.forEach(extra => addExtraField('extrasContainer', extra));
        }

        // Show the modal
        new bootstrap.Modal(elements.editMenuItemModal).show();
    } catch (error) {
        console.error('Error in editMenuItem:', error);
        showAlert('Failed to edit menu item: ' + error.message, 'danger');
    }
}

// Modified updateMenuItem function to handle extras
async function updateMenuItem() {
    const id = document.getElementById('editItemId').value;
    if (!id) {
        showAlert('Invalid menu item ID', 'danger');
        return;
    }

    const name = document.getElementById('editItemName').value;
    const nameEn = document.getElementById('editItemNameEn').value;
    const categoryId = document.getElementById('editItemCategory').value;
    const price = parseFloat(document.getElementById('editItemPrice').value);
    const currency = document.getElementById('editItemCurrency').value;
    const description = document.getElementById('editItemDescription').value;
    const image = document.getElementById('editItemImage').value;
    const extras = getExtrasFromContainer('extrasContainer');

    // Validate required fields
    if (!name || !categoryId || isNaN(price)) {
        showAlert('Please fill in all required fields', 'danger');
        return;
    }

    try {
        const response = await fetch(`/api/menu/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                nameEn,
                categoryId,
                price,
                currency,
                description,
                image,
                extras
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update menu item');
        }

        const updatedItem = await response.json();
        const index = menuData.items.findIndex(i => i.id === id);
        if (index !== -1) {
            menuData.items[index] = updatedItem.item;
        }

        updateMenuItemsList();
        
        bootstrap.Modal.getInstance(document.getElementById('editMenuItemModal')).hide();
        showAlert('Menu item updated successfully', 'success');
    } catch (error) {
        console.error('Error updating menu item:', error);
        showAlert(error.message || 'Failed to update menu item', 'danger');
    }
}

async function deleteMenuItem(id) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
        const response = await fetch(`/api/menu/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete menu item');

        menuData.items = menuData.items.filter(i => i.id !== id);
        updateMenuItemsList();
        
        showAlert('Menu item deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting menu item:', error);
        showAlert('Failed to delete menu item', 'danger');
    }
}

// Order management functions
function filterOrders(filter) {
    console.log("Filtering orders by:", filter);
    
    if (!elements.ordersList) {
        console.error("Orders list element not found");
        return;
    }
    
    // Ensure orders array exists
    if (!menuData.orders) {
        menuData.orders = [];
    }
    
    console.log("Filtering", menuData.orders.length, "orders");
    
    // Filter orders based on status
    const filteredOrders = filter === 'all' 
        ? menuData.orders 
        : menuData.orders.filter(order => order.status === filter);
    
    console.log("Filtered orders:", filteredOrders.length);
    
    elements.ordersList.innerHTML = filteredOrders.map(order => {
        const statusClass = order.status === 'pending' ? 'warning' : 'success';
        const statusText = order.status || 'unknown';
        
        return `
            <tr>
                <td>${order.id}</td>
                <td>${order.items.map(item => item.name).join(', ')}</td>
                <td>${order.total} ${order.currency || 'SAR'}</td>
                <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewOrder('${order.id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${order.status === 'pending' ? `
                        <button class="btn btn-sm btn-outline-success" onclick="completeOrder('${order.id}')">
                            <i class="bi bi-check"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

async function viewOrder(id) {
    const order = menuData.orders.find(o => o.id === id);
    if (!order) return;

    alert(`
Order ID: ${order.id}
Items: ${order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
Total: ${order.total} ${order.currency}
Status: ${order.status}
Date: ${new Date(order.date).toLocaleString()}
    `);
}

async function completeOrder(id) {
    try {
        const response = await fetch(`/api/orders/${id}/complete`, {
            method: 'PUT'
        });

        if (response.ok) {
            const order = menuData.orders.find(o => o.id === id);
            if (order) {
                order.status = 'completed';
                updateDashboardStats();
                updateOrdersList();
            }
        }
    } catch (error) {
        console.error('Error completing order:', error);
    }
}

// Data export/import functions
function exportMenuData() {
    const dataStr = JSON.stringify(menuData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'menu-data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

async function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Validate data structure
        if (!data.categories || !data.items) {
            throw new Error('Invalid data format');
        }

        // Update menu data
        await updateMenuData(data);
        
        // Clear the file input
        event.target.value = '';
    } catch (error) {
        console.error('Error importing menu data:', error);
        showAlert('Error importing menu data. Please check the file format.', 'danger');
    }
}

// Function to update menu data
async function updateMenuData(newData) {
    try {
        const response = await fetch('/api/menu', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newData)
        });

        if (!response.ok) {
            throw new Error('Failed to update menu data');
        }

        const result = await response.json();
        if (result.success) {
            // Update local data
            menuData = result.data;
            
            // Update UI
            updateDashboardStats();
            updateCategoriesList();
            updateMenuItemsList();
            updateCategorySelects();
            
            showAlert('Menu data updated successfully', 'success');
        } else {
            throw new Error(result.error || 'Failed to update menu data');
        }
    } catch (error) {
        console.error('Error updating menu data:', error);
        showAlert(error.message || 'Failed to update menu data', 'danger');
    }
}

// Utility Functions
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

// Bulk category update functions
function openBulkCategoryUpdate(categoryId) {
    try {
        // Check if all required elements exist
        if (!elements.bulkCategoryId || !elements.bulkExtrasContainer || !elements.bulkCategoryUpdateModal) {
            console.error('Required elements for bulk update not found');
            showAlert('Failed to open bulk update: Required elements not found', 'danger');
            return;
        }

        // Set the category ID
        elements.bulkCategoryId.value = categoryId;

        // Clear any existing extras
        elements.bulkExtrasContainer.innerHTML = '';

        // Show the modal
        new bootstrap.Modal(elements.bulkCategoryUpdateModal).show();
    } catch (error) {
        console.error('Error in openBulkCategoryUpdate:', error);
        showAlert('Failed to open bulk update: ' + error.message, 'danger');
    }
}

async function applyBulkUpdate() {
    const categoryId = document.getElementById('bulkCategoryId').value;
    const updatePrice = document.getElementById('updatePrice').checked;
    const updateCurrency = document.getElementById('updateCurrency').checked;
    const updateExtras = document.getElementById('updateExtras').checked;
    
    const newPrice = updatePrice ? parseFloat(document.getElementById('bulkItemPrice').value) : null;
    const newCurrency = updateCurrency ? document.getElementById('bulkItemCurrency').value : null;
    const newExtras = updateExtras ? getExtrasFromContainer('bulkExtrasContainer') : null;

    try {
        const itemsToUpdate = menuData.items.filter(item => item.categoryId === categoryId);
        const updatePromises = itemsToUpdate.map(async item => {
            // Get the current item data from menuData
            const currentItem = menuData.items.find(i => i.id === item.id);
            
            // Create update data starting with the current item data
            const updateData = { ...currentItem };
            
            // Only update price if explicitly requested AND not updating extras
            if (updatePrice && !updateExtras) {
                updateData.price = newPrice;
            }
            
            // Update currency if requested
            if (updateCurrency) {
                updateData.currency = newCurrency;
            }
            
            // Update extras if requested - add new extras while preserving existing ones
            if (updateExtras && newExtras) {
                // Ensure current item has an extras array
                const currentExtras = currentItem.extras || [];
                
                // Create a map of existing extras by name to avoid duplicates
                const existingExtrasMap = new Map(currentExtras.map(extra => [extra.name, extra]));
                
                // Add new extras, but only if they don't already exist
                newExtras.forEach(newExtra => {
                    if (!existingExtrasMap.has(newExtra.name)) {
                        existingExtrasMap.set(newExtra.name, newExtra);
                    }
                });
                
                // Convert the map back to an array
                updateData.extras = Array.from(existingExtrasMap.values());
                
                // Ensure we keep the existing price when updating extras
                updateData.price = currentItem.price;
            }

            console.log('Updating item with data:', updateData); // Debug log

            const response = await fetch(`/api/menu/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error(`Failed to update item ${item.id}`);
            }

            const result = await response.json();
            console.log('Server response:', result); // Debug log

            if (!result.success) {
                throw new Error(`Server failed to update item ${item.id}`);
            }

            // Update local data while preserving the price and managing extras
            const index = menuData.items.findIndex(i => i.id === item.id);
            if (index !== -1) {
                menuData.items[index] = {
                    ...result.item,
                    // Keep the existing price unless explicitly updating price (and not extras)
                    price: (updatePrice && !updateExtras) ? newPrice : currentItem.price,
                    // Use the updated extras array that combines existing and new extras
                    extras: updateExtras ? updateData.extras : result.item.extras
                };
            }
        });

        await Promise.all(updatePromises);
        
        updateMenuItemsList();
        bootstrap.Modal.getInstance(document.getElementById('bulkCategoryUpdateModal')).hide();
        showAlert('Category items updated successfully', 'success');
    } catch (error) {
        console.error('Error applying bulk update:', error);
        showAlert('Failed to update category items', 'danger');
    }
}

// Function to reset all orders
async function resetAllOrders() {
    if (!confirm('Are you sure you want to reset all orders? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch('/api/orders/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to reset orders');
        }

        const result = await response.json();
        if (result.success) {
            // Clear local orders data
            menuData.orders = [];
            
            // Update UI
            updateDashboardStats();
            updateOrdersList();
            
            showAlert('All orders have been reset successfully', 'success');
        } else {
            throw new Error(result.error || 'Failed to reset orders');
        }
    } catch (error) {
        console.error('Error resetting orders:', error);
        showAlert(error.message || 'Failed to reset orders', 'danger');
    }
}

