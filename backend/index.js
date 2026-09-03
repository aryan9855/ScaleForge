const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const { initializeLeaderboardSocket } = require('./socket/leaderboard.socket');

// Connect to Database
connectDB();

const app = express();

app.use(express.json());

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://scale-forge-omega.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/interview', interviewRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});
app.set('io', io);
initializeLeaderboardSocket(io);

// Serve Static Frontend for Production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectRedis();
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error(`Startup error: ${error.message}`);
  process.exit(1);
});
