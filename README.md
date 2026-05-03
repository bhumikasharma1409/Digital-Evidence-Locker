# 🔐 Digital Evidence Locker

<p align="center">
  <b>Secure, Tamper-Proof Digital Evidence Management System for Law Enforcement & Legal Ecosystem</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/MERN-FullStack-blue?style=for-the-badge&logo=mongodb">
  <img src="https://img.shields.io/badge/Security-High-red?style=for-the-badge&logo=shield">
  <img src="https://img.shields.io/badge/Real--Time-Socket.IO-green?style=for-the-badge&logo=socket.io">
  <img src="https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge&logo=jsonwebtokens">
  <img src="https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge">
</p>

---

## 📌 Overview

The **Digital Evidence Locker** is a secure, scalable full-stack web application designed to manage sensitive digital evidence for law enforcement agencies and legal professionals.

It solves major issues in traditional systems such as:
- Lack of transparency  
- Risk of tampering  
- Poor tracking systems  
- Limited accessibility  

✔ Provides a centralized, tamper-resistant and trackable evidence system  

---

##  Objectives

- Ensure secure storage and integrity of digital evidence  
- Provide role-based access control  
- Enable real-time tracking and updates  
- Build a scalable legal-tech solution  

---

##  Key Features

 Secure evidence upload with validation  
 Role-based authentication (Police / Lawyer / Admin)  
 Tamper-resistant storage system  
 Real-time updates using Socket.IO  
 Evidence lifecycle tracking  
 Profile management  
 RESTful API architecture  

---

##  Detailed Features

### 📁 Secure Evidence Upload
- Supports images, videos, documents  
- File validation & filtering  
- Unique file naming  
- Secure server storage  

### 🔐 Authentication & Authorization
- JWT-based authentication  
- Role-specific dashboards:
  - 👮 Police → Upload & manage  
  - ⚖️ Lawyer → Review evidence  
  - 🛠️ Admin → Full control  
- Protected routes  

### 🧾 Evidence Lifecycle Management
- Includes case ID, description, timestamp, status  
- Status stages:
  - Uploaded  
  - Under Review  
  - Verified  
- Fully traceable system  

### ⚡ Real-Time Communication
- Instant updates using Socket.IO  
- Trigger events on:
  - Upload  
  - Status changes  
  - Case updates  

### 👤 User Profile Management
- Edit profile details  
- Persistent storage in MongoDB  
- Secure update APIs  

### 🛡️ Security & Data Protection
- Input validation & sanitization  
- Secure API endpoints  
- Designed for future:
  - Encryption  
  - Digital signatures  
  - Blockchain logging  

### 🔗 API Architecture
- RESTful design  
- Modular routing  
- Clean separation of concerns  

---

##  Tech Stack

### 💻 Frontend
- React.js  
- HTML5  
- CSS3  
- JavaScript  

### ⚙️ Backend
- Node.js  
- Express.js  

### 🗄️ Database
- MongoDB  
- Mongoose  

### 🔄 Real-Time
- Socket.IO  

### 🔐 Authentication
- JWT  

---

##  Installation & Setup

```bash
# Clone Repository
git clone https://github.com/your-username/digital-evidence-locker.git
cd digital-evidence-locker

# Backend
cd server
npm install
npm start

# Frontend
cd ../client
npm install
npm start
```

---

## 📘 Usage Guide

1. Register as Police / Lawyer / Admin  
2. Login securely  
3. Upload digital evidence  
4. System validates and stores file  
5. Evidence is tracked with status  
6. Real-time updates notify users  

---

##  System Workflow

```
User → Authentication 🔐 → Upload Evidence 📁 → Validation → Storage → Database → 
Real-Time Update → Status Tracking → Authorized Access
```

---

## System Architecture (Conceptual)

```
Frontend (React)
        ↓
Backend API (Node.js + Express)
        ↓
Authentication Layer (JWT)
        ↓
Database (MongoDB)
        ↓
File Storage
        ↓
Real-Time Layer (Socket.IO)
```

---

## 📁 Project Structure

```
project-root/
│
├── frontend/              
├── backend/              
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── config/
│
├── uploads/             # Stored files
└── README.md
```

---

##  Applications

 Law enforcement systems  
 Legal documentation  
 Digital forensics  
 Court evidence tracking  
 Secure enterprise storage  

---

##  Challenges Addressed

- Prevent unauthorized access  
- Ensure data integrity  
- Handle large file uploads  
- Maintain real-time sync  
- Build scalable architecture  

---

##  Future Enhancements

 Digital signature verification  
 Blockchain logging  
 Admin analytics dashboard  
 Mobile app (React Native)  
 AI-based evidence classification  
 Cloud integration (AWS/Firebase)  

---

## 🤝 Contribution

```
git checkout -b feature/YourFeature
git commit -m "Added new feature"
git push origin feature/YourFeature
```

---


##  Author

**Bhumika Sharma**  
**Bhanvi Sahni**  
**Bhuvi Bhatnagar**  
**Arpit**  



---

<p align="center"> Made with ❤️ using MERN & Real-Time Systems </p>
