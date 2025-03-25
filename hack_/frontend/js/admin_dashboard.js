const API_URL = 'http://localhost:5000/api';

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user || user.role !== 'admin') {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Show/Hide Loading
function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Show Error Message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Show Alert
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector('.main-content').prepend(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Show/Hide Sections
function showDashboard() {
    if (!checkAuth()) return;
    $('#dashboard-section').show();
    $('#doctors-section').hide();
    $('#patients-section').hide();
    $('#appointments-section').hide();
    loadDashboardData();
}

function showDoctors() {
    if (!checkAuth()) return;
    $('#dashboard-section').hide();
    $('#doctors-section').show();
    $('#patients-section').hide();
    $('#appointments-section').hide();
    loadDoctors();
}

function showPatients() {
    if (!checkAuth()) return;
    $('#dashboard-section').hide();
    $('#doctors-section').hide();
    $('#patients-section').show();
    $('#appointments-section').hide();
    loadPatients();
}

function showAppointments() {
    if (!checkAuth()) return;
    $('#dashboard-section').hide();
    $('#doctors-section').hide();
    $('#patients-section').hide();
    $('#appointments-section').show();
    loadAppointments();
}

// Load Dashboard Data
async function loadDashboardData() {
    if (!checkAuth()) return;
    showLoading();
    try {
        const headers = getAuthHeaders();
        const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
            fetch(`${API_URL}/user/doctors`, { headers }),
            fetch(`${API_URL}/patients`, { headers }),
            fetch(`${API_URL}/appointments`, { headers })
        ]);

        if (!doctorsRes.ok) throw new Error('Failed to load doctors data');
        if (!patientsRes.ok) throw new Error('Failed to load patients data');
        if (!appointmentsRes.ok) throw new Error('Failed to load appointments data');

        const [doctors, patients, appointments] = await Promise.all([
            doctorsRes.json(),
            patientsRes.json(),
            appointmentsRes.json()
        ]);

        $('#total-doctors').text(doctors.length);
        $('#total-patients').text(patients.length);
        $('#total-appointments').text(appointments.length);

        // Calculate today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = appointments.filter(apt => apt.date === today);
        $('#today-appointments').text(todayAppointments.length);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Error loading dashboard data');
    } finally {
        hideLoading();
    }
}

// Doctors Functions
async function loadDoctors() {
    if (!checkAuth()) return;
    showLoading();
    try {
        const response = await fetch(`${API_URL}/user/doctors`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to load doctors');
        }
        
        const doctors = await response.json();
        const tbody = $('#doctors-table-body');
        tbody.empty();
        
        doctors.forEach(doctor => {
            tbody.append(`
                <tr>
                    <td>${doctor.username}</td>
                    <td>${doctor.email}</td>
                    <td>${new Date(doctor.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="editDoctor('${doctor._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteDoctor('${doctor._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    } catch (error) {
        console.error('Error loading doctors:', error);
        showError('Error loading doctors');
    } finally {
        hideLoading();
    }
}

// Show Add Doctor Modal
function showAddDoctorModal() {
    $('#addDoctorModal').modal('show');
}

async function addDoctor() {
    if (!checkAuth()) return;
    const form = document.getElementById('addDoctorForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.role = 'doctor';
    
    try {
        const response = await fetch(`${API_URL}/user/register`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            $('#addDoctorModal').modal('hide');
            form.reset();
            loadDoctors();
            showAlert('Doctor added successfully', 'success');
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error adding doctor', 'danger');
        }
    } catch (error) {
        console.error('Error adding doctor:', error);
        showAlert('Error adding doctor', 'danger');
    }
}

async function deleteDoctor(doctorId) {
    if (!checkAuth()) return;
    if (confirm('Are you sure you want to delete this doctor?')) {
        try {
            const response = await fetch(`${API_URL}/user/doctors/${doctorId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (response.ok) {
                loadDoctors();
                showAlert('Doctor deleted successfully', 'success');
            } else {
                const error = await response.json();
                showAlert(error.message || 'Error deleting doctor', 'danger');
            }
        } catch (error) {
            console.error('Error deleting doctor:', error);
            showAlert('Error deleting doctor', 'danger');
        }
    }
}

// Patients Functions
async function loadPatients() {
    if (!checkAuth()) return;
    showLoading();
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
        showError('Error loading patients');
    } finally {
        hideLoading();
    }
}

// Show Add Patient Modal
function showAddPatientModal() {
    $('#addPatientModal').modal('show');
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
    showLoading();
    try {
        const headers = getAuthHeaders();
        const [appointmentsRes, doctorsRes, patientsRes] = await Promise.all([
            fetch(`${API_URL}/appointments`, { headers }),
            fetch(`${API_URL}/user/doctors`, { headers }),
            fetch(`${API_URL}/patients`, { headers })
        ]);

        if (!appointmentsRes.ok) throw new Error('Failed to load appointments');
        if (!doctorsRes.ok) throw new Error('Failed to load doctors');
        if (!patientsRes.ok) throw new Error('Failed to load patients');

        const [appointments, doctors, patients] = await Promise.all([
            appointmentsRes.json(),
            doctorsRes.json(),
            patientsRes.json()
        ]);

        const tbody = $('#appointments-table-body');
        tbody.empty();
        
        appointments.forEach(appointment => {
            const patient = patients.find(p => p._id === appointment.patient_id);
            const doctor = doctors.find(d => d._id === appointment.doctor_id);
            
            tbody.append(`
                <tr>
                    <td>${patient ? patient.name : 'Unknown'}</td>
                    <td>${doctor ? doctor.username : 'Unknown'}</td>
                    <td>${appointment.date}</td>
                    <td>${appointment.time}</td>
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

        // Update patient and doctor selects in add appointment modal
        const patientSelect = $('#appointment-patient');
        const doctorSelect = $('#appointment-doctor');
        
        patientSelect.empty().append('<option value="">Select Patient</option>');
        doctorSelect.empty().append('<option value="">Select Doctor</option>');
        
        patients.forEach(patient => {
            patientSelect.append(`<option value="${patient._id}">${patient.name}</option>`);
        });
        
        doctors.forEach(doctor => {
            doctorSelect.append(`<option value="${doctor._id}">${doctor.username}</option>`);
        });
    } catch (error) {
        console.error('Error loading appointments:', error);
        showError('Error loading appointments');
    } finally {
        hideLoading();
    }
}

// Show Add Appointment Modal
function showAddAppointmentModal() {
    $('#addAppointmentModal').modal('show');
}

async function addAppointment() {
    if (!checkAuth()) return;
    const form = document.getElementById('addAppointmentForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.status = 'scheduled';
    
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