const API_URL = 'http://localhost:5000/api';

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Authentication token is missing');
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Function to handle API requests
async function fetchWithAuth(endpoint, options = {}) {
    try {
        if (!localStorage.getItem('token')) {
            throw new Error('Authentication token is missing');
        }

        // Remove any trailing slashes from the endpoint
        const cleanEndpoint = endpoint.replace(/\/+$/, '');
        
        const response = await fetch(`${API_URL}${cleanEndpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login.html';
                throw new Error('Session expired. Please login again.');
            }
            const errorData = await response.json().catch(() => ({
                message: `HTTP error! status: ${response.status}`
            }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        if (error.message.includes('token')) {
            // Token related errors should redirect to login
            window.location.href = '/login.html';
        }
        throw error;
    }
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
        showLoading();
        const user = JSON.parse(localStorage.getItem('user'));
        const [appointments, patients] = await Promise.all([
            fetchWithAuth('/appointments'),
            fetchWithAuth('/patients')
        ]);
        
        // Calculate statistics
        const totalPatients = patients.length;
        const totalAppointments = appointments.length;
        
        // Calculate today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];
            return aptDate === today;
        });

        // Update UI with the fetched data
        $('#total-patients').text(totalPatients);
        $('#total-appointments').text(totalAppointments);
        $('#today-appointments').text(todayAppointments.length);
        
        hideLoading();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data: ' + error.message);
        hideLoading();
    }
}

// Load patients
async function loadPatients() {
    if (!checkAuth()) return;
    try {
        showLoading();
        const patients = await fetchWithAuth('/patients');
        displayPatients(patients);
        hideLoading();
    } catch (error) {
        console.error('Error loading patients:', error);
        showError('Failed to load patients: ' + error.message);
        hideLoading();
    }
}

// Show Add Patient Modal
function showAddPatientModal() {
    $('#addPatientModal').modal('show');
}

// Add new patient
async function handleAddPatient(event) {
    event.preventDefault();
    showLoading();

    try {
        const formData = {
            name: document.getElementById('name').value,
            contact_info: document.getElementById('email').value,
            age: parseInt(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            medical_history: document.getElementById('medical_history').value,
            current_conditions: document.getElementById('current_conditions').value,
            medications: document.getElementById('medications').value,
            allergies: document.getElementById('allergies').value,
            doctor_notes: "",
            recent_test_results: {},
            last_visit_date: new Date().toISOString(),
            hospital_id: 1
        };

        await fetchWithAuth('/api/patients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        hideLoading();
        showAlert('Patient added successfully!', 'success');
        $('#addPatientModal').modal('hide');
        document.getElementById('addPatientForm').reset();
        loadPatients();
    } catch (error) {
        hideLoading();
        showAlert('Error adding patient: ' + error.message, 'error');
    }
}

// Update patient
async function updatePatient(patientId, patientData) {
    if (!checkAuth()) return;
    try {
        showLoading();
        await fetchWithAuth(`/patients/${patientId}/`, {
            method: 'PUT',
            body: JSON.stringify(patientData)
        });
        showSuccess('Patient updated successfully');
        await loadPatients(); // Reload the patients list
        hideLoading();
    } catch (error) {
        console.error('Error updating patient:', error);
        showError(error.message || 'Failed to update patient. Please try again.');
        hideLoading();
    }
}

// Delete patient
async function deletePatient(patientId) {
    if (!checkAuth()) return;
    if (confirm('Are you sure you want to delete this patient?')) {
        try {
            showLoading();
            await fetchWithAuth(`/patients/${patientId}`, {
                method: 'DELETE'
            });
            showSuccess('Patient deleted successfully');
            await loadPatients();
            hideLoading();
        } catch (error) {
            hideLoading();
            showError('Failed to delete patient: ' + error.message);
        }
    }
}

// Appointments Functions
async function loadAppointments() {
    if (!checkAuth()) return;
    try {
        showLoading();
        const user = JSON.parse(localStorage.getItem('user'));
        const [appointments, patients] = await Promise.all([
            fetchWithAuth(`/appointments`),
            fetchWithAuth('/patients')
        ]);
        
        const tbody = $('#appointments-table-body');
        tbody.empty();
        
        if (!appointments || appointments.length === 0) {
            tbody.append(`
                <tr>
                    <td colspan="6" class="text-center">No appointments found</td>
                </tr>
            `);
            hideLoading();
            return;
        }
        
        appointments.forEach(appointment => {
            const patient = patients.find(p => p._id === appointment.patient_id);
            const appointmentDate = new Date(appointment.appointment_date);
            tbody.append(`
                <tr>
                    <td>${patient ? patient.name : 'Unknown'}</td>
                    <td>${appointmentDate.toLocaleDateString()}</td>
                    <td>${appointmentDate.toLocaleTimeString()}</td>
                    <td>${appointment.notes || '-'}</td>
                    <td>${appointment.status}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="editAppointment('${appointment._id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAppointment('${appointment._id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="updateAppointmentStatus('${appointment._id}', 'Completed')" title="Mark as Completed">
                            <i class="fas fa-check"></i>
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
        
        hideLoading();
    } catch (error) {
        console.error('Error loading appointments:', error);
        showError('Failed to load appointments: ' + error.message);
        hideLoading();
    }
}

// Show Add Appointment Modal
function showAddAppointmentModal(patientId = null) {
    $('#addAppointmentModal').modal('show');
    if (patientId) {
        $('#appointment-patient').val(patientId);
    }
}

async function addAppointment(event) {
    event.preventDefault();
    if (!checkAuth()) return;
    
    try {
        showLoading();
        const user = JSON.parse(localStorage.getItem('user'));
        const appointmentDateTime = new Date(
            document.getElementById('appointment-date').value + 'T' + 
            document.getElementById('appointment-time').value
        );

        const formData = {
            patient_id: document.getElementById('appointment-patient').value,
            doctor_id: user._id,
            appointment_date: appointmentDateTime.toISOString(),
            status: 'Scheduled',
            notes: document.getElementById('appointment-notes').value
        };

        const response = await fetchWithAuth('/appointments/', {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        hideLoading();
        showAlert('Appointment added successfully!', 'success');
        $('#addAppointmentModal').modal('hide');
        document.getElementById('addAppointmentForm').reset();
        loadAppointments();
    } catch (error) {
        hideLoading();
        showAlert('Error adding appointment: ' + error.message, 'error');
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

async function updateAppointmentStatus(appointmentId, status) {
    if (!checkAuth()) return;
    try {
        showLoading();
        await fetchWithAuth(`/appointments/${appointmentId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        
        hideLoading();
        showAlert('Appointment status updated successfully', 'success');
        loadAppointments();
    } catch (error) {
        hideLoading();
        showAlert('Error updating appointment status: ' + error.message, 'error');
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

// UI Helper functions
function showLoading() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'block';
}

function hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 5000);
    }
}

// Initialize Dashboard
$(document).ready(function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user) {
        window.location.href = '/login.html';
        return;
    }
    
    // Load user info
    $('#user-name').text(user.username || 'User');
    $('#user-role').text(user.role || 'Role');
    
    // Show dashboard by default
    showDashboard();
});

// Display patients in the table
function displayPatients(patients) {
    const tableBody = document.getElementById('patients-table-body');
    if (!patients || patients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">No patients found</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = patients.map(patient => `
        <tr>
            <td>${patient.name || '-'}</td>
            <td>${patient.contact_info || '-'}</td>
            <td>${patient.age || '-'}</td>
            <td>${patient.gender || '-'}</td>
            <td>${patient.medical_history || '-'}</td>
            <td>
                <strong>Current:</strong> ${patient.current_conditions || '-'}<br>
                <strong>Medications:</strong> ${patient.medications || '-'}<br>
                <strong>Allergies:</strong> ${patient.allergies || '-'}
            </td>
            <td>${patient.doctor_notes || '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="editPatient(this)" data-patient='${JSON.stringify(patient)}' title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePatient('${patient._id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="showAddAppointmentModal('${patient._id}')" title="Add Appointment">
                    <i class="fas fa-calendar-plus"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Edit patient handler
function editPatient(button) {
    const patient = JSON.parse(button.getAttribute('data-patient'));
    document.getElementById('edit-patient-id').value = patient._id;
    document.getElementById('edit-patient-name').value = patient.name || '';
    document.getElementById('edit-patient-email').value = patient.contact_info || '';
    document.getElementById('edit-patient-age').value = patient.age || '';
    document.getElementById('edit-patient-gender').value = patient.gender || '';
    document.getElementById('edit-patient-medical-history').value = patient.medical_history || '';
    document.getElementById('edit-patient-conditions').value = patient.current_conditions || '';
    document.getElementById('edit-patient-medications').value = patient.medications || '';
    document.getElementById('edit-patient-allergies').value = patient.allergies || '';
    $('#editPatientModal').modal('show');
}

// Handle edit patient form submission
async function handleEditPatient(event) {
    event.preventDefault();
    showLoading();

    try {
        const patientId = document.getElementById('edit-patient-id').value;
        const formData = {
            name: document.getElementById('edit-patient-name').value,
            contact_info: document.getElementById('edit-patient-email').value,
            age: parseInt(document.getElementById('edit-patient-age').value),
            gender: document.getElementById('edit-patient-gender').value,
            medical_history: document.getElementById('edit-patient-medical-history').value,
            current_conditions: document.getElementById('edit-patient-conditions').value,
            medications: document.getElementById('edit-patient-medications').value,
            allergies: document.getElementById('edit-patient-allergies').value,
            last_visit_date: new Date().toISOString()
        };

        await fetchWithAuth(`/api/patients/${patientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        hideLoading();
        showAlert('Patient updated successfully!', 'success');
        $('#editPatientModal').modal('hide');
        loadPatients();
    } catch (error) {
        hideLoading();
        showAlert('Error updating patient: ' + error.message, 'error');
    }
}

function editAppointment(appointmentId) {
    if (!checkAuth()) return;
    
    // Find the appointment in the table
    const appointmentRow = $(`button[onclick="editAppointment('${appointmentId}')"]`).closest('tr');
    const patientName = appointmentRow.find('td').eq(0).text();
    const dateTime = new Date(appointmentRow.find('td').eq(1).text() + ' ' + appointmentRow.find('td').eq(2).text());
    const notes = appointmentRow.find('td').eq(3).text();
    const status = appointmentRow.find('td').eq(4).text();

    // Set the values in the edit form
    $('#edit-appointment-id').val(appointmentId);
    $('#edit-appointment-date').val(dateTime.toISOString().split('T')[0]);
    $('#edit-appointment-time').val(dateTime.toTimeString().split(' ')[0].slice(0, 5));
    $('#edit-appointment-notes').val(notes === '-' ? '' : notes);
    $('#edit-appointment-status').val(status);

    // Find and select the patient in the dropdown
    const patientSelect = $('#edit-appointment-patient');
    const patientOption = patientSelect.find(`option:contains("${patientName}")`);
    if (patientOption.length) {
        patientOption.prop('selected', true);
    }

    $('#editAppointmentModal').modal('show');
}

async function handleEditAppointment(event) {
    event.preventDefault();
    if (!checkAuth()) return;
    
    try {
        showLoading();
        const appointmentId = document.getElementById('edit-appointment-id').value;
        const appointmentDateTime = new Date(
            document.getElementById('edit-appointment-date').value + 'T' + 
            document.getElementById('edit-appointment-time').value
        );

        const formData = {
            patient_id: document.getElementById('edit-appointment-patient').value,
            appointment_date: appointmentDateTime.toISOString(),
            status: document.getElementById('edit-appointment-status').value,
            notes: document.getElementById('edit-appointment-notes').value
        };

        await fetchWithAuth(`/appointments/${appointmentId}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });

        hideLoading();
        showAlert('Appointment updated successfully!', 'success');
        $('#editAppointmentModal').modal('hide');
        loadAppointments();
    } catch (error) {
        hideLoading();
        showAlert('Error updating appointment: ' + error.message, 'error');
    }
} 