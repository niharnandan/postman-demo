import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';

const { router: apiRoutes, routes: routeInfo } = require('./getRoutes.js');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4005;

const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:4000', // React app URL
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', apiRoutes);

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.emit('routes', routeInfo);
  console.log('Sent routes to client:', routeInfo);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Avatar API',
    info: 'API endpoints are available under /api'
  });
});

app.use((req, res, next) => {
  const error: any = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API base: http://localhost:${PORT}/api`);
  console.log('Available routes:', routeInfo);
});