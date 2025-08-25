// frontend/public/scripts/dashboard.js
// Customer dashboard navigation and functionality

document.addEventListener('DOMContentLoaded', () => {
  initializeDashboard();
  loadCustomerOrders();
  setupAmountCalculator();
});

function initializeDashboard() {
  // Tab navigation
  const menuItems = document.querySelectorAll('.menu-item');
  const sections = document.querySelectorAll('.dashboard-section');

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all items and sections
      menuItems.forEach(mi => mi.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');
      
      // Show corresponding section
      const sectionId = item.getAttribute('data-section');
      const section = document.getElementById(sectionId);
      if (section) {
        section.classList.add('active');
      }
      
      // Load section-specific data
      if (sectionId === 'my-orders') {
        loadCustomerOrders();
      }
    });
  });
}

async function loadCustomerOrders() {
  const token = localStorage.getItem('lb_jwt');
  if (!token) return;

  const container = document.getElementById('customer_orders');
  if (!container) return;

  try {
    container.innerHTML = '<div class="loading-placeholder">Loading orders...</div>';
    
    const response = await fetch('/api/orders/me', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load orders');
    }

    const orders = await response.json();
    displayCustomerOrders(orders, container);
  } catch (error) {
    console.error('Error loading orders:', error);
    container.innerHTML = '<div class="error-message">Failed to load orders. Please refresh the page.</div>';
  }
}

function displayCustomerOrders(orders, container) {
  if (!orders.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No orders yet</h3>
        <p>Create your first order to get started!</p>
        <button class="btn primary" onclick="showSection('new-order')">Create Order</button>
      </div>
    `;
    return;
  }

  const ordersHtml = orders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div class="order-id">Order #${order._id.slice(-8)}</div>
        <div class="order-status status-${order.status}">${formatStatus(order.status)}</div>
      </div>
      <div class="order-details">
        <div class="order-info">
          <p><strong>Items:</strong> ${order.totalClothes} pieces</p>
          <p><strong>Amount:</strong> ₹${(order.payment.amount / 100).toFixed(2)}</p>
          <p><strong>Priority:</strong> ${order.highPriority ? 'High' : 'Normal'}</p>
          <p><strong>Created:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div class="order-address">
          <p><strong>Pickup Address:</strong></p>
          <p>${order.pickupAddress.line1}</p>
          ${order.pickupAddress.line2 ? `<p>${order.pickupAddress.line2}</p>` : ''}
          <p>${order.pickupAddress.city}, ${order.pickupAddress.state} ${order.pickupAddress.pincode}</p>
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = ordersHtml;
}

function formatStatus(status) {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function setupAmountCalculator() {
  const priorityCheckbox = document.getElementById('high_priority');
  const amountInput = document.getElementById('amount_paise');
  const amountText = document.querySelector('.amount-text');

  if (priorityCheckbox && amountInput && amountText) {
    const baseAmount = 49900; // ₹499 in paise
    const priorityFee = 10000; // ₹100 in paise

    priorityCheckbox.addEventListener('change', () => {
      const total = baseAmount + (priorityCheckbox.checked ? priorityFee : 0);
      amountInput.value = total;
      amountText.textContent = `₹${(total / 100).toFixed(2)}`;
    });
  }
}

function showSection(sectionId) {
  const menuItem = document.querySelector(`[data-section="${sectionId}"]`);
  if (menuItem) {
    menuItem.click();
  }
}

// Make functions globally available
window.showSection = showSection;
