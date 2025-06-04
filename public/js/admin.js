// Admin Panel JavaScript for Tusenfryd

document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin components
    initDashboard();
    initDataTables();
    initCharts();
    initFormValidation();
    initRealTimeUpdates();
    initBulkActions();
});

// Dashboard Management
function initDashboard() {
    if (window.location.pathname === '/admin/dashboard') {
        loadDashboardStats();
        setInterval(loadDashboardStats, 300000); // Refresh every 5 minutes
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch('/admin/api/dashboard-stats');
        if (response.ok) {
            const stats = await response.json();
            updateDashboardCards(stats);
        }
    } catch (error) {
        console.error('Dashboard stats error:', error);
    }
}

function updateDashboardCards(stats) {
    // Update stat cards
    const updates = [
        { selector: '#total-attractions', value: stats.totalAttractions },
        { selector: '#active-reservations', value: stats.activeReservations },
        { selector: '#visitors-today', value: stats.visitorsToday },
        { selector: '#revenue-today', value: `$${stats.revenueToday || 0}` }
    ];
    
    updates.forEach(update => {
        const element = document.querySelector(update.selector);
        if (element) {
            element.textContent = update.value;
        }
    });
}

// Data Tables Enhancement
function initDataTables() {
    const tables = document.querySelectorAll('.data-table');
    
    tables.forEach(table => {
        // Add sorting functionality
        const headers = table.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => sortTable(table, header.dataset.sort));
        });
        
        // Add row selection
        addRowSelection(table);
    });
}

function sortTable(table, column) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const isAscending = table.dataset.sortDirection !== 'asc';
    
    rows.sort((a, b) => {
        const aValue = a.querySelector(`td[data-${column}]`)?.textContent || '';
        const bValue = b.querySelector(`td[data-${column}]`)?.textContent || '';
        
        if (column === 'date') {
            return isAscending ? 
                new Date(aValue) - new Date(bValue) : 
                new Date(bValue) - new Date(aValue);
        }
        
        if (column === 'number') {
            return isAscending ? 
                parseFloat(aValue) - parseFloat(bValue) : 
                parseFloat(bValue) - parseFloat(aValue);
        }
        
        return isAscending ? 
            aValue.localeCompare(bValue) : 
            bValue.localeCompare(aValue);
    });
    
    rows.forEach(row => tbody.appendChild(row));
    table.dataset.sortDirection = isAscending ? 'asc' : 'desc';
}

function addRowSelection(table) {
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        row.addEventListener('click', function(e) {
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
                this.classList.toggle('table-active');
                updateBulkActions();
            }
        });
    });
}

// Charts and Visualizations
function initCharts() {
    const chartContainers = document.querySelectorAll('[data-chart]');
    
    chartContainers.forEach(container => {
        const chartType = container.dataset.chart;
        loadChartData(container, chartType);
    });
}

async function loadChartData(container, chartType) {
    try {
        const response = await fetch(`/admin/api/chart-data/${chartType}`);
        if (response.ok) {
            const data = await response.json();
            renderChart(container, chartType, data);
        }
    } catch (error) {
        console.error('Chart data error:', error);
    }
}

function renderChart(container, type, data) {
    // Simple chart rendering using Chart.js (if included)
    if (typeof Chart !== 'undefined') {
        const canvas = container.querySelector('canvas') || document.createElement('canvas');
        if (!container.querySelector('canvas')) {
            container.appendChild(canvas);
        }
        
        new Chart(canvas, {
            type: type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } else {
        // Fallback to simple text display
        container.innerHTML = `<p class="text-muted">Chart data: ${JSON.stringify(data)}</p>`;
    }
}

// Form Validation and Enhancement
function initFormValidation() {
    const forms = document.querySelectorAll('form[data-admin-form]');
    
    forms.forEach(form => {
        // Add real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
        
        // Enhanced form submission
        form.addEventListener('submit', handleFormSubmit);
    });
}

function validateField(field) {
    const value = field.value.trim();
    const rules = field.dataset.validation?.split('|') || [];
    
    let isValid = true;
    let errorMessage = '';
    
    rules.forEach(rule => {
        if (rule === 'required' && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (rule.startsWith('min:')) {
            const min = parseInt(rule.split(':')[1]);
            if (value.length < min) {
                isValid = false;
                errorMessage = `Minimum ${min} characters required`;
            }
        } else if (rule === 'email' && value && !isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    });
    
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        clearFieldError(field);
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    let errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        field.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.textContent = '';
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[data-validation], textarea[data-validation], select[data-validation]');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showAlert('error', 'Please correct the errors below');
        return;
    }
    
    // Show loading state
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    submitButton.disabled = true;
    
    try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: form.method || 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showAlert('success', result.message || 'Operation completed successfully');
                if (result.redirect) {
                    setTimeout(() => window.location.href = result.redirect, 1500);
                }
            } else {
                showAlert('error', result.message || 'Operation failed');
            }
        } else {
            const error = await response.json();
            showAlert('error', error.message || 'Operation failed');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showAlert('error', 'An unexpected error occurred');
    } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Real-time Updates
function initRealTimeUpdates() {
    // Update wait times for attractions
    setInterval(updateAttractionStatus, 60000);
    
    // Update reservation counts
    setInterval(updateReservationCounts, 30000);
    
    // Check for new notifications
    setInterval(checkNewNotifications, 120000);
}

async function updateAttractionStatus() {
    try {
        const response = await fetch('/admin/api/attraction-status');
        if (response.ok) {
            const attractions = await response.json();
            updateAttractionDisplays(attractions);
        }
    } catch (error) {
        console.error('Attraction status update error:', error);
    }
}

function updateAttractionDisplays(attractions) {
    attractions.forEach(attraction => {
        const statusElements = document.querySelectorAll(`[data-attraction="${attraction._id}"] .status-badge`);
        const waitTimeElements = document.querySelectorAll(`[data-attraction="${attraction._id}"] .wait-time`);
        const queueElements = document.querySelectorAll(`[data-attraction="${attraction._id}"] .queue-length`);
        
        statusElements.forEach(element => {
            element.className = `badge bg-${getStatusBadgeClass(attraction.status)} status-badge`;
            element.textContent = attraction.status.charAt(0).toUpperCase() + attraction.status.slice(1);
        });
        
        waitTimeElements.forEach(element => {
            element.textContent = attraction.status === 'open' ? `${attraction.currentWaitTime || 0} min` : 'N/A';
        });
        
        queueElements.forEach(element => {
            element.textContent = attraction.status === 'open' ? `${attraction.currentQueueLength || 0}` : 'N/A';
        });
    });
}

async function updateReservationCounts() {
    try {
        const response = await fetch('/admin/api/reservation-counts');
        if (response.ok) {
            const counts = await response.json();
            updateCountDisplays(counts);
        }
    } catch (error) {
        console.error('Reservation count update error:', error);
    }
}

function updateCountDisplays(counts) {
    Object.keys(counts).forEach(key => {
        const elements = document.querySelectorAll(`[data-count="${key}"]`);
        elements.forEach(element => {
            element.textContent = counts[key];
        });
    });
}

// Bulk Actions
function initBulkActions() {
    const bulkActionButtons = document.querySelectorAll('.bulk-action-btn');
    
    bulkActionButtons.forEach(button => {
        button.addEventListener('click', handleBulkAction);
    });
}

function updateBulkActions() {
    const selectedRows = document.querySelectorAll('tr.table-active');
    const bulkActionsContainer = document.querySelector('.bulk-actions');
    
    if (bulkActionsContainer) {
        bulkActionsContainer.style.display = selectedRows.length > 0 ? 'block' : 'none';
        
        const countElement = bulkActionsContainer.querySelector('.selected-count');
        if (countElement) {
            countElement.textContent = selectedRows.length;
        }
    }
}

async function handleBulkAction(event) {
    const action = event.target.dataset.action;
    const selectedRows = document.querySelectorAll('tr.table-active');
    const selectedIds = Array.from(selectedRows).map(row => row.dataset.id).filter(Boolean);
    
    if (selectedIds.length === 0) {
        showAlert('warning', 'Please select items to perform this action');
        return;
    }
    
    if (!confirm(`Are you sure you want to ${action} ${selectedIds.length} item(s)?`)) {
        return;
    }
    
    try {
        const response = await fetch('/admin/api/bulk-action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: action,
                ids: selectedIds
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showAlert('success', result.message || 'Bulk action completed');
            setTimeout(() => location.reload(), 1500);
        } else {
            showAlert('error', 'Bulk action failed');
        }
    } catch (error) {
        console.error('Bulk action error:', error);
        showAlert('error', 'An unexpected error occurred');
    }
}

// Utility Functions
function getStatusBadgeClass(status) {
    const classes = {
        'open': 'success',
        'closed': 'danger',
        'maintenance': 'warning',
        'waiting': 'warning',
        'active': 'success',
        'completed': 'primary',
        'cancelled': 'danger'
    };
    return classes[status] || 'secondary';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showAlert(type, message) {
    const alertClass = type === 'error' ? 'danger' : type;
    const alertHtml = `
        <div class="alert alert-${alertClass} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const container = document.getElementById('alerts-container') || document.querySelector('.container-fluid');
    container.insertAdjacentHTML('afterbegin', alertHtml);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        const alert = container.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

// Export/Import Functions
async function exportData(type) {
    try {
        const response = await fetch(`/admin/api/export/${type}`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showAlert('success', 'Export completed successfully');
        } else {
            showAlert('error', 'Export failed');
        }
    } catch (error) {
        console.error('Export error:', error);
        showAlert('error', 'Export failed');
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + S to save forms
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        const form = document.querySelector('form[data-admin-form]');
        if (form) {
            form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
    }
    
    // Escape to cancel/close modals
    if (event.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        });
    }
});

// Initialize tooltips and popovers
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize Bootstrap popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
});

// Update reservation status with better error handling
async function updateReservationStatus(reservationId, newStatus) {
    if (!confirm(`Are you sure you want to mark this reservation as ${newStatus}?`)) {
        return;
    }

    try {
        showLoadingState(true);
        
        const response = await fetch(`/admin/reservations/${reservationId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showAlert('success', result.message || 'Reservation status updated successfully');
            setTimeout(() => location.reload(), 1500);
        } else {
            showAlert('error', result.error || 'Failed to update reservation status');
        }
    } catch (error) {
        console.error('Error updating reservation status:', error);
        showAlert('error', 'An unexpected error occurred while updating the reservation');
    } finally {
        showLoadingState(false);
    }
}

// Show loading state for actions
function showLoadingState(show) {
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.disabled = show;
        if (show) {
            btn.style.opacity = '0.6';
        } else {
            btn.style.opacity = '1';
        }
    });
}

// Enhanced attraction deletion
async function deleteAttractionWithConfirmation(attractionId, attractionName) {
    if (!confirm(`Are you sure you want to delete "${attractionName}"?\n\nThis action cannot be undone and will also delete all associated reservations.`)) {
        return;
    }

    try {
        showLoadingState(true);
        
        const response = await fetch(`/admin/attractions/${attractionId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            showAlert('success', 'Attraction deleted successfully');
            setTimeout(() => location.reload(), 1500);
        } else {
            const result = await response.json();
            showAlert('error', result.error || 'Failed to delete attraction');
        }
    } catch (error) {
        console.error('Error deleting attraction:', error);
        showAlert('error', 'An unexpected error occurred while deleting the attraction');
    } finally {
        showLoadingState(false);
    }
}

// Auto-refresh for real-time data
function initAutoRefresh() {
    if (window.location.pathname.includes('/admin/reservations')) {
        setInterval(() => {
            // Only refresh if no modals are open
            if (!document.querySelector('.modal.show')) {
                updateReservationCounts();
            }
        }, 30000); // Every 30 seconds
    }
}
