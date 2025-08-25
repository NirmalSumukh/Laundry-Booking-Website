// frontend/public/scripts/order.js
// Create order via API, then initiate payment

importScriptsIfNeeded();

// Attach handler if a form exists:
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('orderForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect form data
    const token = localStorage.getItem('lb_jwt');
    if (!token) {
      alert('Please login first.');
      return;
    }

    const items = collectItemsFromForm();
    const pickupAddress = {
      line1: document.getElementById('addr_line1').value,
      line2: document.getElementById('addr_line2').value,
      city: document.getElementById('addr_city').value,
      state: document.getElementById('addr_state').value,
      pincode: document.getElementById('addr_pincode').value,
    };
    const highPriority = document.getElementById('high_priority').checked;
    const amountPaise = Number(document.getElementById('amount_paise').value || '0');
    const totalClothes = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);

    // Create Order
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items,
        totalClothes,
        highPriority,
        pickupAddress,
        notes: document.getElementById('notes').value,
        amountPaise,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Order creation failed');
      return;
    }

    // Trigger Razorpay payment
    startPaymentFlow({ orderId: data.orderId, token });
  });
});

function collectItemsFromForm() {
  // Demo: single inputs; in real UI, loop dynamic rows
  const type = document.getElementById('item_type').value;
  const quantity = Number(document.getElementById('item_qty').value || '0');
  const notes = document.getElementById('item_notes').value;
  return [{ type, quantity, notes }];
}

async function startPaymentFlow({ orderId, token }) {
  // Create Razorpay order from backend
  const res = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId }),
  });
  const data = await res.json();
  if (!res.ok) {
    alert(data.message || 'Payment order creation failed');
    return;
  }

  const options = {
    key: data.key,
    amount: data.amount,
    currency: data.currency,
    name: 'Laundry Booking',
    description: `Payment for Order ${orderId}`,
    order_id: data.razorpayOrderId,
    handler: async function (response) {
      // Verify signature with backend
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        alert(verifyData.message || 'Payment verification failed');
        return;
      }
      alert('Payment successful and verified! Your order is confirmed.');
      window.location.href = '/'; // or customer dashboard
    },
    theme: { color: '#0ea5e9' },
  };

  // Ensure Razorpay script is loaded
  if (typeof window.Razorpay !== 'function') {
    alert('Razorpay SDK not loaded');
    return;
  }

  const rzp = new window.Razorpay(options);
  rzp.open();
}

function importScriptsIfNeeded() {
  // Load Razorpay checkout if not present (you can also include it in index.ejs)
  if (!window.Razorpay) {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.head.appendChild(s);
  }
}
