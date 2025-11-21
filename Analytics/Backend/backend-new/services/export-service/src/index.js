
const express = require('express');
const cors = require('cors');
const exportRoutes = require('./routes/exportRoutes');
const app = express();

// Use provided port from environment or default to 5005
const PORT = process.env.PORT || 5005;

// Global middleware
app.use(cors());               // Allow cross-origin requests
app.use(express.json());       // Parse JSON request bodies

// Register API routes → Anything starting with /api/export goes to exportRoutes
app.use('/api/export', exportRoutes);

// Health check endpoint for monitoring or uptime tools
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Root endpoint message
app.get('/', (req, res) => {
  res.send('Exhibition Analytics API is running ');
});

// Centralized error handler for unexpected errors in routes/middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the HTTP server and keep a reference for shutdown handling
const server = app.listen(PORT, () => {
  console.log(` Server running at: http://localhost:${PORT}`);
});

// Track server close events
server.on('close', () => {
  console.log('HTTP server closed');
});

// Handle uncaught errors not caught by Express middleware
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  try { server.close(); } catch {}
  process.exit(1);
});

// Handle unhandled Promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown logic for termination signals (Ctrl+C, cloud restarts, etc.)
const graceful = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  // Stop accepting new connections
  server.close(() => {
    console.log('Closed out remaining connections');
    process.exit(0);
  });

  // If not closed in time, force shutdown
  setTimeout(() => {
    console.warn('Forcing shutdown');
    process.exit(1);
  }, 10000).unref(); // Prevents this timer from keeping the event loop alive
};

// Bind graceful shutdown to signals
['SIGINT', 'SIGTERM'].forEach(sig => {
  try { process.on(sig, () => graceful(sig)); } catch {}
});

// Log when the process exits for any reason
process.on('exit', (code) => {
  console.log(`Process exiting with code ${code}`);
});
