// Simple authentication
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Global state
let currentSection = 'dashboard';
let menuData = {
    categories: [],
    items: []
};
let ordersData = [];
let restaurantInfo = {};

// Default menu data
const DEFAULT_MENU_DATA = {
    categories: [
        {
            id: '1',
            name: 'مميزات فانيلو',
            nameEn: 'Vanillo Specials',
            image: '/images/features.jpg'
        },
        {
            id: '2',
            name: 'كريبات فانيلو',
            nameEn: 'Vanillo Crepes',
            image: '/images/crepes.jpg'
        },
        {
            id: '3',
            name: 'وافل فانيلو',
            nameEn: 'Vanillo Waffles',
            image: '/images/waffles.jpg'
        },
        {
            id: '4',
            name: 'فشافيش فانيلو',
            nameEn: 'Vanillo Fishfish',
            image: '/images/fish.jpg'
        },
        {
            id: '5',
            name: 'بانكيك فانيلو',
            nameEn: 'Vanillo Pancakes',
            image: '/images/pancakes.jpg'
        },
        {
            id: '6',
            name: 'مشروبات فانيلو',
            nameEn: 'Vanillo Drinks',
            image: '/images/drinks.jpg'
        }
    ],
    items: [
        {
            id: '1',
            categoryId: '1',
            name: 'ميكي فانيلو',
            nameEn: 'Mickey Vanillo',
            description: '',
            price: 25,
            image: '/images/mickey-vanillo.jpg'
        },
        {
            id: '2',
            categoryId: '1',
            name: 'سمكة فانيلو',
            nameEn: 'Fish Vanillo',
            description: '',
            price: 20,
            image: '/images/fish-vanillo.jpg'
        },
        {
            id: '3',
            categoryId: '1',
            name: 'بيبي فيش فانيلو',
            nameEn: 'Baby Fish Vanillo',
            description: '10 سمكات صغار وعلى جانبها الشوكلاطة',
            price: 20,
            image: '/images/baby-fish-vanillo.jpg'
        },
        {
            id: '4',
            categoryId: '1',
            name: 'سوفلية',
            nameEn: 'Souffle',
            description: 'سوفلية محشية الشوكلاطة الساخنة',
            price: 25,
            image: '/images/souffle.jpg'
        },
        {
            id: '5',
            categoryId: '1',
            name: 'تشوروس محشي',
            nameEn: 'Stuffed Churros',
            description: '',
            price: 25,
            image: '/images/stuffed-churros.jpg'
        },
        {
            id: '6',
            categoryId: '1',
            name: 'تشوروس عادي',
            nameEn: 'Regular Churros',
            description: '',
            price: 20,
            image: 'images/regular-churros.jpg'
        },
        {
            id: '7',
            categoryId: '1',
            name: 'يوغورت',
            nameEn: 'Yogurt',
            description: '',
            price: 20,
            image: 'images/yogurt.jpg'
        }
    ]
};

// Initialize menu data if not exists
if (!localStorage.getItem('menuData')) {
    localStorage.setItem('menuData', JSON.stringify(DEFAULT_MENU_DATA));
}

// Get menu data
menuData = JSON.parse(localStorage.getItem('menuData'));

// DOM Elements
let loginSection, adminPanel, loginForm, logoutBtn;
let categoriesList, menuItemsList;
let newCategoryInput, addCategoryBtn, filterCategory, searchItems;

// Initialize all DOM elements
function initializeElements() {
    loginSection = document.getElementById('login-section');
    adminPanel = document.getElementById('admin-panel');
    loginForm = document.getElementById('login-form');
    logoutBtn = document.getElementById('logout-btn');
    
    categoriesList = document.getElementById('categories-list');
    menuItemsList = document.getElementById('menu-items-list');
    
    newCategoryInput = document.getElementById('new-category');
    addCategoryBtn = document.getElementById('add-category-btn');
    filterCategory = document.getElementById('filter-category');
    searchItems = document.getElementById('search-items');

    // Add import functionality
    document.getElementById('import-data').addEventListener('change', handleFileImport);

    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Login functionality
function setupLoginHandlers() {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            localStorage.setItem('adminAuthenticated', 'true');
            showAdminPanel();
        } else {
            showAlert('Invalid credentials', 'danger');
        }
    });

    logoutBtn.addEventListener('click', logout);
}

// Show/Hide panels
function showAdminPanel() {
    loginSection.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    initializeAdminPanel();
}

function showLoginPanel() {
    loginSection.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    loginForm.reset();
}

// Logout functionality
function logout() {
    localStorage.removeItem('adminAuthenticated');
    showLoginPanel();
}

// Check session
function checkSession() {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (isAuthenticated) {
        showAdminPanel();
    } else {
        showLoginPanel();
    }
}

// Initialize admin panel
function initializeAdminPanel() {
    renderCategories();
    renderMenuItems();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Category management
    addCategoryBtn.addEventListener('click', function() {
        const categoryName = newCategoryInput.value.trim();
        if (categoryName) {
            if (!menuData.categories.some(c => c.name === categoryName)) {
                addCategory(categoryName);
                newCategoryInput.value = '';
            } else {
                alert('هذه الفئة موجودة بالفعل');
            }
        }
    });

    // Item filtering
    filterCategory.addEventListener('change', renderMenuItems);
    searchItems.addEventListener('input', renderMenuItems);

    // Add item button
    document.getElementById('add-item-btn').addEventListener('click', function() {
        const category = document.getElementById('item-category').value;
        const name = document.getElementById('item-name').value;
        const nameEn = document.getElementById('item-name-en').value;
        const description = document.getElementById('item-description').value;
        const price = parseFloat(document.getElementById('item-price').value);
        const image = document.getElementById('item-image').value;

        if (category && name && nameEn && price) {
            const newItem = {
                name,
                nameEn,
                description,
                price,
                image: image || 'https://via.placeholder.com/150'
            };

            addItem(category, newItem);
            
            // Clear form
            document.getElementById('item-name').value = '';
            document.getElementById('item-name-en').value = '';
            document.getElementById('item-description').value = '';
            document.getElementById('item-price').value = '';
            document.getElementById('item-image').value = '';
        } else {
            alert('يرجى ملء جميع الحقول المطلوبة');
        }
    });
}

// Render categories
function renderCategories() {
    categoriesList.innerHTML = '';
    const categorySelect = document.getElementById('item-category');
    if (categorySelect) {
        categorySelect.innerHTML = '';
    }
    filterCategory.innerHTML = '<option value="">جميع الأقسام</option>';

    menuData.categories.forEach(category => {
        // Add to categories list
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'flex justify-between items-center p-2 bg-gray-50 rounded mb-2';
        categoryDiv.innerHTML = `
            <span>${category.name}</span>
            <div class="flex space-x-2 space-x-reverse">
                <button onclick="editCategory('${category.id}')" class="text-blue-600 hover:text-blue-800">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteCategory('${category.id}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        categoriesList.appendChild(categoryDiv);

        // Add to category selects
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        filterCategory.appendChild(option);
        if (categorySelect) {
            categorySelect.appendChild(option.cloneNode(true));
        }
    });
}

// Render menu items
function renderMenuItems() {
    menuItemsList.innerHTML = '';
    const selectedCategory = filterCategory.value;
    const searchTerm = searchItems.value.toLowerCase();

    menuData.items.forEach(item => {
        if (!selectedCategory || item.categoryId === selectedCategory) {
            const category = menuData.categories.find(c => c.id === item.categoryId);
            const categoryName = category ? category.name : 'Unknown';

            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex justify-between items-center p-2 bg-white rounded shadow mb-2';
            itemDiv.innerHTML = `
                <div class="flex items-center">
                    <img src="${item.image || 'https://via.placeholder.com/150'}" alt="${item.name}" class="w-16 h-16 object-cover rounded ml-4">
                    <div>
                        <h4 class="font-bold">${item.name}</h4>
                        <p class="text-sm text-gray-600">${item.nameEn}</p>
                        <p class="text-purple-600">${item.price} ₪</p>
                    </div>
                </div>
                <div class="flex space-x-2 space-x-reverse">
                    <button onclick="editItem('${item.id}')" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteItem('${item.id}')" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            menuItemsList.appendChild(itemDiv);
        }
    });
}

// Category management
async function editCategory(categoryIdOrObject) {
    try {
        // Handle both string ID and category object
        const category = typeof categoryIdOrObject === 'string' 
            ? menuData.categories.find(c => c.id === categoryIdOrObject)
            : categoryIdOrObject;

        if (!category) {
            throw new Error('Category not found');
        }

        // Set form values
        document.getElementById('editCategoryId').value = category.id;
        document.getElementById('editCategoryName').value = category.name;
        document.getElementById('editCategoryNameEn').value = category.nameEn || '';
        document.getElementById('editCategoryDescription').value = category.description || '';
        document.getElementById('editCategoryImage').value = category.image || '';

        // Show the edit modal
        const editModal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
        editModal.show();
    } catch (error) {
        console.error('Error preparing category edit:', error);
        showAlert('Failed to prepare category edit', 'danger');
    }
}

async function updateCategory() {
    try {
        const categoryId = document.getElementById('editCategoryId').value;
        const updatedCategory = {
            id: categoryId,
            name: document.getElementById('editCategoryName').value,
            nameEn: document.getElementById('editCategoryNameEn').value,
            description: document.getElementById('editCategoryDescription').value,
            image: document.getElementById('editCategoryImage').value
        };

        // Update the category in the menu data
        const categoryIndex = menuData.categories.findIndex(c => c.id === categoryId);
        if (categoryIndex !== -1) {
            menuData.categories[categoryIndex] = {
                ...menuData.categories[categoryIndex],
                ...updatedCategory
            };
            saveAndUpdateMenu();
            
            // Close the modal
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editCategoryModal'));
            editModal.hide();
            
            showAlert('Category updated successfully', 'success');
        } else {
            throw new Error('Category not found');
        }
    } catch (error) {
        console.error('Error updating category:', error);
        showAlert('Failed to update category', 'danger');
    }
}

// Category deletion
async function deleteCategory(categoryId) {
    try {
        if (confirm(`هل أنت متأكد من حذف هذا القسم؟`)) {
            const category = menuData.categories.find(c => c.id === categoryId);
            if (!category) {
                throw new Error('Category not found');
            }

            menuData.categories = menuData.categories.filter(c => c.id !== categoryId);
            menuData.items = menuData.items.filter(i => i.categoryId !== categoryId);
            saveAndUpdateMenu();
            showAlert('Category deleted successfully', 'success');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        showAlert('Failed to delete category', 'danger');
    }
}

// Item management
async function editItem(itemId) {
    try {
        const item = menuData.items.find(i => i.id === itemId);
        if (!item) {
            throw new Error('Item not found');
        }

        document.getElementById('item-category').value = item.categoryId;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-name-en').value = item.nameEn || '';
        document.getElementById('item-description').value = item.description || '';
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-image').value = item.image || '';
    } catch (error) {
        console.error('Error editing item:', error);
        showAlert('Failed to edit item', 'danger');
    }
}

async function deleteItem(itemId) {
    try {
        if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
            const item = menuData.items.find(i => i.id === itemId);
            if (!item) {
                throw new Error('Item not found');
            }

            menuData.items = menuData.items.filter(i => i.id !== itemId);
            saveAndUpdateMenu();
            showAlert('Item deleted successfully', 'success');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showAlert('Failed to delete item', 'danger');
    }
}

// Save and update
function saveAndUpdateMenu() {
    localStorage.setItem('menuData', JSON.stringify(menuData));
    renderCategories();
    renderMenuItems();
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupLoginHandlers();
    checkSession();
    setupNavigationHandlers();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

function setupNavigationHandlers() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });
}

function switchSection(section) {
    // Update active state in navigation
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === section) {
            link.classList.add('active');
        }
    });

    // Update current section display
    document.getElementById('currentSection').textContent = section.charAt(0).toUpperCase() + section.slice(1);

    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

    // Show selected section
    document.getElementById(`${section}Section`).classList.add('active');

    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'items':
            loadMenuItems();
            break;
        case 'orders':
            loadOrders();
            break;
    }
}

function updateCurrentTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleTimeString();
}

async function loadDashboardData() {
    try {
        const [menuResponse, ordersResponse] = await Promise.all([
            fetch('/api/menu'),
            fetch('/api/orders')
        ]);

        menuData = await menuResponse.json();
        ordersData = await ordersResponse.json();

        // Update dashboard statistics
        const totalItems = menuData.items.length;
        const activeOrders = ordersData.filter(order => order.status === 'pending').length;

        document.getElementById('totalCategories').textContent = menuData.categories.length;
        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('activeOrders').textContent = activeOrders;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('Failed to load dashboard data', 'danger');
    }
}

async function loadCategories() {
    try {
        const response = await fetch('/api/menu');
        menuData = await response.json();
        const categoriesList = document.getElementById('categoriesList');
        categoriesList.innerHTML = '';

        menuData.categories.forEach(category => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.name}</td>
                <td>${menuData.items.filter(i => i.categoryId === category.id).length}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editCategory('${category.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategory('${category.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            categoriesList.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        showAlert('Failed to load categories', 'danger');
    }
}

async function loadMenuItems() {
    try {
        const response = await fetch('/api/menu');
        menuData = await response.json();
        const menuItemsList = document.getElementById('menuItemsList');
        menuItemsList.innerHTML = '';

        menuData.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                <td>${item.name}</td>
                <td>${item.categoryId}</td>
                <td>${item.price} ${getCurrencySymbol(item.currency || 'SAR')}</td>
                <td>${item.description || ''}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editItem('${item.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteItem('${item.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            menuItemsList.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading menu items:', error);
        showAlert('Failed to load menu items', 'danger');
    }
}

async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        ordersData = await response.json();
        const ordersList = document.getElementById('ordersList');
        ordersList.innerHTML = '';

        ordersData.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order.id}</td>
                <td>${order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</td>
                <td>${order.total} ${getCurrencySymbol(order.items[0]?.currency || 'SAR')}</td>
                <td><span class="badge bg-${order.status === 'completed' ? 'success' : 'warning'}">${order.status}</span></td>
                <td>
                    ${order.status === 'pending' ? `
                        <button class="btn btn-sm btn-success" onclick="updateOrderStatus(${order.id}, 'completed')">
                            <i class="bi bi-check-lg"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            ordersList.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        showAlert('Failed to load orders', 'danger');
    }
}

function filterOrders(filter) {
    const rows = document.querySelectorAll('#ordersList tr');
    rows.forEach(row => {
        const status = row.querySelector('.badge').textContent;
        if (filter === 'all' || status === filter) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Category Management
async function addCategory(name) {
    if (!name) {
        showAlert('Category name is required', 'danger');
        return;
    }

    try {
        const response = await fetch('/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: name, items: [] })
        });

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
            modal.hide();
            document.getElementById('addCategoryForm').reset();
            loadCategories();
            showAlert('Category added successfully', 'success');
        }
    } catch (error) {
        console.error('Error adding category:', error);
        showAlert('Failed to add category', 'danger');
    }
}

// Menu Item Management
async function addItem(categoryId, item) {
    try {
        const response = await fetch('/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categoryId, item })
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadMenuItems();
            showAlert('Menu item added successfully', 'success');
        } else {
            alert('Error adding menu item: ' + result.message);
        }
    } catch (error) {
        console.error('Error adding menu item:', error);
        showAlert('Error adding menu item. Please try again.', 'danger');
    }
}

async function updateItem(itemId, updatedItem) {
    try {
        const response = await fetch(`/api/menu/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedItem)
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadMenuItems();
            showAlert('Menu item updated successfully', 'success');
        } else {
            alert('Error updating menu item: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating menu item:', error);
        showAlert('Error updating menu item. Please try again.', 'danger');
    }
}

// Order Management
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            loadOrders();
            showAlert('Order status updated successfully', 'success');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showAlert('Failed to update order status', 'danger');
    }
}

async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadOrders();
            showAlert('Order deleted successfully', 'success');
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        showAlert('Failed to delete order', 'danger');
    }
}

// Utility Functions
function getCurrencySymbol(currency) {
    switch (currency) {
        case 'ILS': return '₪';
        case 'SAR': return 'ريال';
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        default: return 'ريال';
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Add these new functions at the end of the file
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate the imported data structure
            if (typeof importedData === 'object' && !Array.isArray(importedData)) {
                // Update the menu data
                menuData = importedData;
                localStorage.setItem('menuData', JSON.stringify(menuData));
                
                // Refresh the UI
                renderCategories();
                renderMenuItems();
                
                alert('تم استيراد البيانات بنجاح');
            } else {
                alert('صيغة الملف غير صحيحة. يجب أن يكون ملف JSON يحتوي على أقسام وعناصر القائمة');
            }
        } catch (error) {
            alert('حدث خطأ أثناء قراءة الملف. تأكد من أن الملف بصيغة JSON صحيحة');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
}

function exportMenuData() {
    const dataStr = JSON.stringify(menuData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vanillo-menu-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
} 