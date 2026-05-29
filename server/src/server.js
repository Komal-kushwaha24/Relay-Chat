import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { getCorsOptions } from './config/cors.js';
import { initSocketHandlers } from './sockets/index.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
      cors: getCorsOptions(),
    });

    initSocketHandlers(io);
    // expose io to express app so controllers can emit events
    app.set('io', io);

    // Try to listen on PORT, if in use attempt the next ports up to +10
    const listenWithRetry = (server, startPort, maxTries = 10) =>
      new Promise((resolve, reject) => {
        let port = Number(startPort) || 5000;
        let attempts = 0;

        const attempt = () => {
          const onError = (err) => {
            cleanup();
            if (err && err.code === 'EADDRINUSE' && attempts < maxTries) {
              console.warn(`Port ${port} in use, trying ${port + 1}`);
              attempts += 1;
              port += 1;
              // small delay before retrying
              setTimeout(attempt, 150);
              return;
            }
            reject(err);
          };

          const onListening = () => {
            cleanup();
            resolve(port);
          };

          function cleanup() {
            server.removeListener('error', onError);
            server.removeListener('listening', onListening);
          }

          server.once('error', onError);
          server.once('listening', onListening);
          server.listen(port);
        };

        attempt();
      });

    try {
      const boundPort = await listenWithRetry(httpServer, PORT, 10);
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${boundPort}`);
    } catch (err) {
      console.error('Failed to bind server port:', err.message || err);
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
