API Explorer
A dynamic API testing tool that automatically discovers and visualizes Express routes, allowing developers to test API endpoints with real-time updates.

Show Image

Overview
API Explorer dynamically scans your Express server's routes folder and generates an interactive UI that displays all available endpoints. As you add or modify routes in your server, the UI updates in real-time via WebSockets, making it perfect for rapid API development and testing.

Features
Auto-Discovery: Automatically finds and displays all Express routes in your project
Real-Time Updates: WebSocket connection provides instant UI updates when routes change
Interactive Testing: Click any endpoint to see its response in a formatted JSON viewer
Visual Method Indicators: Color-coded HTTP method chips (GET, POST, PUT, DELETE)
Connection Status: Real-time connection indicator shows WebSocket status
Modern UI: Clean Material UI design with responsive layout
Installation
Prerequisites
Node.js (v16 or higher)
npm or yarn
Setup
Clone the repository:
bash
git clone https://github.com/yourusername/api-explorer.git
cd api-explorer
Install server dependencies:
bash
cd server
npm install
Install client dependencies:
bash
cd ../client
npm install
Running the Application
You need to run both the server and client applications:

Start the Server
bash
cd server
npm run dev
The server will start on port 4005 by default.

Start the Client
bash
cd client
npm run dev
The client will start on port 4000 by default and should open automatically in your browser. If not, navigate to http://localhost:4000.

How It Works
The Express server automatically scans the routes folder for route definitions
The getRoutes.js file parses these routes and extracts endpoint information
When the client connects via WebSocket, the server sends the current routes
The React client displays these routes as interactive buttons
Clicking a route button sends a request to that endpoint
The response is displayed in a JSON viewer below
Project Structure
api-explorer/
├── client/ # React frontend
│ ├── public/
│ ├── src/
│ │ ├── App.tsx # Main application component
│ │ ├── main.tsx # Entry point
│ │ ├── types.ts # TypeScript definitions
│ │ └── json-pretty.css # JSON formatter styles
│ ├── package.json
│ └── tsconfig.json
│
└── server/ # Express backend
├── controllers/ # API controllers
├── routes/ # API route definitions
├── index.ts # Server entry point
├── getRoutes.js # Route discovery logic
├── errorHandler.js # Error handling middleware
└── package.json
Customization
Adding New Routes
Create a new route file in the server/routes folder (e.g., newEndpoint.js)
Define your routes using Express Router:
javascript
const express = require('express');
const router = express.Router();

router.get('/data', (req, res) => {
res.json({ message: 'This is my new endpoint' });
});

module.exports = router;
Create a corresponding controller in server/controllers if needed
The API Explorer will automatically detect your new routes and update the UI
Important Notes
Do not modify getRoutes.js or index.ts as these files are core to the application's functionality
All other files in the server folder can be modified or replaced
The application assumes your API endpoints follow RESTful conventions
Development
Client
The client is built with:

React 19
TypeScript
Material UI 7
Socket.io client
Vite
Server
The server uses:

Express
Socket.io
Morgan (for logging)
Cors
License
MIT

Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
