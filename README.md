# 📌 **Authentication & User Management Backend (Node.js + Express + MongoDB)**

A production-ready authentication backend built with **Node.js, Express, MongoDB, JWT, Cloudinary, Multer, and Mongoose**.  
This project implements a modern auth flow with secure tokens, user profile management, file uploads, and cloud storage.

Perfect for real-world applications and demonstrating backend skills to employers.

---

## 🚀 **Features**

### 🔐 **Authentication & Security**
- Register & Login with email/username  
- Secure password hashing (bcrypt)  
- Access Token + Refresh Token system  
- HttpOnly cookies for secure storage  
- Auto token refresh  
- Logout & token invalidation  

### 👤 **User Management**
- Get logged-in user  
- Update full name, username, email  
- Change password  
- Update avatar image  
- Update cover image  

### 🖼️ **File Upload (Multer + Cloudinary)**
- Upload avatar & cover image  
- Automatically delete old Cloudinary files  
- Auto-delete temporary files using `fs.unlink`  

### 🎥 **Watch History**
- Store watched video IDs  
- Aggregation pipeline to fetch the history  
- Includes video owner details (username, avatar, fullname)

### 📊 **Subscriptions**
- Lookup subscribers & subscribed channels  
- Compute subscriber/subscribing counts  
- Check if the user is subscribed (boolean field)

### ⚙️ **Project Architecture**
```
src/
 ├── controllers/
 ├── routes/
 ├── models/
 ├── middleware/
 ├── utils/
 ├── db/
 ├── app.js
 └── index.js
```

### 🛡️ **Error Handling**
- Centralized error middleware  
- Custom `apiError` & `apiResponse` classes  
- `asyncHandler` wrapper for clean controllers  

---

## 🛠️ **Tech Stack**

| Tool | Use |
|------|-----|
| Node.js | Runtime |
| Express.js | Backend Framework |
| MongoDB + Mongoose | Database |
| JWT | Auth Tokens |
| Multer | File Upload |
| Cloudinary | Cloud Image Storage |
| bcrypt | Password Hashing |
| cookie-parser | Cookie Handling |
| CORS | Security |
| fs/promises | File cleanup |

---

## 📡 **API Endpoints**

### 🔐 Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/user/register` | Register user |
| POST | `/api/v1/user/login` | Login user |
| POST | `/api/v1/user/logout` | Logout user |
| POST | `/api/v1/user/refresh-tokens` | Generate new tokens |

---

### 👤 User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/user/get-user` | Get current user |
| POST | `/api/v1/user/update-password` | Change password |
| PATCH | `/api/v1/user/update-details` | Update user info |
| PATCH | `/api/v1/user/update-avatar` | Update avatar image |
| PATCH | `/api/v1/user/update-coverImage` | Update cover image |
| GET | `/api/v1/user/id/:username` | Get user profile by username |
| GET | `/api/v1/user/watch-history` | Get watch history |

---

## 🔧 Environment Variables
Create `.env` using this template:
```
PORT=8000
CORS_ORIGIN=*
MONGO_URI=
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## ▶️ Run Locally
```
git clone <repo-url>
cd project-folder
npm install
npm run dev
```

Server runs at:
```
http://localhost:8000
```

---

## 🧪 Status
✔ Fully functional  
✔ Tested routes  
✔ Cloudinary working  
✔ Error middleware added  
✔ Ready for portfolio & job applications  

---

## 👨‍💻 Author
**Sahil Khan**  
Fullstack / Backend Developer
