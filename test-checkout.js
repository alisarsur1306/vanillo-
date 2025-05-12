const axios = require('axios');

// Configuration
const config = {
    apiBaseUrl: 'http://localhost:3002',
    allpay: {
        apiLogin: 'pp1009681',
        apiKey: 'B139E36C2D7BC6D0AE615360588D929A'
    }
};

async function testCheckout() {
    try {
        // Test data
        const testOrder = {
            items: [
                {
                    name: "Test Item 1",
                    quantity: 2,
                    price: 100
                },
                {
                    name: "Test Item 2",
                    quantity: 1,
                    price: 200
                }
            ],
            customer: {
                name: "Test Customer",
                email: "test@example.com",
                phone: "+972545678900",
                address: "123 Test St",
                notes: "Test order"
            },
            deliveryType: "delivery",
            paymentMethod: "credit_card"
        };

        console.log('Test configuration:', config);
        console.log('Sending checkout request with data:', testOrder);
        
        const response = await axios.post(`${config.apiBaseUrl}/api/checkout`, testOrder, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response:', response.data);
        
        if (response.data.success && response.data.paymentUrl) {
            console.log('Success! Payment URL:', response.data.paymentUrl);
            console.log('Order ID:', response.data.orderId);
            
            // Optional: Open the payment URL in the default browser
            const open = (await import('open')).default;
            await open(response.data.paymentUrl);
        } else {
            console.error('Failed to get payment URL');
            console.error('Response data:', response.data);
        }
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
            if (error.response.data && error.response.data.error) {
                console.error('Server error:', error.response.data.error);
            }
        }
        if (error.request) {
            console.error('Request:', error.request);
        }
        console.error('Error config:', error.config);
    }
}

testCheckout(); 