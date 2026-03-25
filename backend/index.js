const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');

dotenv.config();

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

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
