// frontend/public/scripts/admin.js
// Admin dashboard: list orders, update status

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('lb_jwt');
  if (!token) {
    console.warn('Admin token not found');
    return;
  }
  loadAdminOrders(token);

  // Update status handler
  const statusForm = document.getElementById('statusForm');
  if (statusForm) {
    statusForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const orderId = document.getElementById('status_order_id').value;
      const status = document.getElementById('status_select').value;

      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to update status');
        return;
      }
      alert('Status updated!');
      loadAdminOrders(token);
    });
  }
});

async function loadAdminOrders(token) {
  const container = document.getElementById('admin_orders');
  if (!container) return;

  const res = await fetch('/api/orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const orders = await res.json();

  if (!Array.isArray(orders)) {
    container.innerHTML = '<p>Failed to load orders.</p>';
    return;
  }

  // Render simple table
  container.innerHTML = `
    <table class="orders-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Paid</th>
          <th>Pickup City</th>
        </tr>
      </thead>
      <tbody>
        ${orders
          .map(
            (o) => `
          <tr>
            <td>${o._id}</td>
            <td>${o.customer?.name || 'N/A'}</td>
            <td>${o.totalClothes}</td>
            <td>${o.highPriority ? 'Yes' : 'No'}</td>
            <td>${o.status}</td>
            <td>${o.payment?.paid ? 'Yes' : 'No'}</td>
            <td>${o.pickupAddress?.city || ''}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}
