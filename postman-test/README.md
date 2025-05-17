# API Explorer

**A dynamic API testing tool that automatically discovers and visualizes Express routes, allowing developers to test API endpoints with real-time updates.**

---

## 🧰 Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- npm or yarn

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/api-explorer.git
cd api-explorer
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

---

## 🚀 Overview

**API Explorer** dynamically scans your Express server's `routes` folder and generates an interactive UI that displays all available endpoints. As you add or modify routes in your server, the UI updates in real-time via WebSockets—making it perfect for rapid API development and testing.

---

## ✨ Features

- 🔍 **Auto-Discovery**: Automatically finds and displays all Express routes in your project
- 🔄 **Real-Time Updates**: WebSocket connection provides instant UI updates when routes change
- 🧪 **Interactive Testing**: Click any endpoint to view the response in a formatted JSON viewer
- 🎨 **Visual Method Indicators**: Color-coded HTTP method chips (GET, POST, PUT, DELETE)
- 📶 **Connection Status**: Real-time WebSocket connection indicator
- 💎 **Modern UI**: Clean Material UI design with responsive layout

---

## ▶️ Running the Application

You need to run **both the server and client** applications.

### Start the Server

```bash
cd server
npm run dev
```

> The server will start on **http://localhost:4005**

### Start the Client

```bash
cd ../client
npm run dev
```

> The client will start on **http://localhost:4000** and should open automatically in your browser. If not, open it manually.

---

## ⚙️ How It Works

1. The Express server scans the `routes/` folder for route definitions.
2. The `getRoutes.js` script extracts all available endpoints.
3. When the React client connects via WebSocket, it receives the current route list.
4. Routes are displayed as interactive buttons with method tags.
5. Clicking a route sends a request and displays the JSON response.

---

## 📁 Project Structure

```
api-explorer/
├── client/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.tsx       # Main component
│   │   ├── main.tsx      # Entry point
│   │   ├── types.ts      # TypeScript definitions
│   │   └── json-pretty.css # JSON formatter styles
│   ├── package.json
│   └── tsconfig.json
│
└── server/               # Express backend
    ├── controllers/      # API controllers
    ├── routes/           # API route definitions
    ├── index.ts          # Server entry point
    ├── getRoutes.js      # Route discovery logic
    ├── errorHandler.js   # Error handling middleware
    └── package.json
```

---

## 🛠️ Customization

### Adding New Routes

1. Create a new file in `server/routes/`, e.g., `newEndpoint.js`
2. Define your routes:

```javascript
const express = require("express");
const router = express.Router();

router.get("/data", (req, res) => {
  res.json({ message: "This is my new endpoint" });
});

module.exports = router;
```

3. Create a corresponding controller in `server/controllers` if needed

> API Explorer will automatically detect and display new routes.

---

## ⚠️ Important Notes

- Do **not** modify `getRoutes.js` or `index.ts`—they're core to the app's functionality.
- You can modify or replace all other files in the `server/` folder.
- The application assumes your API endpoints follow RESTful conventions.

---

## 🧪 Development Tools

### Client

- React 19
- TypeScript
- Material UI 7
- Socket.io-client
- Vite

### Server

- Express
- Socket.io
- Morgan (logging)
- CORS
