document.addEventListener('DOMContentLoaded', () => {
  renderHeader();

  if (!Auth.isLoggedIn() || Auth.getCurrentUser().role !== 'super_admin') {
    Toast.show('Access Denied. Super Admins only.', 'error');
    window.location.href = 'index.html';
    return;
  }

  renderSuperAdminDashboard();
});

// ─── ADMIN FORM TOGGLES ────────────────────────
function showAddAdminForm() {
  document.getElementById('add-admin-form').style.display = 'block';
}

function hideAddAdminForm() {
  document.getElementById('add-admin-form').style.display = 'none';
  document.getElementById('add-admin-msg').textContent = '';
}

async function createAdmin() {
  const firstName = document.getElementById('new-admin-firstname').value.trim();
  const lastName = document.getElementById('new-admin-lastname').value.trim();
  const email = document.getElementById('new-admin-email').value.trim();
  const password = document.getElementById('new-admin-password').value;
  const role = document.getElementById('new-admin-role').value;
  const msgEl = document.getElementById('add-admin-msg');

  if (!firstName || !lastName || !email || !password) {
    msgEl.innerHTML = '<span style="color: #ff4757;">Please fill in all fields.</span>';
    return;
  }

  try {
    const res = await fetch('/api/admin/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password, role })
    });
    const data = await res.json();
    if (data.success) {
      msgEl.innerHTML = '<span style="color: #28a745;">Admin created successfully!</span>';
      document.getElementById('new-admin-firstname').value = '';
      document.getElementById('new-admin-lastname').value = '';
      document.getElementById('new-admin-email').value = '';
      document.getElementById('new-admin-password').value = '';
      setTimeout(() => {
        hideAddAdminForm();
        renderSuperAdminDashboard();
      }, 1000);
    } else {
      msgEl.innerHTML = `<span style="color: #ff4757;">${data.message}</span>`;
    }
  } catch (err) {
    msgEl.innerHTML = '<span style="color: #ff4757;">Network error.</span>';
  }
}

// ─── PRODUCT FORM TOGGLES ──────────────────────
function showAddProductForm() {
  document.getElementById('edit-product-id').value = '';
  document.getElementById('product-form-title').textContent = 'Add New Product';
  ['prod-name','prod-brand','prod-price','prod-image','prod-section','prod-description','prod-original-price','prod-discount','prod-rating','prod-reviews'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  ['prod-spec-display','prod-spec-processor','prod-spec-ram','prod-spec-storage','prod-spec-camera','prod-spec-battery','prod-spec-os','prod-spec-weight'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const colorsEl = document.getElementById('prod-colors'); if (colorsEl) colorsEl.value = '';
  document.getElementById('prod-category').value = 'Mobile Phone';
  document.getElementById('prod-instock').checked = true;
  document.getElementById('prod-featured').checked = false;
  document.getElementById('add-product-form').style.display = 'block';
  document.getElementById('add-product-msg').textContent = '';
}

function hideAddProductForm() {
  document.getElementById('add-product-form').style.display = 'none';
  document.getElementById('add-product-msg').textContent = '';
}

function editProduct(product) {
  document.getElementById('edit-product-id').value = product.id;
  document.getElementById('product-form-title').textContent = 'Edit Product: ' + product.name;
  document.getElementById('prod-name').value = product.name || '';
  document.getElementById('prod-brand').value = product.brand || '';
  document.getElementById('prod-category').value = product.category || 'Mobile Phone';
  document.getElementById('prod-price').value = product.price || '';
  document.getElementById('prod-image').value = product.image || '';
  document.getElementById('prod-section').value = product.section || '';
  document.getElementById('prod-description').value = product.description || '';
  document.getElementById('prod-original-price').value = product.originalPrice || '';
  document.getElementById('prod-discount').value = product.discount || '';
  document.getElementById('prod-rating').value = product.rating || '';
  document.getElementById('prod-reviews').value = product.reviews || '';
  const specs = product.specs || {};
  document.getElementById('prod-spec-display').value = specs.display || '';
  document.getElementById('prod-spec-processor').value = specs.processor || '';
  document.getElementById('prod-spec-ram').value = specs.ram || '';
  document.getElementById('prod-spec-storage').value = (specs.storage || []).join('/') || '';
  document.getElementById('prod-spec-camera').value = specs.camera || '';
  document.getElementById('prod-spec-battery').value = specs.battery || '';
  document.getElementById('prod-spec-os').value = specs.os || '';
  document.getElementById('prod-spec-weight').value = specs.weight || '';
  const colors = product.colors || [];
  document.getElementById('prod-colors').value = colors.map(c => `${c.name},${c.hex}`).join('\n');
  document.getElementById('prod-instock').checked = product.inStock !== false;
  document.getElementById('prod-featured').checked = product.featured === true;
  document.getElementById('add-product-form').style.display = 'block';
  document.getElementById('add-product-msg').textContent = '';
}

async function saveProduct() {
  const editId = document.getElementById('edit-product-id').value;
  const name = document.getElementById('prod-name').value.trim();
  const brand = document.getElementById('prod-brand').value.trim();
  const category = document.getElementById('prod-category').value;
  const price = parseFloat(document.getElementById('prod-price').value);
  const image = document.getElementById('prod-image').value.trim();
  const section = document.getElementById('prod-section').value.trim();
  const description = document.getElementById('prod-description').value.trim();
  const originalPrice = parseFloat(document.getElementById('prod-original-price').value) || null;
  const discount = parseFloat(document.getElementById('prod-discount').value) || 0;
  const rating = parseFloat(document.getElementById('prod-rating').value) || 0;
  const reviews = parseInt(document.getElementById('prod-reviews').value) || 0;
  const inStock = document.getElementById('prod-instock').checked;
  const featured = document.getElementById('prod-featured').checked;
  const msgEl = document.getElementById('add-product-msg');

  if (!name || !brand || !price) {
    msgEl.innerHTML = '<span style="color: #ff4757;">Name, brand, and price are required.</span>';
    return;
  }

  // Build specs object
  const specs = {};
  const specFields = { display: 'prod-spec-display', processor: 'prod-spec-processor', ram: 'prod-spec-ram', camera: 'prod-spec-camera', battery: 'prod-spec-battery', os: 'prod-spec-os', weight: 'prod-spec-weight' };
  Object.keys(specFields).forEach(key => {
    const val = document.getElementById(specFields[key]).value.trim();
    if (val) specs[key] = val;
  });
  const storageVal = document.getElementById('prod-spec-storage').value.trim();
  if (storageVal) specs.storage = storageVal.split('/').map(s => s.trim()).filter(Boolean);

  // Build colors array
  const colorsText = document.getElementById('prod-colors').value.trim();
  const colors = colorsText ? colorsText.split('\n').map(line => {
    const parts = line.split(',').map(s => s.trim());
    if (parts.length >= 2 && parts[0] && parts[1]) return { name: parts[0], hex: parts[1] };
    return null;
  }).filter(Boolean) : [];

  // Auto-assign section based on category if not provided
  const sectionMap = {
    'Mobile Phone': 'new-arrival',
    'Smart Watch': 'smart-watch',
    'Accessories': 'accessories',
    'SecondHand': 'special-offer'
  };
  const finalSection = section || sectionMap[category] || null;

  const body = { name, brand, category, price, originalPrice, discount, description, specs, colors, rating, reviews, inStock, featured, section: finalSection, image };

  try {
    const url = editId ? `/api/products/${editId}` : '/api/products';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      msgEl.innerHTML = '<span style="color: #28a745;">Product saved successfully!</span>';
      setTimeout(() => {
        hideAddProductForm();
        renderSuperAdminDashboard();
      }, 800);
    } else {
      msgEl.innerHTML = `<span style="color: #ff4757;">${data.message}</span>`;
    }
  } catch (err) {
    msgEl.innerHTML = '<span style="color: #ff4757;">Network error.</span>';
  }
}

async function deleteProduct(productId) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try {
    const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      Toast.show('Product deleted', 'success');
      renderSuperAdminDashboard();
    } else {
      Toast.show(data.message || 'Failed to delete', 'error');
    }
  } catch (err) {
    Toast.show('Network error', 'error');
  }
}

// ─── MAIN DASHBOARD RENDER ─────────────────────
let charts = [];

function destroyCharts() {
  charts.forEach(c => { try { c.destroy(); } catch(e) {} });
  charts = [];
}

async function renderSuperAdminDashboard() {
  destroyCharts();

  try {
    const safeFetch = async (url, fallback) => { try { const r = await fetch(url); if (!r.ok) return fallback; return await r.json(); } catch(e) { return fallback; } };

    const analytics = await safeFetch('/api/admin/analytics/today', { today: { orderCount: 0, totalRevenue: 0, estimatedProfit: 0, avgOrderValue: 0 }, pending: 0, lifetime: { totalOrders: 0, totalRevenue: 0 } });
    const productStats = await safeFetch('/api/admin/products/stats', { total: 0, byCategory: [], stockByCategory: [] });
    const weeklyData = await safeFetch('/api/admin/analytics/weekly', []);
    const monthlyData = await safeFetch('/api/admin/analytics/monthly', []);

    // Update stat cards
    document.getElementById('stat-today-orders').textContent = analytics.today.orderCount;
    document.getElementById('stat-today-revenue').textContent = formatPrice(analytics.today.totalRevenue);
    document.getElementById('stat-today-profit').textContent = formatPrice(analytics.today.estimatedProfit);
    document.getElementById('stat-today-avg').textContent = formatPrice(analytics.today.avgOrderValue);
    document.getElementById('stat-total-orders').textContent = analytics.lifetime.totalOrders;
    document.getElementById('stat-lifetime-revenue').textContent = formatPrice(analytics.lifetime.totalRevenue);
    document.getElementById('stat-pending-orders').textContent = analytics.pending;
    document.getElementById('stat-total-products').textContent = productStats.total;

    // Render Charts
    if (monthlyData.length) renderMonthlyRevenueChart(monthlyData);
    if (productStats.byCategory.length) renderCategoryPieChart(productStats.byCategory);
    if (productStats.stockByCategory.length) renderStockBarChart(productStats.stockByCategory);
    if (weeklyData.length) renderWeeklyOrdersChart(weeklyData);

    // Fetch all users
    const allUsers = await Auth.getUsers();
    const admins = allUsers.filter(u => u.role === 'admin' || u.role === 'super_admin');

    // Render Admins Table
    const adminTbody = document.getElementById('admin-list');
    adminTbody.innerHTML = admins.map(user => `
      <tr>
        <td style="color: white;">${user.firstName} ${user.lastName} ${user.role === 'super_admin' ? '<span style="background: #f5a623; color: #000; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600;">SUPER</span>' : ''}</td>
        <td style="color: white;">${user.email}</td>
        <td>
          <span style="background: ${user.role === 'super_admin' ? 'rgba(245,166,35,0.15)' : 'rgba(102,126,234,0.15)'}; color: ${user.role === 'super_admin' ? '#f5a623' : '#667eea'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
            ${user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </span>
        </td>
        <td style="color: var(--text-secondary); font-size: 12px;">${user.createdAt ? formatDate(user.createdAt) : 'N/A'}</td>
        <td>
          ${user.role !== 'super_admin' ? `
            <button class="btn-status" style="background: #e74c3c;" onclick="deleteAdmin('${user.id}')">
              <i class="fas fa-trash"></i> Remove
            </button>
          ` : '<span style="color: var(--text-muted); font-size: 11px;">—</span>'}
        </td>
      </tr>
    `).join('');

    // Render All Users Table
    const userTbody = document.getElementById('super-users-list');
    userTbody.innerHTML = allUsers.map(user => `
      <tr>
        <td style="color: white;">${user.firstName} ${user.lastName}</td>
        <td style="color: white;">${user.email}</td>
        <td>
          <select onchange="changeUserRole('${user.id}', this.value)" style="background: var(--bg-primary); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 4px 8px; border-radius: var(--radius-sm); font-size: 12px;">
            <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>Customer</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
            <option value="super_admin" ${user.role === 'super_admin' ? 'selected' : ''}>Super Admin</option>
          </select>
        </td>
        <td style="color: var(--text-secondary); font-size: 12px;">${user.createdAt ? formatDate(user.createdAt) : 'N/A'}</td>
        <td>
          <button class="btn-status" style="background: #e74c3c;" onclick="deleteUser('${user.id}')">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      </tr>
    `).join('');

    // Render Orders Table
    const allOrders = await Orders.getAll();
    const orderTbody = document.getElementById('super-orders-list');
    if (allOrders.length === 0) {
      orderTbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 30px;">No orders have been placed yet.</td></tr>`;
    } else {
      orderTbody.innerHTML = allOrders.map(order => {
        const ship = order.shippingInfo || {};
        return `
        <tr>
          <td style="font-weight: 700; color: white; font-size: 12px;">${order.id}</td>
          <td style="font-size: 12px; white-space: nowrap;">${formatDate(order.createdAt)}</td>
          <td>
            <div style="color: white; font-size: 13px;">${order.customerName}</div>
            <div style="font-size: 10px; color: var(--text-muted);">${order.customerEmail}</div>
          </td>
          <td style="font-size: 12px; color: var(--text-secondary);">
            ${(order.items || []).map(item => `
              <div style="white-space: nowrap; margin-bottom: 2px;">
                <span style="color: white;">${item.name}</span>
                <span style="color: var(--text-muted);"> x${item.quantity}</span>
                ${item.selectedColor ? `<span style="color: var(--accent-purple); font-size: 10px;"> (${item.selectedColor})</span>` : ''}
                ${item.selectedStorage ? `<span style="color: var(--accent-purple); font-size: 10px;"> ${item.selectedStorage}</span>` : ''}
              </div>
            `).join('') || '<span style="color: var(--text-muted);">N/A</span>'}
          </td>
          <td style="font-size: 12px; color: var(--text-secondary); max-width: 200px;">
            <div>${ship.firstName || ''} ${ship.lastName || ''}</div>
            <div style="font-size: 11px;">${ship.phone || ''}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${ship.address || ''}</div>
          </td>
          <td>
            ${order.paymentScreenshot ? `
              <a href="${order.paymentScreenshot}" target="_blank" style="display:inline-block;">
                <img src="${order.paymentScreenshot}" alt="Payment" style="width:50px;height:50px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,0.1);transition:transform 0.2s;" onmouseover="this.style.transform='scale(2.5)';this.style.zIndex='10';this.style.position='relative'" onmouseout="this.style.transform='';this.style.zIndex='';this.style.position=''" onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">
                <span style="display:none;color:var(--accent-purple);font-size:11px;"><i class="fas fa-image"></i></span>
              </a>
            ` : `<span style="color: var(--text-muted); font-size: 11px;">N/A</span>`}
          </td>
          <td style="font-weight: 600; color: white;">${formatPrice(order.total)}</td>
          <td>
            <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
          </td>
          <td>
            <div style="display:flex;gap:4px;flex-wrap:nowrap;">
            ${order.status === 'Processing' ? `
              <button class="btn-status process" onclick="superUpdateOrderStatus('${order.id}', 'Completed')">
                <i class="fas fa-check"></i> Complete
              </button>
            ` : `
              <button class="btn-status" style="background:#4a90e2" onclick="superUpdateOrderStatus('${order.id}', 'Processing')">
                <i class="fas fa-undo"></i> Undo
              </button>
            `}
              <button class="btn-status" style="background:#e74c3c;" onclick="superDeleteOrder('${order.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `}).join('');
    }

    // Render Products Table
    const products = await fetchProducts();
    const prodTbody = document.getElementById('super-products-list');
    if (products.length === 0) {
      prodTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px;">No products found.</td></tr>`;
    } else {
      prodTbody.innerHTML = products.map(p => `
        <tr>
          <td style="color: var(--text-muted); font-size: 12px;">${p.id}</td>
          <td style="color: white; font-weight: 500;">
            <a href="product-detail.html?id=${p.id}" style="color: white;">${p.name}</a>
          </td>
          <td style="color: var(--text-secondary);">${p.brand}</td>
          <td style="color: var(--text-secondary);">${p.category}</td>
          <td style="color: white; font-weight: 600;">${formatPrice(p.price)}</td>
          <td>
            <span style="color: ${p.inStock ? '#2ecc71' : '#e74c3c'}; font-weight: 600;">
              ${p.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </td>
          <td>${p.featured ? '<span style="color: #f5a623;"><i class="fas fa-star"></i></span>' : '<span style="color: var(--text-muted);">—</span>'}</td>
          <td>
            <div style="display: flex; gap: 4px;">
              <button class="btn-status" style="background: #4a90e2;" onclick='editProduct(${JSON.stringify(p).replace(/'/g, "\\'")})'>
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-status" style="background: #e74c3c;" onclick="deleteProduct(${p.id})">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }

  } catch (err) {
    console.error('Super Admin Dashboard Error:', err);
  }
}

// ─── CHART RENDERERS ────────────────────────────
function renderMonthlyRevenueChart(data) {
  const ctx = document.getElementById('monthlyRevenueChart');
  if (!ctx) return;
  const labels = data.map(d => d.month);
  const revenue = data.map(d => d.revenue);
  const orders = data.map(d => d.orders);

  charts.push(new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenue,
          backgroundColor: 'rgba(102, 126, 234, 0.7)',
          borderColor: '#667eea',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Orders',
          data: orders,
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
          borderColor: '#2ecc71',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: 'white' } }
      },
      scales: {
        x: { ticks: { color: '#a0a0b0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: {
          type: 'linear', display: true, position: 'left',
          ticks: { color: '#a0a0b0', callback: v => '$' + v },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        y1: {
          type: 'linear', display: true, position: 'right',
          ticks: { color: '#a0a0b0' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  }));
}

function renderCategoryPieChart(data) {
  const ctx = document.getElementById('categoryPieChart');
  if (!ctx) return;
  const colors = ['#667eea', '#2ecc71', '#f5a623', '#e74c3c', '#9b59b6', '#1abc9c'];

  charts.push(new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.category),
      datasets: [{
        data: data.map(d => d.count),
        backgroundColor: colors.slice(0, data.length),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: 'white', padding: 15 }
        }
      }
    }
  }));
}

function renderStockBarChart(data) {
  const ctx = document.getElementById('stockBarChart');
  if (!ctx) return;
  const labels = data.map(d => d.category);

  charts.push(new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'In Stock',
          data: data.map(d => d.in_stock),
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
          borderColor: '#2ecc71',
          borderWidth: 1
        },
        {
          label: 'Out of Stock',
          data: data.map(d => d.out_of_stock),
          backgroundColor: 'rgba(231, 76, 60, 0.7)',
          borderColor: '#e74c3c',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: 'white' } }
      },
      scales: {
        x: { stacked: false, ticks: { color: '#a0a0b0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { stacked: false, ticks: { color: '#a0a0b0' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  }));
}

function renderWeeklyOrdersChart(data) {
  const ctx = document.getElementById('weeklyOrdersChart');
  if (!ctx) return;
  const labels = data.map(d => d.date);
  const orders = data.map(d => d.orders);
  const revenue = data.map(d => d.revenue);

  charts.push(new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Orders',
          data: orders,
          borderColor: '#f5a623',
          backgroundColor: 'rgba(245, 166, 35, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#f5a623'
        },
        {
          label: 'Revenue',
          data: revenue,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#667eea',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: 'white' } }
      },
      scales: {
        x: { ticks: { color: '#a0a0b0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: {
          ticks: { color: '#a0a0b0' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        y1: {
          position: 'right',
          ticks: { color: '#a0a0b0', callback: v => '$' + v },
          grid: { drawOnChartArea: false }
        }
      }
    }
  }));
}

// ─── USER / ADMIN ACTIONS ──────────────────────
async function changeUserRole(userId, newRole) {
  if (!confirm(`Change this user's role to "${newRole}"?`)) return;
  try {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    const data = await res.json();
    if (data.success) {
      Toast.show('User role updated successfully', 'success');
      renderSuperAdminDashboard();
    } else {
      Toast.show(data.message || 'Failed to update role', 'error');
    }
  } catch (err) {
    Toast.show('Network error', 'error');
  }
}

window.deleteUser = async function(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  try {
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      Toast.show('User deleted successfully', 'success');
      renderSuperAdminDashboard();
    } else {
      Toast.show(data.message || 'Failed to delete user', 'error');
    }
  } catch (err) {
    Toast.show('Network error', 'error');
  }
};

window.deleteAdmin = async function(userId) {
  if (!confirm('Remove this admin? Their account will be deleted.')) return;
  try {
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      Toast.show('Admin removed successfully', 'success');
      renderSuperAdminDashboard();
    } else {
      Toast.show(data.message || 'Failed to remove admin', 'error');
    }
  } catch (err) {
    Toast.show('Network error', 'error');
  }
};

// ─── ORDER MANAGEMENT ──────────────────────────────
window.superUpdateOrderStatus = async function(orderId, newStatus) {
  const user = Auth.getCurrentUser();
  const adminId = user ? user.email : undefined;
  if (await Orders.updateStatus(orderId, newStatus, adminId)) {
    Toast.show(`Order ${orderId} marked as ${newStatus}`, 'success');
    renderSuperAdminDashboard();
  }
};

window.superDeleteOrder = async function(orderId) {
  if (!confirm(`Delete order ${orderId}? This cannot be undone.`)) return;
  if (await Orders.deleteOrder(orderId)) {
    Toast.show(`Order ${orderId} deleted`, 'success');
    renderSuperAdminDashboard();
  } else {
    Toast.show('Failed to delete order', 'error');
  }
};
