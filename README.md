# Vanillo - Restaurant Order Management System

A full-stack web application for managing restaurant orders, menu items, and customer interactions.

## Features

- Online ordering system
- Real-time order tracking
- Admin panel for menu management
- Order history and analytics
- WebSocket-based real-time updates

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Real-time: WebSocket
- Storage: File-based system

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/vanillo.git
   cd vanillo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   node server.js
   ```

4. Access the application:
   - Main site: http://localhost:3001
   - Admin panel: http://localhost:3001/admin
   - Orders page: http://localhost:3001/orders

## Deployment

This project is configured for deployment on Render.com. See `render.yaml` for configuration details.

## Environment Variables

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3001)
- `SESSION_SECRET`: Secret key for session management

## Project Structure

- `/public`: Static files (images, CSS, JS)
- `/api`: API endpoints
- `/orders`: Order storage
- `server.js`: Main server file
- `menu-data.js`: Menu configuration
- `admin.html`: Admin panel interface
- `orders.html`: Orders management interface
- `index.html`: Main customer interface

## License

MIT License

# Allpay Payment Integration

This project integrates Allpay as the payment gateway for handling credit card payments.

## Setup Instructions

1. Create a `.env` file in the root directory with the following variables:
```env
# Allpay Configuration
ALLPAY_API_LOGIN=your_api_login
ALLPAY_API_KEY=your_api_key

# Application URLs
API_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

2. Get your Allpay API credentials:
   - Sign up for an Allpay account at https://www.allpay.co.il
   - Go to Settings > API Integrations
   - Copy your API login and key

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

## Payment Flow

1. User adds items to cart
2. User proceeds to checkout
3. User fills in their details in the payment form
4. User is redirected to Allpay's secure payment page
5. After successful payment, user is redirected back to the success page
6. If payment is cancelled, user is redirected to the cancel page

## API Endpoints

- `POST /api/payments/initiate` - Initiates a new payment
- `POST /api/payments/notify` - Handles payment notifications from Allpay

## Security

- All API calls are signed using SHA256
- Payment notifications are verified using the signature
- Sensitive data is never stored on our servers
- All communication with Allpay is done over HTTPS

## Testing

For testing payments, use the following test cards:

- Visa: 4557430402053431
- MasterCard: 5326105300985846
- AmEx: 375516193000090

Use any future date as the expiration date and any three digits for the CVV.

To simulate a failed payment, use: 4000000000000002 