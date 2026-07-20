# 💬 ChatSpace

> **A real-time chat & video calling web application with an integrated AI assistant.**

---

## 📌 About The Project

**ChatSpace** is a modern, web-based communication platform. It allows users to create accounts, send instant messages, create group chats, make direct peer-to-peer video calls, and interact with an AI Assistant powered by Google Gemini.

---

## 🌟 Key Features

- **👤 User Registration & Login**: Secure signup with email OTP (One-Time Password) verification.
- **💬 Real-Time Direct Messaging**: Instant 1-on-1 private messaging using Socket.IO.
- **👥 Group Chats**: Create groups and chat with multiple users simultaneously.
- **📹 Video & Audio Calls**: High-quality peer-to-peer video/audio calling directly in the browser (WebRTC).
- **🤖 Built-in AI Assistant**: Chat directly with Google Gemini AI to ask questions or get assistance.
- **📁 File & Image Sharing**: Upload and send photos, audio, and documents in chat.
- **🔔 Push Notifications**: Receive browser notifications when new messages arrive.

---

## 🛠️ Built With

- **Backend**: Node.js, Express.js (v5)
- **Database**: MongoDB (Mongoose ORM)
- **Real-Time Communication**: Socket.IO, WebRTC
- **AI Integration**: Google Gemini API (`@google/generative-ai`)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS)

---

## 📂 Project File Structure

Below is the complete file and folder structure of the ChatSpace project:

```text
Final_project/
├── config/
│   └── db.js                 # Database connection setup (MongoDB Atlas)
├── controllers/
│   ├── aiController.js       # Google Gemini AI assistant logic
│   ├── authController.js     # User registration, login & OTP verification
│   ├── groupController.js    # Group creation & member management
│   ├── messageController.js  # Message history & retrieval
│   ├── pushController.js     # Push notification subscription handlers
│   └── userController.js     # User search & profile endpoints
├── models/
│   ├── Group.js              # Mongoose schema for Chat Groups
│   ├── Message.js            # Mongoose schema for Messages
│   └── User.js               # Mongoose schema for User Accounts
├── public/
│   ├── client.js             # Client UI, Socket.IO events & WebRTC video calls
│   ├── index.html            # Main HTML application interface
│   ├── style.css             # Custom CSS styles, animations & responsive layout
│   ├── sw.js                 # Service Worker for push notifications
│   └── uploads/              # Folder for storing uploaded media & files
├── routes/
│   ├── aiRoutes.js           # API route for AI assistant
│   ├── authRoutes.js         # API routes for signup, login, OTP
│   ├── groupRoutes.js        # API routes for groups
│   ├── messageRoutes.js      # API routes for chat messages
│   ├── pushRoutes.js         # API routes for push notifications
│   ├── uploadRoutes.js       # API route for handling file uploads
│   └── userRoutes.js         # API routes for user management
├── .env              # Environment variables template file
├── .gitignore                # Specifies files to exclude from GitHub
├── package.json              # Project dependencies & npm scripts
├── package-lock.json         # Locked versions of dependencies
├── README.md                 # Project documentation file
└── server.js                 # Main server entry point (Express & Socket.IO)
```

---

## 🚀 How to Run the Project (Step-by-Step)

Follow these simple steps to run ChatSpace on your local machine:

### 1️⃣ Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (Version 18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local installation or a MongoDB Atlas account)

---

### 2️⃣ Download & Setup

1. **Clone or Download the Project**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ChatSpace.git
   cd ChatSpace
   ```

2. **Install Required Packages**:
   ```bash
   npm install
   ```

---

### 3️⃣ Configure Environment Variables

Create a file named **`.env`** in the main project folder and add your credentials:

```env
PORT=9113
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

# Web Push Keys
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key

# AI Assistant (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key

# Email Setup (For OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
```

*(You can refer to `.env.example` as a reference template).*

---

### 4️⃣ Start the Application

- **For Development** (Auto-reloads on code changes):
  ```bash
  npm run dev
  ```

- **For Production**:
  ```bash
  npm start
  ```

---

### 5️⃣ Open in Browser

Open your web browser and navigate to:
```text
http://localhost:9113
```

---

## 🤝 Contributing & License

Feel free to fork this repository, submit issues, or create pull requests.

This project is licensed under the **ISC License**.
