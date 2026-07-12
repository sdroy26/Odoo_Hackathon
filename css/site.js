/* Shared navigation and lightweight interactions for the TransitOps prototype. */
(function () {
  'use strict';

  const pages = {
    'dashboard': 'dashboard.html',
    'vehicles': 'registry.html',
    'drivers': 'drivers.html',
    'trips': 'trips.html',
    'maintenance': 'maintenance.html',
    'fuel/expenses': 'fuel-expenses.html',
    'reports': 'reports.html',
    'calendar': 'fleet-calendar.html',
    'documents': 'fleet-documents.html',
    'settings': 'settings.html'
  };

  function labelFor(element) {
    return element.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function notify(message) {
    let toast = document.getElementById('shared-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'shared-toast';
      toast.setAttribute('role', 'status');
      toast.style.cssText = 'position:fixed;right:24px;bottom:24px;z-index:9999;background:#172033;color:#fff;padding:12px 16px;border-radius:8px;font:500 14px Inter,Arial,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.18);opacity:0;transform:translateY(10px);transition:.2s';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(notify.timer);
    notify.timer = setTimeout(function () { toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)'; }, 2600);
  }

  function downloadCsv() {
    const rows = Array.from(document.querySelectorAll('table tr')).map(function (row) {
      return Array.from(row.cells).map(function (cell) { return '"' + cell.innerText.replace(/"/g, '""').replace(/\n/g, ' ') + '"'; }).join(',');
    }).filter(Boolean).join('\n');
    if (!rows) return notify('There is no table data to export on this page.');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([rows], { type: 'text/csv' }));
    link.download = (document.title || 'transitops').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    notify('Export created.');
  }

  function filterContent(query) {
    const terms = query.trim().toLowerCase();
    const rows = document.querySelectorAll('tbody tr');
    if (rows.length) {
      rows.forEach(function (row) { row.hidden = !!terms && !row.innerText.toLowerCase().includes(terms); });
      return;
    }
    document.querySelectorAll('.card, .schedule-item, .expiry-item, .alert-box').forEach(function (item) {
      item.hidden = !!terms && !item.innerText.toLowerCase().includes(terms);
    });
  }

  function showTripFilter(button) {
    const menu = document.createElement('div');
    menu.style.cssText = 'position:absolute;z-index:1000;background:#fff;border:1px solid #dbe2ea;border-radius:8px;padding:6px;box-shadow:0 8px 20px rgba(15,23,42,.15);min-width:145px;';
    ['All trips', 'Dispatched', 'Draft', 'Completed', 'Cancelled'].forEach(function (name) {
      const option = document.createElement('button');
      option.type = 'button'; option.textContent = name;
      option.style.cssText = 'display:block;width:100%;border:0;background:#fff;padding:8px 10px;text-align:left;cursor:pointer;border-radius:5px;';
      option.onclick = function () {
        document.querySelectorAll('tbody tr').forEach(function (row) {
          row.hidden = name !== 'All trips' && !row.innerText.toLowerCase().includes(name.toLowerCase());
        });
        menu.remove(); notify(name + ' filter applied.');
      };
      menu.appendChild(option);
    });
    const rect = button.getBoundingClientRect();
    menu.style.left = rect.left + 'px'; menu.style.top = (rect.bottom + 6) + 'px';
    document.body.appendChild(menu);
    setTimeout(function () { document.addEventListener('click', function close(e) { if (!menu.contains(e.target) && e.target !== button) { menu.remove(); document.removeEventListener('click', close); } }); }, 0);
  }

  function showFieldFilter(field, options, column) {
    const menu = document.createElement('div');
    menu.style.cssText = 'position:absolute;z-index:1000;background:#fff;border:1px solid #dbe2ea;border-radius:8px;padding:6px;box-shadow:0 8px 20px rgba(15,23,42,.15);min-width:140px;';
    options.forEach(function (optionName) {
      const option = document.createElement('button');
      option.type = 'button'; option.textContent = optionName;
      option.style.cssText = 'display:block;width:100%;border:0;background:#fff;padding:8px 10px;text-align:left;cursor:pointer;border-radius:5px;';
      option.onclick = function () {
        field.childNodes[0].nodeValue = optionName + ' ';
        document.querySelectorAll('tbody tr').forEach(function (row) {
          const value = row.cells[column] ? row.cells[column].innerText.toLowerCase() : row.innerText.toLowerCase();
          const matches = typeof column === 'function' ? column(row, optionName) : value.includes(optionName.toLowerCase());
          row.hidden = optionName.indexOf('All ') !== 0 && !matches;
        });
        menu.remove(); notify(optionName + ' filter applied.');
      };
      menu.appendChild(option);
    });
    const rect = field.getBoundingClientRect();
    menu.style.left = rect.left + 'px'; menu.style.top = (rect.bottom + 6) + 'px';
    document.body.appendChild(menu);
    setTimeout(function () { document.addEventListener('click', function close(e) { if (!menu.contains(e.target) && e.target !== field) { menu.remove(); document.removeEventListener('click', close); } }); }, 0);
  }

  const recordConfig = {
    vehicle: {
      title: 'Add Vehicle', table: 'vehicle-records', storage: 'transitops-vehicles',
      fields: [['registration', 'Registration number', 'text'], ['name', 'Vehicle name', 'text'], ['model', 'Model', 'text'], ['type', 'Type', 'text'], ['odometer', 'Odometer', 'number']],
      row: function (v) { return '<tr><td style="padding-left:24px;font-weight:600;color:var(--text-dark);">' + escapeHtml(v.registration) + '</td><td><div style="font-weight:600;color:var(--text-dark);">' + escapeHtml(v.name) + '</div><div style="font-size:12px;color:var(--text-gray);">' + escapeHtml(v.model) + '</div></td><td style="color:var(--text-gray);">' + escapeHtml(v.type) + '</td><td style="color:var(--text-gray);">—</td><td style="color:var(--text-gray);">' + Number(v.odometer).toLocaleString() + ' mi</td></tr>'; }
    },
    driver: {
      title: 'Add Driver', table: 'driver-records', storage: 'transitops-drivers',
      fields: [['name', 'Full name', 'text'], ['email', 'Email address', 'email'], ['licence', 'Licence', 'text'], ['vehicle', 'Assigned vehicle', 'text'], ['score', 'Safety score (%)', 'number']],
      row: function (v) { return '<tr><td><strong>' + escapeHtml(v.name) + '</strong><br><small>' + escapeHtml(v.email) + '</small></td><td>' + escapeHtml(v.licence) + '</td><td>' + escapeHtml(v.vehicle || 'Unassigned') + '</td><td><span class="badge badge-green">Available</span></td><td>' + escapeHtml(v.score) + '%</td></tr>'; }
    },
    maintenance: {
      title: 'New Work Order', table: 'maintenance-records', storage: 'transitops-maintenance',
      fields: [['id', 'Work order number', 'text'], ['vehicle', 'Vehicle registration', 'text'], ['service', 'Service required', 'text'], ['dueDate', 'Due date', 'date']],
      row: function (v) { return '<tr><td><strong>' + escapeHtml(v.id) + '</strong></td><td>' + escapeHtml(v.vehicle) + '</td><td>' + escapeHtml(v.service) + '</td><td>' + new Date(v.dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + '</td><td><span class="badge badge-blue">Scheduled</span></td></tr>'; }
    }
  };

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, function (character) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]; });
  }

  function appendSavedRecords(type) {
    const config = recordConfig[type];
    const table = document.getElementById(config.table);
    if (!table) return;
    try { JSON.parse(localStorage.getItem(config.storage) || '[]').forEach(function (record) { table.insertAdjacentHTML('beforeend', config.row(record)); }); } catch (error) { /* Ignore malformed demo storage. */ }
  }

  function openRecordForm(type) {
    const config = recordConfig[type];
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,.45);display:grid;place-items:center;padding:20px;';
    const fields = config.fields.map(function (field) { return '<label style="display:block;margin:0 0 14px;font:600 12px Inter,Arial,sans-serif;color:#334155;">' + field[1] + '<input required name="' + field[0] + '" type="' + field[2] + '" style="display:block;width:100%;margin-top:6px;padding:10px;border:1px solid #cbd5e1;border-radius:6px;font:14px Inter,Arial,sans-serif;"></label>'; }).join('');
    overlay.innerHTML = '<form style="width:min(440px,100%);background:#fff;border-radius:10px;padding:24px;box-shadow:0 16px 40px rgba(0,0,0,.24);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;"><h2 style="font:700 20px Inter,Arial,sans-serif;margin:0;color:#0f172a;">' + config.title + '</h2><button type="button" data-close style="border:0;background:none;font-size:22px;cursor:pointer;">×</button></div>' + fields + '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;"><button type="button" data-close style="padding:9px 14px;border:1px solid #cbd5e1;background:#fff;border-radius:6px;cursor:pointer;">Cancel</button><button type="submit" style="padding:9px 14px;border:0;background:#0b57d0;color:#fff;border-radius:6px;font-weight:600;cursor:pointer;">Save</button></div></form>';
    overlay.querySelectorAll('[data-close]').forEach(function (button) { button.onclick = function () { overlay.remove(); }; });
    overlay.querySelector('form').onsubmit = function (event) {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      const table = document.getElementById(config.table);
      table.insertAdjacentHTML('beforeend', config.row(data));
      const saved = JSON.parse(localStorage.getItem(config.storage) || '[]'); saved.push(data); localStorage.setItem(config.storage, JSON.stringify(saved));
      overlay.remove(); notify(config.title.replace('Add ', '') + ' saved.');
    };
    document.body.appendChild(overlay);
    overlay.querySelector('input').focus();
  }

  function setupRecordForms() {
    Object.keys(recordConfig).forEach(appendSavedRecords);
    document.querySelectorAll('[data-add-record]').forEach(function (button) { button.addEventListener('click', function () { openRecordForm(button.dataset.addRecord); }); });
  }

  function setupLegacyFilters() {
    document.querySelectorAll('.input-field').forEach(function (field) {
      const text = labelFor(field);
      if (text.startsWith('all types')) field.addEventListener('click', function () { showFieldFilter(field, ['All Types', 'Heavy Duty', 'Cargo Van', 'Sedan'], 2); });
      if (text.startsWith('all statuses')) field.addEventListener('click', function () { showFieldFilter(field, ['All Statuses', 'On Trip', 'Available', 'Maintenance'], function (row, status) {
        const registry = { 'TRK-9021': 'On Trip', 'VAN-405': 'Available', 'TRK-8832': 'Maintenance', 'SED-102': 'Available' };
        return registry[row.cells[0] && row.cells[0].innerText.trim()] === status;
      }); });
      if (text.startsWith('all regions')) field.addEventListener('click', function () { showFieldFilter(field, ['All Regions', 'North Zone', 'South Zone', 'East Zone', 'West Zone'], function (row, region) {
        const registry = { 'TRK-9021': 'North Zone', 'VAN-405': 'South Zone', 'TRK-8832': 'West Zone', 'SED-102': 'East Zone' };
        return registry[row.cells[0] && row.cells[0].innerText.trim()] === region;
      }); });
    });
  }

  function addRelatedLinks() {
    if (document.body.classList.contains('login-page') || document.querySelector('.login-container')) return;
    const links = document.createElement('nav');
    links.setAttribute('aria-label', 'Additional views');
    links.style.cssText = 'position:fixed;right:16px;bottom:14px;z-index:900;display:flex;gap:10px;background:#fff;border:1px solid #dbe2ea;border-radius:999px;padding:7px 12px;box-shadow:0 4px 12px rgba(15,23,42,.10);font:600 12px Inter,Arial,sans-serif;';
    links.innerHTML = '<a href="registry.html" style="color:#0b57d0;text-decoration:none;">Vehicle Registry</a><a href="vehicle-registry.html" style="color:#0b57d0;text-decoration:none;">Vehicle Details</a><a href="comparison.html" style="color:#0b57d0;text-decoration:none;">Compare Vehicles</a>';
    document.body.appendChild(links);
  }

  function handleButton(button) {
    const name = labelFor(button);
    if (button.disabled || button.dataset.sharedBound) return;
    button.dataset.sharedBound = 'true';
    if (/export|download/.test(name)) button.addEventListener('click', downloadCsv);
    else if (/bulk csv import/.test(name)) button.addEventListener('click', function () { notify('Choose a CSV file to import.'); });
    else if (/create trip|invite user/.test(name)) button.addEventListener('click', function () { notify(name.includes('trip') ? 'Trip creation is ready to be added to the dispatch queue.' : 'Invitation form is ready.'); });
    else if (/contact driver/.test(name)) button.addEventListener('click', function () { window.location.href = 'mailto:driver@transitops.example?subject=Trip%20TRP-8091'; });
    else if (/edit trip/.test(name)) button.addEventListener('click', function () { notify('Trip editing opened for TRP-8091.'); });
    else if (/next/.test(name)) button.addEventListener('click', function () { notify('You are already viewing the available demo records.'); });
    else if (/funnel/.test(button.innerHTML)) button.addEventListener('click', function (event) { event.stopPropagation(); showTripFilter(button); });
    else if (/trash/.test(button.innerHTML)) button.addEventListener('click', function () { const row = button.closest('tr'); if (row && confirm('Remove this record?')) { row.remove(); notify('Record removed.'); } });
    else if (/pencil/.test(button.innerHTML)) button.addEventListener('click', function () { notify('Edit mode enabled for this record.'); });
  }

  function setupNavigation() {
    document.querySelectorAll('a.nav-item').forEach(function (link) {
      const destination = pages[labelFor(link)];
      if (destination) {
        link.href = destination;
        link.removeAttribute('onclick');
      } else if (link.getAttribute('href') === '#') {
        link.addEventListener('click', function (event) { event.preventDefault(); notify(link.textContent.trim() + ' is not included in this prototype.'); });
      }
    });
  }

  function normalizeNavigation() {
    const nav = document.querySelector('aside.sidebar nav.nav, aside.sidebar nav.sidebar-nav');
    if (!nav) return;
    const current = (window.location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();
    const activePages = {
      'dashboard.html': 'Dashboard', 'registry.html': 'Vehicles', 'vehicle-registry.html': 'Vehicles', 'comparison.html': 'Vehicles',
      'drivers.html': 'Drivers', 'trips.html': 'Trips', 'maintenance.html': 'Maintenance', 'fuel-expenses.html': 'Fuel/Expenses',
      'reports.html': 'Reports', 'fleet-calendar.html': 'Calendar', 'fleet-documents.html': 'Documents', 'settings.html': 'Settings'
    };
    const items = [
      ['Dashboard', 'dashboard.html', 'squares-four'], ['Vehicles', 'registry.html', 'truck'], ['Drivers', 'drivers.html', 'user'],
      ['Trips', 'trips.html', 'git-merge'], ['Maintenance', 'maintenance.html', 'wrench'], ['Fuel/Expenses', 'fuel-expenses.html', 'gas-pump'],
      ['Reports', 'reports.html', 'chart-bar'], ['Calendar', 'fleet-calendar.html', 'calendar-blank'], ['Documents', 'fleet-documents.html', 'file-text'], ['Settings', 'settings.html', 'gear']
    ];
    const materialIcons = ['dashboard', 'directions_car', 'person', 'route', 'build', 'local_gas_station', 'bar_chart', 'calendar_month', 'description', 'settings'];
    const isMaterial = !!document.querySelector('link[href*="Material+Symbols"]');
    const active = activePages[current];
    nav.innerHTML = items.map(function (item, index) {
      const icon = isMaterial ? '<span class="material-symbols-outlined">' + materialIcons[index] + '</span>' : '<i class="ph ph-' + item[2] + '"></i>';
      return '<a href="' + item[1] + '" class="nav-item' + (item[0] === active ? ' active' : '') + '">' + icon + item[0] + '</a>';
    }).join('');
    document.querySelectorAll('aside.sidebar .sidebar-footer > a.nav-item[href="settings.html"]').forEach(function (link) { link.parentElement.remove(); });
  }

  function setupPage() {
    normalizeNavigation();
    setupNavigation();
    setupRecordForms();
    setupLegacyFilters();
    addRelatedLinks();
    document.querySelectorAll('.search input, input[type="search"]').forEach(function (input) { input.addEventListener('input', function () { filterContent(input.value); }); });
    document.querySelectorAll('button').forEach(handleButton);
    document.querySelectorAll('.profile-btn, .header-user-profile').forEach(function (profile) {
      if (profile.hasAttribute('onclick')) return;
      profile.addEventListener('click', function (event) {
        event.stopPropagation();
        document.querySelectorAll('.shared-profile-menu').forEach(function (menu) { menu.remove(); });
        const menu = document.createElement('div');
        menu.className = 'shared-profile-menu';
        menu.style.cssText = 'position:fixed;z-index:1000;background:#fff;border:1px solid #dbe2ea;border-radius:8px;padding:6px;box-shadow:0 8px 20px rgba(15,23,42,.15);min-width:120px;';
        const signOut = document.createElement('button');
        signOut.type = 'button'; signOut.textContent = 'Sign out';
        signOut.style.cssText = 'border:0;background:#fff;color:#b91c1c;padding:8px 10px;width:100%;text-align:left;cursor:pointer;border-radius:5px;';
        signOut.onclick = function () { window.location.href = 'login.html'; };
        menu.appendChild(signOut);
        const rect = profile.getBoundingClientRect();
        menu.style.right = Math.max(12, window.innerWidth - rect.right) + 'px'; menu.style.top = (rect.bottom + 6) + 'px';
        document.body.appendChild(menu);
      });
    });
    document.querySelectorAll('a[href="#"]').forEach(function (link) {
      if (!link.closest('.nav-item')) link.addEventListener('click', function (event) { event.preventDefault(); notify('Details opened for ' + link.textContent.trim() + '.'); });
    });
  }

  document.addEventListener('DOMContentLoaded', setupPage);
  window.TransitOps = Object.assign(window.TransitOps || {}, { notify: notify, filterContent: filterContent });
}());
