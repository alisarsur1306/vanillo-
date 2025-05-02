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