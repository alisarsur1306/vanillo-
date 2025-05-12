const axios = require('axios');
(async () => {
  try {
    const response = await axios.post('http://localhost:3002/api/payment', {
      items: [{ name: 'Vanillo Fish', qty: 1, price: 20.00, vat: 1 }],
      client_name: 'Test Customer',
      client_email: 'test@example.com',
      client_phone: '0507007556'
    });
    console.log('Server response:', response.data);
    if (response.data.payment_url) {
      console.log('Allpay payment URL:', response.data.payment_url);
    } else {
      console.error('No payment_url found in response:', response.data);
    }
  } catch (error) {
    console.error('Error during test:', error.response ? error.response.data : error.message);
  }
})();