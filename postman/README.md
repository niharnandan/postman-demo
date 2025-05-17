# Postman to API Server Generator
An application that automatically generates API server code from your Postman collections. Simply upload your Postman collection, configure your settings, and the application will generate a complete API server implementation for your chosen framework.

Show Image

Table of Contents
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Features](#features)
- [How to Use](#how-to-use)
- [Postman Collections](#postman-collections)
- [Project Structure](#project-structure)
- [Technical Details](#technical-details)
- [Limitations](#limitations)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## 🧰 Installation

This project consists of a frontend React application and a backend Node.js server. You'll need to set up both to use the application.

### Prerequisites
- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)

### Backend Setup
```bash
# Navigate to the backend folder from the project root
cd backend

# Install backend dependencies
npm install
```

**Important:** You need to add your Claude API key to the server.js file. Open server.js and replace `CLAUDE_API_KEY` with your actual API key.

### Frontend Setup
```bash
# From the project root
npm install
```

---

## ▶️ Running the Application

You'll need to run both the backend server and the frontend application:

### Start the Backend Server
```bash
# In the backend directory
node server.js
```
> The server will start on port 3005 by default.

### Start the Frontend Application
```bash
# In the project root
npm run dev
```
> The frontend will automatically run on a different port (typically 5173) and will open in your default web browser.

---

## ✨ Features
- **Postman Collection Upload**: Easily upload your Postman collection JSON file
- **Visual API Flow Diagram**: Automatically visualizes your API endpoints in an interactive flow diagram
- **Multiple Framework Support**: Generate code for Express.js (Node.js), Flask (Python), or Django (Python)
- **Database Integration**: Option to include database connectivity in your generated API
- **Customization Options**: Provide custom instructions to tailor the generated code to your needs
- **Complete Project Generation**: Creates all necessary files to run a working API server
- **Code Visualization**: Browse and inspect generated files before downloading
- **Setup Instructions**: Includes detailed setup and usage instructions for your API

---

## 🧪 How to Use

1. **Upload Postman Collection**: On the first screen, upload your Postman collection JSON file by dragging and dropping or clicking to browse.
2. **Configure Settings**:
   - Select your preferred framework (Express.js, Flask, or Django)
   - Optionally provide database connection details
   - Choose whether to include setup files
   - Add any custom instructions for code generation
3. **Generate Code**: Click "Generate Code" to create your API server implementation.
4. **Explore & Download**: Browse the generated files, view their contents, and download everything as a ZIP file.
5. **Follow Setup Instructions**: The application provides detailed instructions on how to set up and run your generated API server.

---

## 📬 Postman Collections

This application works with standard Postman collection JSON files (v2.0 and v2.1 formats). When you export a collection from Postman:

- Open Postman and navigate to your collection
- Click the three dots (...) next to your collection name
- Select "Export"
- Choose "Collection v2.1" as the format
- Save the JSON file
- Upload this JSON file to the application

The application will:

- Parse all requests in your collection
- Maintain folder structure and organization
- Visualize your API endpoints in a flow diagram
- Generate server code that implements each endpoint

---

## 📁 Project Structure

```
postman
├── backend                # Backend server
│   ├── package-lock.json
│   ├── package.json
│   └── server.js          # Express server that handles AI code generation
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── public
│   └── vite.svg
├── README.md
├── src
│   ├── App.css
│   ├── App.tsx            # Main application component
│   ├── assets
│   │   └── react.svg
│   ├── components
│   │   ├── ApiVisualizer.tsx              # API visualization component
│   │   ├── ChatPanel.tsx
│   │   ├── ConfigStep.tsx                 # Configuration options component
│   │   ├── Header.tsx                     # Application header
│   │   ├── PostmanFlowVisualization.tsx   # Flow diagram visualization
│   │   ├── ResultStep.tsx                 # Generated code results component
│   │   └── UploadStep.tsx                 # File upload component
│   ├── index.css
│   ├── main.tsx           # Application entry point
│   ├── services
│   │   └── apiService.ts  # API service for backend communication
│   └── vite-env.d.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## ⚙️ Technical Details

- **Frontend**: React with TypeScript, Material UI, ReactFlow  
- **Backend**: Express.js  
- **Code Generation**: Claude AI API  
- **Visualization**: ReactFlow for interactive API diagrams  
- **Bundling**: Vite for fast development and optimized builds

---

## ⚠️ Limitations

- This project was built as a demo in just 2 days, so it may have some rough edges  
- The application is designed to run locally only and is not configured for production deployment  
- The quality of generated code depends on the structure and complexity of your Postman collection
