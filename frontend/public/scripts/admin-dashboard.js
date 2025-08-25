// frontend/public/scripts/admin-dashboard.js
// Admin dashboard functionality and analytics

document.addEventListener('DOMContentLoaded', () => {
  initializeAdminDashboard();
  loadAnalytics();
  setupFilters();
});

function initializeAdminDashboard() {
  // Tab navigation (reuse logic from dashboard.js)
  const menuItems = document.querySelectorAll('.menu-item');
  const sections = document.querySelectorAll('.admin-section');

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      menuItems.forEach(mi => mi.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));
      
      item.classList.add('active');
      
      const sectionId = item.getAttribute('data-section');
      const section = document.getElementById(sectionId);
      if (section) {
        section.classList.add('active');
      }
      
      // Load section-specific data
      if (sectionId === 'orders') {
        loadAdminOrders();
      } else if (sectionId === 'analytics') {
        loadAnalytics();
      } else if (sectionId === 'customers') {
        loadCustomers();
      }
    });
  });

  // Initially load orders
  loadAdminOrders();
}

function setupFilters() {
  const statusFilter = document.getElementById('status_filter');
  const priorityFilter = document.getElementById('priority_filter');
  const refreshBtn = document.getElementById('refresh_orders');

  if (statusFilter) {
    statusFilter.addEventListener('change', loadAdminOrders);
  }
  
  if (priorityFilter) {
    priorityFilter.addEventListener('change', loadAdminOrders);
  }
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadAdminOrders);
  }
}

async function loadAdminOrders() {
  const token = localStorage.getItem('lb_jwt');
  if (!token) return;

  const container = document.getElementById('admin_orders');
  if (!container) return;

  try {
    // Get filter values
    const statusFilter = document.getElementById('status_filter')?.value || '';
    const priorityFilter = document.getElementById('priority_filter')?.value || '';
    
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    if (priorityFilter) params.append('highPriority', priorityFilter);

    container.innerHTML = '<div class="loading-placeholder">Loading orders...</div>';
    
    const response = await fetch(`/api/orders?${params.toString()}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load orders');
    }

    const orders = await response.json();
    displayAdminOrders(orders, container);
  } catch (error) {
    console.error('Error loading orders:', error);
    container.innerHTML = '<div class="error-message">Failed to load orders. Please check your permissions.</div>';
  }
}

function displayAdminOrders(orders, container) {
  if (!orders.length) {
    container.innerHTML = '<div class="empty-state"><h3>No orders found</h3><p>No orders match the current filters.</p></div>';
    return;
  }

  const tableHtml = `
    <table class="orders-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Items</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Payment</th>
          <th>Amount</th>
          <th>City</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr>
            <td><strong>#${order._id.slice(-8)}</strong></td>
            <td>
              <div>
                <div><strong>${order.customer?.name || 'N/A'}</strong></div>
                <div style="font-size: 12px; color: var(--muted);">${order.customer?.email || ''}</div>
              </div>
            </td>
            <td>${order.totalClothes} pieces</td>
            <td>
              <span class="priority-badge priority-${order.highPriority ? 'high' : 'normal'}">
                ${order.highPriority ? 'High' : 'Normal'}
              </span>
            </td>
            <td>
              <span class="order-status status-${order.status}">${formatStatus(order.status)}</span>
            </td>
            <td>
              <span style="color: ${order.payment?.paid ? 'var(--accent)' : 'var(--danger)'}">
                ${order.payment?.paid ? '✓ Paid' : '✗ Unpaid'}
              </span>
            </td>
            <td>₹${(order.payment?.amount / 100 || 0).toFixed(2)}</td>
            <td>${order.pickupAddress?.city || 'N/A'}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = tableHtml;
}

async function loadAnalytics() {
  const token = localStorage.getItem('lb_jwt');
  if (!token) return;

  try {
    const response = await fetch('/api/orders', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) return;

    const orders = await response.json();
    displayAnalytics(orders);
  } catch (error) {
    console.error('Error loading analytics:', error);
  }
}

function displayAnalytics(orders) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ['pending_payment', 'confirmed', 'in_progress'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const totalRevenue = orders
    .filter(o => o.payment?.paid)
    .reduce((sum, o) => sum + (o.payment?.amount || 0), 0) / 100;

  document.getElementById('total_orders').textContent = totalOrders;
  document.getElementById('pending_orders').textContent = pendingOrders;
  document.getElementById('completed_orders').textContent = completedOrders;
  document.getElementById('revenue').textContent = `₹${totalRevenue.toFixed(2)}`;
}

async function loadCustomers() {
  // This would require a new API endpoint to list customers
  // For now, show a placeholder
  const container = document.getElementById('customers_list');
  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Customer Management</h3>
        <p>Customer management features coming soon!</p>
      </div>
    `;
  }
}

function formatStatus(status) {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}
