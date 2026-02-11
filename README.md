# ☕ CafePilot


**CafePilot** is a modern, full-stack cafe management system designed to streamline operations from order taking to administrative oversight. Built with a powerful combination of Next.js, Express, and MongoDB, it features an integrated AI assistant to help cafe owners manage their business more efficiently.

## 🚀 Features

- **📊 Admin Dashboard**: Real-time statistics and overview of cafe operations.
- **🏠 Cafe Management**: Add, approve, and manage multiple cafes and their owners.
- **📋 Menu & Orders**: Digital menu management and a robust order tracking system.
- **🪑 Table Management**: Dynamic table addition and deletion for individual cafes.
- **💼 Staff Oversight**: Manage staff roles and access levels.
- **🤖 Gemini AI Integration**: Built-in AI assistant for smart insights and automated tasks.
- **🔔 Real-time Notifications**: Instant updates using Socket.io integration.

## 📂 Project Structure

```bash
CafePilot/
├── client/              # Next.js Frontend
│   ├── app/             # App Router components & pages
│   ├── components/      # UI components (Shadcn UI)
│   ├── redux/           # State management
│   └── public/          # Static assets
├── server/              # Express Backend
│   ├── controllers/     # Business logic
│   ├── model/           # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── middlewares/     # Auth & validation
│   └── database/        # DB configuration
└── README.md            # You are here!
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React, Redux Toolkit, Tailwind CSS, Lucide React, Radix UI.
- **Backend**: Node.js, Express.js, Socket.io.
- **Database**: MongoDB with Mongoose.
- **AI**: Google Gemini AI (@google/generative-ai).
- **Authentication**: JWT with Cookie-based storage.

## ⚙️ Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or via Atlas)
- Gemini AI API Key

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YourUsername/CafePilot.git
   cd CafePilot
   ```

2. **Server Setup**:
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   GEMINI_API_KEY=your_gemini_key
   ```
   Start the server:
   ```bash
   npm run dev
   ```

3. **Client Setup**:
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env.local` file in the `client` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
   Start the client:
   ```bash
   npm run dev
   ```

## 📖 Usage

- **Administrator**: Access the admin portal to approve cafes and monitor global stats.
- **Cafe Owner**: Manage your specific cafe's menu, tables, and staff.
- **Staff**: Use the order management interface to serve customers efficiently.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Created by [Jagat Joshi](https://github.com/Jagat05)*
