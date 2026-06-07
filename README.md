<h1 align="center">
  <br/>
  💬 RelayChat
  <br/>
</h1>

<p align="center">
  A real-time full-stack chat application built with the MERN stack and Socket.IO.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/Socket.IO-4-010101?style=for-the-badge&logo=socket.io&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white"/>
</p>

---

## ✨ Features

### 💬 Messaging
- **Real-time messaging** powered by Socket.IO — no page refresh needed
- **Edit messages** after sending with live update across all clients
- **Undo / delete messages** — delete for yourself or for everyone
- **Forward messages** to other conversations
- **Typing indicators** — see when the other person is typing in real time
- **Unread message badges** per conversation in the sidebar

### 🤝 Connection System
- **Message Requests** — send a request with an introductory message before chatting
- **Accept / Reject** requests — recipients can accept or dismiss incoming requests
- **Cancel sent requests** — senders can withdraw a pending request at any time
- **Re-send after rejection** — when a request is rejected the sender can immediately send a new one
- **Real-time request updates** via socket events (`received`, `accepted`, `rejected`, `cancelled`)
- **Email notification** sent to the original sender when their request is accepted

### 🗑️ Conversation Management
- **Delete conversation** — removes the conversation only for you; the other user keeps their copy
- **Real-time deletion** — chat area clears instantly without a page refresh
- **Custom confirmation popup** — stylish modal instead of a browser alert

### 👤 Auth & Profile
- **Register / Login** with JWT stored in a secure HTTP-only cookie
- **Forgot Password** — email-based reset link via Nodemailer / Gmail
- **Reset Password** with token validation and expiry
- **Update profile** — change display name and upload a profile picture (Cloudinary)
- **Password strength meter** on sign-up

### 🟢 Presence
- **Online / Offline status** for all users updated in real time
- **Last seen** tracking per user
- Online users strip in the sidebar

### 📱 Responsive UI
- **Mobile-first** layout with a slide-out drawer sidebar
- **Desktop sidebar** with persistent conversation list
- **Glassmorphism** design language with dark mode, gradients, and micro-animations
- **Framer Motion** animations throughout for a premium feel

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Framer Motion |
| Styling | Vanilla CSS + inline styles, Google Fonts (Outfit, Inter) |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO 4 |
| Auth | JWT (HTTP-only cookies) + bcrypt |
| File Upload | Cloudinary (signed uploads) |
| Email | Nodemailer (Gmail SMTP) |
| Dev tooling | Nodemon, Concurrently, ESLint |

---

## 📁 Folder Structure

```
relay-chat/
├── client/                         # React + Vite frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── auth/               # Login, Signup, ForgotPassword, ResetPassword forms
│       │   ├── chat/               # ChatArea, EmptyState (new conversation UI)
│       │   ├── common/             # Avatar, OnlineIndicator
│       │   ├── effects/            # Visual effect components
│       │   ├── layout/             # Page layout wrappers
│       │   ├── profile/            # Profile card & editor
│       │   └── sidebar/            # ChatRow, SidebarContent, SearchBar,
│       │                           #   HiddenRequests, MobileTopBar,
│       │                           #   MobileDrawer, DesktopSidebar
│       ├── context/                # React Context providers
│       ├── data/                   # Static data / constants
│       ├── hooks/                  # Custom React hooks (useIsMobile, …)
│       ├── pages/                  # Top-level route pages
│       │   ├── HomePage.jsx        # Main app shell + socket orchestration
│       │   ├── ProfilePage.jsx     # User profile & avatar upload
│       │   ├── LoginPage.jsx
│       │   ├── Register.jsx
│       │   ├── ForgotPasswordPage.jsx
│       │   └── ResetPasswordPage.jsx
│       ├── services/
│       │   ├── api.js              # Axios instance + all REST helpers
│       │   └── socket.js           # Socket.IO client singleton
│       ├── App.jsx                 # Route definitions
│       ├── main.jsx
│       └── index.css
│
├── server/                         # Express + Socket.IO backend
│   └── src/
│       ├── config/
│       │   ├── db.js               # Mongoose connection
│       │   └── cors.js             # CORS configuration
│       ├── controllers/
│       │   ├── auth.controller.js          # Register, login, profile, password reset
│       │   ├── conversation.controller.js  # CRUD for conversations
│       │   ├── message.controller.js       # Send, edit, delete, forward messages
│       │   ├── messageRequest.controller.js # Request lifecycle (create/accept/reject/cancel)
│       │   ├── cloudinary.controller.js    # Signed upload token
│       │   └── health.controller.js        # Health-check endpoint
│       ├── middleware/
│       │   └── auth.middleware.js  # JWT verification middleware
│       ├── models/
│       │   ├── user.model.js       # User + embedded messageRequests sub-schema
│       │   ├── conversation.model.js
│       │   └── message.model.js
│       ├── routes/
│       │   ├── index.js            # Mounts all routers
│       │   ├── auth.routes.js
│       │   ├── conversation.routes.js
│       │   ├── message.routes.js
│       │   ├── messageRequest.routes.js
│       │   ├── cloudinary.routes.js
│       │   └── health.routes.js
│       ├── sockets/
│       │   ├── index.js            # Socket.IO auth + room join logic
│       │   └── chat.socket.js      # All real-time event handlers
│       ├── utils/
│       │   └── sendEmail.js        # Nodemailer helper
│       ├── app.js                  # Express app setup
│       └── server.js               # HTTP server + Socket.IO bootstrap
│
├── package.json                    # Root scripts (runs both apps concurrently)
└── README.md
```

---

## ⚙️ Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18 or higher |
| npm | 9 or higher |
| MongoDB | Local instance **or** MongoDB Atlas URI |
| Gmail account | For password-reset & request-accepted emails |
| Cloudinary account | For profile picture uploads |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/relay-chat.git
cd relay-chat
```

### 2. Install all dependencies

```bash
npm run install:all
```

This single command installs packages for the root, `client/`, and `server/` workspaces.

### 3. Configure environment variables

Create a `.env` file inside the `server/` folder (copy from the example):

```bash
cp server/.env.example server/.env
```

Then fill in your values:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/relay-chat

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Gmail SMTP (for password reset & notification emails)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=Relay Chat <your_gmail@gmail.com>

# Cloudinary (for profile picture uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Gmail tip:** Use a [Google App Password](https://myaccount.google.com/apppasswords) — not your regular Gmail password — when 2FA is enabled.

---

## 📜 Available Scripts

Run these from the **project root**:

| Command | Description |
|---|---|
| `npm run dev` | Start **both** client and server in development mode (concurrently) |
| `npm run dev:client` | Start only the Vite dev server (port `5173`) |
| `npm run dev:server` | Start only the Express server with Nodemon |
| `npm run build` | Build the React client for production |
| `npm run start` | Start the Express server in production mode |
| `npm run install:all` | Install dependencies for root + client + server |


---

## 🔐 Authentication Flow

1. User registers or logs in → server issues a **JWT stored in an HTTP-only cookie**.
2. All subsequent API calls include the cookie automatically (`withCredentials: true` on the Axios instance).
3. Protected routes use the `authMiddleware` to verify the JWT and attach `req.user`.
4. Socket connections are authenticated by reading the same JWT cookie on handshake inside `sockets/index.js`.

---

## 🌐 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ | `development` or `production` |
| `PORT` | ✅ | Express server port (default `5000`, auto-increments if in use) |
| `CLIENT_URL` | ✅ | Vite dev server URL for CORS (`http://localhost:5173`) |
| `MONGODB_URI` | ✅ | Full MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key used to sign tokens (keep this long and random) |
| `EMAIL_USER` | ⚠️ | Gmail address used as the SMTP sender |
| `EMAIL_PASS` | ⚠️ | Gmail App Password (not your account password) |
| `EMAIL_FROM` | ⚠️ | Display name + address for outgoing emails |
| `CLOUDINARY_CLOUD_NAME` | ⚠️ | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ⚠️ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ⚠️ | Cloudinary API secret |

> ⚠️ = optional but required for that specific feature to work.

---

## 🖼 Project Highlights

- **Optimistic UI** — messages appear instantly with a `pending` state, then are confirmed or rolled back once the server responds.
- **Duplicate-message guard** — a `mergeMessages` utility deduplicates incoming socket events so messages never appear twice.
- **Real-time profile sync** — updating your name or avatar is reflected across all open conversations instantly via `user:updated`.
- **Signed Cloudinary uploads** — profile pictures are uploaded directly from the browser to Cloudinary using a server-generated signature, keeping API secrets server-side.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ using the MERN Stack + Socket.IO</p>
