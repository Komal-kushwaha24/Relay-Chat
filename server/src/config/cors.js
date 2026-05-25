const defaultOrigins = ['http://localhost:5173'];

export const getCorsOptions = () => {
  const clientUrl = process.env.CLIENT_URL;
  const origins = clientUrl ? [clientUrl] : defaultOrigins;

  return {
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
};
