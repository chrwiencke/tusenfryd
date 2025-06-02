// Main JavaScript file for Tusenfryd visitor interface

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initReservationSystem();
    initAttractionFilters();
    initWaitTimeUpdater();
    initNotifications();
    initModals();
});

// Reservation System Management
function initReservationSystem() {
    const reservationForms = document.querySelectorAll('.reservation-form');
    const checkReservationForm = document.getElementById('check-reservation-form');
    
    // Handle reservation form submissions
    reservationForms.forEach(form => {
        form.addEventListener('submit', handleReservationSubmit);
    });
    
    // Handle reservation status checks
    if (checkReservationForm) {
        checkReservationForm.addEventListener('submit', handleReservationCheck);
    }
    
    // Auto-refresh reservation status if on status page
    if (window.location.pathname.includes('/reservation/status')) {
        setInterval(refreshReservationStatus, 30000); // 30 seconds
    }
}

async function handleReservationSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Show loading state
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
    submitButton.disabled = true;
    
    try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                // Redirect to success page
                window.location.href = `/reservation/success?id=${result.reservationId}`;
            } else {
                showAlert('error', result.message || 'Failed to create reservation');
            }
        } else {
            const error = await response.json();
            showAlert('error', error.message || 'Failed to create reservation');
        }
    } catch (error) {
        console.error('Reservation error:', error);
        showAlert('error', 'An unexpected error occurred. Please try again.');
    } finally {
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

async function handleReservationCheck(event) {
    event.preventDefault();
    const form = event.target;
    const reservationId = form.querySelector('input[name="reservationId"]').value.trim();
    
    if (!reservationId) {
        showAlert('warning', 'Please enter a reservation ID');
        return;
    }
    
    try {
        const response = await fetch(`/api/reservation/${reservationId}`);
        
        if (response.ok) {
            const reservation = await response.json();
            displayReservationStatus(reservation);
        } else if (response.status === 404) {
            showAlert('error', 'Reservation not found. Please check your ID.');
        } else {
            showAlert('error', 'Failed to check reservation status');
        }
    } catch (error) {
        console.error('Check reservation error:', error);
        showAlert('error', 'An unexpected error occurred. Please try again.');
    }
}

function displayReservationStatus(reservation) {
    const statusContainer = document.getElementById('reservation-status');
    if (!statusContainer) return;
    
    const statusHtml = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Reservation #${reservation.reservationId}</h5>
                <span class="badge bg-${getStatusBadgeClass(reservation.status)} fs-6">
                    ${reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                </span>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h6>Visitor Information</h6>
                        <p><strong>Name:</strong> ${reservation.visitorName}</p>
                        <p><strong>Party Size:</strong> ${reservation.partySize} people</p>
                        <p><strong>Reserved:</strong> ${new Date(reservation.createdAt).toLocaleString()}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Attraction</h6>
                        <p><strong>Name:</strong> ${reservation.attraction.name}</p>
                        <p><strong>Category:</strong> ${reservation.attraction.category}</p>
                        ${reservation.status === 'waiting' ? `
                            <p><strong>Position:</strong> #${reservation.position} in queue</p>
                            <p><strong>Est. Wait:</strong> ~${reservation.estimatedWaitTime} minutes</p>
                        ` : ''}
                    </div>
                </div>
                ${getStatusActions(reservation)}
            </div>
        </div>
    `;
    
    statusContainer.innerHTML = statusHtml;
}

function getStatusBadgeClass(status) {
    const classes = {
        'waiting': 'warning',
        'active': 'success',
        'completed': 'primary',
        'cancelled': 'danger'
    };
    return classes[status] || 'secondary';
}

function getStatusActions(reservation) {
    if (reservation.status === 'waiting' || reservation.status === 'active') {
        return `
            <div class="mt-3 text-center">
                <button class="btn btn-outline-danger" onclick="cancelReservation('${reservation.reservationId}')">
                    Cancel Reservation
                </button>
            </div>
        `;
    }
    return '';
}

async function cancelReservation(reservationId) {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/reservation/${reservationId}/cancel`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            showAlert('success', 'Reservation cancelled successfully');
            setTimeout(() => location.reload(), 2000);
        } else {
            showAlert('error', 'Failed to cancel reservation');
        }
    } catch (error) {
        console.error('Cancel reservation error:', error);
        showAlert('error', 'An unexpected error occurred');
    }
}

async function refreshReservationStatus() {
    const reservationIdElement = document.querySelector('[data-reservation-id]');
    if (!reservationIdElement) return;
    
    const reservationId = reservationIdElement.dataset.reservationId;
    
    try {
        const response = await fetch(`/api/reservation/${reservationId}`);
        
        if (response.ok) {
            const reservation = await response.json();
            updateReservationDisplay(reservation);
        }
    } catch (error) {
        console.error('Refresh status error:', error);
    }
}

function updateReservationDisplay(reservation) {
    // Update status badge
    const statusBadge = document.querySelector('.status-badge');
    if (statusBadge) {
        statusBadge.className = `badge bg-${getStatusBadgeClass(reservation.status)} status-badge`;
        statusBadge.textContent = reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1);
    }
    
    // Update position if waiting
    const positionElement = document.querySelector('.queue-position');
    if (positionElement && reservation.status === 'waiting') {
        positionElement.textContent = `#${reservation.position}`;
    }
    
    // Update wait time
    const waitTimeElement = document.querySelector('.wait-time');
    if (waitTimeElement && reservation.status === 'waiting') {
        waitTimeElement.textContent = `~${reservation.estimatedWaitTime} minutes`;
    }
}

// Attraction Filtering System
function initAttractionFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('attraction-search');
    const sortSelect = document.getElementById('sort-attractions');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilterClick);
    });
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
}

function handleFilterClick(event) {
    const button = event.target;
    const filter = button.dataset.filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Filter attractions
    filterAttractions(filter);
}

function filterAttractions(filter) {
    const attractionCards = document.querySelectorAll('.attraction-card');
    
    attractionCards.forEach(card => {
        const shouldShow = filter === 'all' || card.dataset.type === filter || card.dataset.status === filter;
        card.style.display = shouldShow ? 'block' : 'none';
    });
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const attractionCards = document.querySelectorAll('.attraction-card');
    
    attractionCards.forEach(card => {
        const attractionName = card.dataset.name?.toLowerCase() || '';
        const attractionCategory = card.dataset.category?.toLowerCase() || '';
        const shouldShow = attractionName.includes(searchTerm) || attractionCategory.includes(searchTerm);
        card.style.display = shouldShow ? 'block' : 'none';
    });
}

function handleSort(event) {
    const sortBy = event.target.value;
    const container = document.querySelector('.attractions-container');
    const cards = Array.from(container.querySelectorAll('.attraction-card'));
    
    cards.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.dataset.name.localeCompare(b.dataset.name);
            case 'wait-time':
                return parseInt(a.dataset.waitTime || 0) - parseInt(b.dataset.waitTime || 0);
            case 'thrill-level':
                const thrillOrder = { 'low': 1, 'medium': 2, 'high': 3, 'extreme': 4 };
                return (thrillOrder[a.dataset.thrillLevel] || 0) - (thrillOrder[b.dataset.thrillLevel] || 0);
            default:
                return 0;
        }
    });
    
    // Re-append sorted cards
    cards.forEach(card => container.appendChild(card));
}

// Wait Time Updates
function initWaitTimeUpdater() {
    if (document.querySelector('.wait-time-display')) {
        setInterval(updateWaitTimes, 60000); // Update every minute
    }
}

async function updateWaitTimes() {
    try {
        const response = await fetch('/api/attractions/wait-times');
        
        if (response.ok) {
            const waitTimes = await response.json();
            updateWaitTimeDisplays(waitTimes);
        }
    } catch (error) {
        console.error('Wait time update error:', error);
    }
}

function updateWaitTimeDisplays(waitTimes) {
    waitTimes.forEach(attraction => {
        const waitTimeElements = document.querySelectorAll(`[data-attraction-id="${attraction._id}"] .wait-time-display`);
        waitTimeElements.forEach(element => {
            if (attraction.status === 'open') {
                element.textContent = `${attraction.currentWaitTime || 0} min`;
                element.className = 'wait-time-display badge bg-primary';
            } else {
                element.textContent = attraction.status;
                element.className = `wait-time-display badge bg-${attraction.status === 'closed' ? 'danger' : 'warning'}`;
            }
        });
    });
}

// Notification System
function initNotifications() {
    loadNotifications();
    setInterval(loadNotifications, 300000); // Check every 5 minutes
}

async function loadNotifications() {
    try {
        const response = await fetch('/api/notifications');
        
        if (response.ok) {
            const notifications = await response.json();
            displayNotifications(notifications);
        }
    } catch (error) {
        console.error('Notification load error:', error);
    }
}

function displayNotifications(notifications) {
    const container = document.getElementById('notifications-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    notifications.forEach(notification => {
        const alertClass = getNotificationAlertClass(notification.type);
        const html = `
            <div class="alert alert-${alertClass} alert-dismissible fade show" role="alert">
                <strong>${notification.title}</strong>
                <p class="mb-0">${notification.message}</p>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function getNotificationAlertClass(type) {
    const classes = {
        'info': 'primary',
        'warning': 'warning',
        'success': 'success',
        'error': 'danger'
    };
    return classes[type] || 'info';
}

// Modal Management
function initModals() {
    // Auto-focus on modal inputs
    document.addEventListener('shown.bs.modal', function(event) {
        const modal = event.target;
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            firstInput.focus();
        }
    });
}

// Utility Functions
function showAlert(type, message) {
    const alertClass = getNotificationAlertClass(type);
    const alertHtml = `
        <div class="alert alert-${alertClass} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const container = document.getElementById('alerts-container') || document.body;
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

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Form Validation Enhancement
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form[data-validate="true"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
});

// Accessibility Enhancements
document.addEventListener('keydown', function(event) {
    // Escape key closes modals
    if (event.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        });
    }
});

// Service Worker Registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed');
            });
    });
}
