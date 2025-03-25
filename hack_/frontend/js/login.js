const API_URL = 'http://localhost:5000/api';

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        if (!data.token) {
            throw new Error('No authentication token received');
        }

        // Store token
        localStorage.setItem('token', data.token);

        // Check if we have user data
        if (data.user && typeof data.user === 'object') {
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on role if it exists
            if (data.user.role) {
                if (data.user.role === 'admin') {
                    window.location.href = '/admin_dashboard.html';
                } else if (data.user.role === 'doctor') {
                    window.location.href = '/doctor_dashboard.html';
                } else {
                    throw new Error('Invalid user role');
                }
            } else {
                throw new Error('User role not specified');
            }
        } else if (data.role) {
            // If role is directly in the response data
            const userData = {
                username: username,
                role: data.role
            };
            localStorage.setItem('user', JSON.stringify(userData));
            
            if (data.role === 'admin') {
                window.location.href = '/admin_dashboard.html';
            } else if (data.role === 'doctor') {
                window.location.href = '/doctor_dashboard.html';
            } else {
                throw new Error('Invalid user role');
            }
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'Login failed. Please try again.');
    }
}

function showError(message) {
    let errorDiv = document.getElementById('error-message');
    if (!errorDiv) {
        // Create error div if it doesn't exist
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.className = 'alert alert-danger';
        const form = document.querySelector('form');
        form.insertBefore(errorDiv, form.firstChild);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Add event listener to form
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }
}); 