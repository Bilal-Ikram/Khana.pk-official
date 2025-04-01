const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL;
    this.apiKey = process.env.WHATSAPP_API_KEY;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  }

  async sendOrderConfirmation(order, customerPhone) {
    try {
      const message = this.formatOrderMessage(order);
      
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: customerPhone,
          type: "text",
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  formatOrderMessage(order) {
    const items = order.items.map(item => 
      `${item.name} (${item.quantity}x) - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    return `🎉 Order Confirmation #${order._id}\n\n` +
           `Thank you for your order!\n\n` +
           `Order Details:\n` +
           `Restaurant: ${order.restaurantName}\n` +
           `Items:\n${items}\n\n` +
           `Total Amount: $${order.totalAmount.toFixed(2)}\n\n` +
           `Delivery Details:\n` +
           `Name: ${order.deliveryDetails.name}\n` +
           `Address: ${order.deliveryDetails.address}\n` +
           `City: ${order.deliveryDetails.city}\n\n` +
           `Order Status: ${order.status}\n\n` +
           `Track your order at: http://localhost:5173/order-tracking/${order._id}\n\n` +
           `Thank you for choosing our service! 🙏`;
  }
}

module.exports = new WhatsAppService(); 