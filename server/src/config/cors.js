const defaultOrigins = ['http://localhost:5173', 'http://localhost:5002'];

// Supports comma-separated CLIENT_URL for multiple allowed origins:
// e.g. CLIENT_URL=https://relay-chat.vercel.app,https://relay-chat-git-main.vercel.app
const getAllowedOrigins = () => {
  const clientUrl = process.env.CLIENT_URL;
  if (!clientUrl) return defaultOrigins;
  return clientUrl.split(',').map((u) => u.trim()).filter(Boolean);
};

export const getCorsOptions = () => {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin: (requestOrigin, callback) => {
      // Allow server-to-server / Postman (no Origin header)
      if (!requestOrigin) return callback(null, true);

      // Exact match against the whitelist
      if (allowedOrigins.includes(requestOrigin)) {
        return callback(null, true);
      }

      // Auto-allow any Vercel preview deploy for this project
      // e.g. relay-chat-abc123-komal.vercel.app
      const vercelPreview = /^https:\/\/relay-chat[a-z0-9-]*\.vercel\.app$/;
      if (vercelPreview.test(requestOrigin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked origin: ${requestOrigin}`);
      return callback(new Error(`CORS: origin ${requestOrigin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
};
