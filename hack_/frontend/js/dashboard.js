const API_URL = 'http://localhost:5000/api';

// Get auth token
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Show/Hide Sections
function showDashboard() {
    if (!checkAuth()) return;
    $('#dashboard-section').show();
    $('#patients-section').hide();
    $('#appointments-section').hide();
    loadDashboardData();
}

function showPatients() {
    if (!checkAuth()) return;
    $('#dashboard-section').hide();
    $('#patients-section').show();
    $('#appointments-section').hide();
    loadPatients();
}

function showAppointments() {
    if (!checkAuth()) return;
    $('#dashboard-section').hide();
    $('#patients-section').hide();
    $('#appointments-section').show();
    loadAppointments();
}

// Load Dashboard Data
async function loadDashboardData() {
    if (!checkAuth()) return;
    try {
        const headers = getAuthHeaders();
        const [patients, appointments] = await Promise.all([
            fetch(`${API_URL}/patients`, { headers }).then(res => res.json()),
            fetch(`${API_URL}/appointments`, { headers }).then(res => res.json())
        ]);

        $('#total-patients').text(patients.length);
        $('#total-appointments').text(appointments.length);

        // Calculate today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = appointments.filter(apt => apt.date === today);
        $('#today-appointments').text(todayAppointments.length);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('Error loading dashboard data', 'danger');
    }
}

// Patients Functions
async function loadPatients() {
    if (!checkAuth()) return;
    try {
        const response = await fetch(`${API_URL}/patients`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to load patients');
        }
        
        const patients = await response.json();
        const tbody = $('#patients-table-body');
        tbody.empty();
        
        patients.forEach(patient => {
            tbody.append(`
                <tr>
                    <td>${patient.name}</td>
                    <td>${patient.age}</td>
                    <td>${patient.gender}</td>
                    <td>${patient.contact}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="editPatient('${patient._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deletePatient('${patient._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    } catch (error) {
        console.error('Error loading patients:', error);
        showAlert('Error loading patients', 'danger');
    }
}

// Show Add Patient Modal
function showAddPatientModal() {
    $('#addPatientModal').modal('show');
}

// Show Add Appointment Modal
function showAddAppointmentModal() {
    $('#addAppointmentModal').modal('show');
}

async function addPatient() {
    if (!checkAuth()) return;
    const form = document.getElementById('addPatientForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_URL}/patients`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            $('#addPatientModal').modal('hide');
            form.reset();
            loadPatients();
            showAlert('Patient added successfully', 'success');
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error adding patient', 'danger');
        }
    } catch (error) {
        console.error('Error adding patient:', error);
        showAlert('Error adding patient', 'danger');
    }
}

async function deletePatient(patientId) {
    if (!checkAuth()) return;
    if (confirm('Are you sure you want to delete this patient?')) {
        try {
            const response = await fetch(`${API_URL}/patients/${patientId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (response.ok) {
                loadPatients();
                showAlert('Patient deleted successfully', 'success');
            } else {
                const error = await response.json();
                showAlert(error.message || 'Error deleting patient', 'danger');
            }
        } catch (error) {
            console.error('Error deleting patient:', error);
            showAlert('Error deleting patient', 'danger');
        }
    }
}

// Appointments Functions
async function loadAppointments() {
    if (!checkAuth()) return;
    try {
        const headers = getAuthHeaders();
        const [appointments, patients] = await Promise.all([
            fetch(`${API_URL}/appointments`, { headers }).then(res => res.json()),
            fetch(`${API_URL}/patients`, { headers }).then(res => res.json())
        ]);
        
        const tbody = $('#appointments-table-body');
        tbody.empty();
        
        appointments.forEach(appointment => {
            const patient = patients.find(p => p._id === appointment.patient_id);
            tbody.append(`
                <tr>
                    <td>${patient ? patient.name : 'Unknown'}</td>
                    <td>${appointment.date}</td>
                    <td>${appointment.time}</td>
                    <td>${appointment.reason}</td>
                    <td>${appointment.status}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="editAppointment('${appointment._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAppointment('${appointment._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });

        // Update patient select in add appointment modal
        const patientSelect = $('#appointment-patient');
        patientSelect.empty();
        patientSelect.append('<option value="">Select Patient</option>');
        patients.forEach(patient => {
            patientSelect.append(`<option value="${patient._id}">${patient.name}</option>`);
        });
    } catch (error) {
        console.error('Error loading appointments:', error);
        showAlert('Error loading appointments', 'danger');
    }
}

async function addAppointment() {
    if (!checkAuth()) return;
    const form = document.getElementById('addAppointmentForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            $('#addAppointmentModal').modal('hide');
            form.reset();
            loadAppointments();
            showAlert('Appointment added successfully', 'success');
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error adding appointment', 'danger');
        }
    } catch (error) {
        console.error('Error adding appointment:', error);
        showAlert('Error adding appointment', 'danger');
    }
}

async function deleteAppointment(appointmentId) {
    if (!checkAuth()) return;
    if (confirm('Are you sure you want to delete this appointment?')) {
        try {
            const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (response.ok) {
                loadAppointments();
                showAlert('Appointment deleted successfully', 'success');
            } else {
                const error = await response.json();
                showAlert(error.message || 'Error deleting appointment', 'danger');
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
            showAlert('Error deleting appointment', 'danger');
        }
    }
}

// Utility Functions
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector('.main-content').prepend(alertDiv);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Logout Function
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Initialize Dashboard
$(document).ready(function() {
    if (!checkAuth()) return;
    
    // Load user info
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    $('#user-name').text(user.username || 'User');
    $('#user-role').text(user.role || 'Role');
    
    // Show dashboard by default
    showDashboard();
}); 