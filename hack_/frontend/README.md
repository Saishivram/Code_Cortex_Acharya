# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)



# Doctor Assistant Application

A comprehensive web-based healthcare management system designed for doctors to efficiently manage their patients and appointments.

![Dashboard Preview](docs/images/dashboard.png)

## Features

- **Secure Authentication System**
  - Role-based access control (Doctor/Admin)
  - Token-based authentication
  - Secure password handling

- **Patient Management**
  - Add and manage patient records
  - Track medical history
  - Monitor current conditions and medications
  - Record allergies and doctor notes
  - View patient history

  ![Patient Management](docs/images/patients.png)

- **Appointment System**
  - Schedule new appointments
  - Track appointment status
  - View daily/total appointments
  - Manage appointment notes
  - Quick appointment scheduling from patient records

  ![Appointments](docs/images/appointments.png)

- **Dashboard Analytics**
  - Total patients overview
  - Today's appointments
  - Total appointments tracking
  - Quick access to key metrics

## Technology Stack

- **Frontend**
  - HTML5
  - CSS3 (Bootstrap 5.1.3)
  - JavaScript (jQuery 3.6.0)
  - Font Awesome 5.15.4

- **Backend**
  - Python (Flask)
  - MongoDB
  - JWT Authentication

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/doctor-assistant.git
   cd doctor-assistant
   ```

2. **Set Up Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configure MongoDB**
   - Install MongoDB
   - Start MongoDB service
   ```bash
   mongod
   ```

4. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/doctor_assistant
   JWT_SECRET_KEY=your_secret_key
   ```

5. **Start the Backend Server**
   ```bash
   python app.py
   ```

6. **Set Up Frontend**
   - Navigate to the frontend directory
   - Open `login.html` in a web browser
   - Default credentials:
     - Username: admin
     - Password: admin123

## API Documentation

### Authentication Endpoints

- `POST /api/user/login`
  - Login with username and password
  - Returns JWT token

### Patient Endpoints

- `GET /api/patients`
  - Get all patients
- `POST /api/patients`
  - Add new patient
- `PUT /api/patients/{id}`
  - Update patient details
- `DELETE /api/patients/{id}`
  - Delete patient record

### Appointment Endpoints

- `GET /api/appointments`
  - Get all appointments
- `POST /api/appointments`
  - Create new appointment
- `PUT /api/appointments/{id}`
  - Update appointment
- `DELETE /api/appointments/{id}`
  - Delete appointment

## Database Schema

### Patient Collection
```javascript
{
  _id: ObjectId,
  name: String,
  contact_info: String,
  age: Number,
  gender: String,
  medical_history: String,
  current_conditions: String,
  medications: String,
  allergies: String,
  doctor_notes: String,
  recent_test_results: Object,
  last_visit_date: Date,
  hospital_id: Number
}
```

### Appointment Collection
```javascript
{
  _id: ObjectId,
  patient_id: ObjectId,
  doctor_id: ObjectId,
  appointment_date: Date,
  status: String,
  notes: String
}
```

## Security Features

- JWT-based authentication
- Password hashing
- CORS protection
- Input validation
- XSS protection
- Rate limiting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@doctorassistant.com or open an issue in the repository.

## Screenshots

### Login Page
![Login Page](docs/images/login.png)

### Dashboard
![Dashboard](docs/images/dashboard.png)

### Patient Management
![Patient Management](docs/images/patients.png)

### Appointment Management
![Appointment Management](docs/images/appointments.png)

## Acknowledgments

- Bootstrap Team
- Font Awesome
- MongoDB Team
- Flask Community