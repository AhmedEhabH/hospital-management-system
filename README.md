# 🏥 Hospital Management System

A comprehensive full-stack hospital management system built with **Angular 19** and **.NET 8**, designed for modern healthcare facilities.

## 🚀 Features

### 👨‍⚕️ For Healthcare Professionals
- **Patient Registration & Management**
- **Medical History Tracking**
- **Lab Report Management**
- **Doctor-Patient Messaging System**
- **Appointment Scheduling**

### 🏥 For Administrators
- **Hospital Information Management**
- **Doctor Profile Management**
- **Feedback System**
- **Comprehensive Reporting**

### 🔐 Security & Authentication
- **JWT-based Authentication**
- **Role-based Access Control** (Admin, Doctor, Patient)
- **Secure API Endpoints**

## 🛠️ Technology Stack

### Backend (.NET 8)
- **ASP.NET Core Web API**
- **Entity Framework Core**
- **SQL Server**
- **JWT Authentication**
- **AutoMapper**
- **FluentValidation**

### Frontend (Angular 19)
- **Angular 19** with Standalone Components
- **Angular Material** or **PrimeNG**
- **SCSS** for styling
- **RxJS** for reactive programming
- **Signal-based State Management**

### Database
- **SQL Server** with Entity Framework Core
- **Code-First Migrations**
- **Stored Procedures** for complex queries

## 📁 Project Structure

```plaintext
hospital-management-system/
├── HospitalManagement.API/           # .NET 8 Backend
├── hospital-management-frontend/     # Angular 19 Frontend
├── Database/                         # Database Scripts
├── Documentation/                    # Project Documentation
├── Docker/                           # Docker Configuration
├── Scripts/                          # Build & Deployment Scripts
└── Tests/                            # Unit & Integration Tests
```

## 🚀 Getting Started

### Prerequisites
- **.NET 8 SDK**
- **Node.js 18+**
- **Angular CLI 19**
- **SQL Server** (LocalDB or Full)
- **Visual Studio 2022** (for backend)
- **VS Code** (for frontend)

### Backend Setup
1. Open `HospitalManagement.API` in Visual Studio 2022
2. Update connection string in `appsettings.json`
3. Run migrations: `Update-Database`
4. Press F5 to run the API

### Frontend Setup
1. Navigate to `hospital-management-frontend`
2. Install dependencies: `npm install`
3. Start development server: `ng serve`
4. Open browser to `http://localhost:4200`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Medical History
- `GET /api/medical-history/{userId}` - Get patient medical history
- `POST /api/medical-history` - Create medical history

### Lab Reports
- `GET /api/lab-reports/{patientId}` - Get patient lab reports
- `POST /api/lab-reports` - Create lab report

### Messaging
- `GET /api/messages/inbox/{userId}` - Get user messages
- `POST /api/messages` - Send message

## 📱 Screenshots

[Add screenshots of your application here]

## 🏆 Portfolio Highlights

This project demonstrates:
- **Full-stack development** expertise
- **Modern web technologies** (Angular 19, .NET 8)
- **Clean Architecture** principles
- **RESTful API** design
- **Database design** and optimization
- **Authentication & Authorization**
- **Responsive UI/UX** design

## 🚀 Deployment

### Docker Deployment
docker-compose up -d


### Manual Deployment
- Backend: Deploy to IIS or Azure App Service
- Frontend: Deploy to Netlify, Vercel, or Azure Static Web Apps
- Database: SQL Server or Azure SQL Database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Ahmed Ehab**
- GitHub: [@AhmedEhabH](https://github.com/AhmedEhabH)
- LinkedIn: [Ahmed Ehab](https://www.linkedin.com/in/ahmed-e-407654103/)

---

⭐ **Star this repository if you find it helpful!**
