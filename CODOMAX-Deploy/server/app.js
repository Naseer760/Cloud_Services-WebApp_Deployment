const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev flexible fallback
    },
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory for images
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Root API landing & status page
app.get(['/', '/api'], (req, res) => {
  if (req.accepts('html')) {
    return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Campus Lost & Found API - Running</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; max-width: 680px; width: 100%; padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); padding: 6px 14px; border-radius: 9999px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
    .dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e; }
    h1 { font-size: 26px; font-weight: 700; margin-bottom: 8px; color: #ffffff; }
    p.desc { color: #94a3b8; font-size: 15px; margin-bottom: 24px; line-height: 1.5; }
    .actions { display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
    .btn { display: inline-block; padding: 12px 22px; border-radius: 10px; font-weight: 600; text-decoration: none; font-size: 14px; transition: all 0.2s; }
    .btn-primary { background: #3b82f6; color: white; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4); }
    .btn-primary:hover { background: #2563eb; }
    .btn-secondary { background: #334155; color: #f1f5f9; }
    .btn-secondary:hover { background: #475569; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px; }
    .info-box { background: #0f172a; padding: 14px; border-radius: 8px; border: 1px solid #1e293b; }
    .info-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .info-value { font-size: 14px; color: #e2e8f0; font-family: monospace; font-weight: 600; }
    .endpoint-list { margin-top: 20px; border-top: 1px solid #334155; padding-top: 18px; }
    .endpoint-list h3 { font-size: 14px; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px; }
    .endpoint-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #0f172a; border-radius: 6px; margin-bottom: 6px; font-family: monospace; font-size: 13px; }
    .endpoint-method { color: #38bdf8; font-weight: bold; }
    .endpoint-path a { color: #cbd5e1; text-decoration: none; }
    .endpoint-path a:hover { color: #38bdf8; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="dot"></span> Backend API is Running & Healthy</div>
    <h1>Campus Lost & Found Server</h1>
    <p class="desc">The Node.js + Express REST API & Socket.IO live alerts server is active on <strong>port 5000</strong>. Access the React user interface below.</p>
    
    <div class="actions">
      <a href="http://localhost:5173" class="btn btn-primary" target="_blank">🌐 Open Frontend Web Application (Port 5173) &rarr;</a>
      <a href="/api/items" class="btn btn-secondary" target="_blank">📦 View Items API</a>
      <a href="/api/health" class="btn btn-secondary" target="_blank">💚 Health Check</a>
    </div>

    <div class="grid">
      <div class="info-box">
        <div class="info-label">Server Port</div>
        <div class="info-value">5000 (HTTP & WebSocket)</div>
      </div>
      <div class="info-box">
        <div class="info-label">Client URL</div>
        <div class="info-value"><a href="http://localhost:5173" style="color: #38bdf8; text-decoration: none;">http://localhost:5173</a></div>
      </div>
      <div class="info-box">
        <div class="info-label">Default Admin</div>
        <div class="info-value">admin@campus.edu</div>
      </div>
      <div class="info-box">
        <div class="info-label">Demo Student</div>
        <div class="info-value">alex.j@campus.edu</div>
      </div>
    </div>

    <div class="endpoint-list">
      <h3>Active REST API Endpoints</h3>
      <div class="endpoint-item"><span class="endpoint-method">GET</span><span class="endpoint-path"><a href="/api/health" target="_blank">/api/health</a> - System Health</span></div>
      <div class="endpoint-item"><span class="endpoint-method">GET</span><span class="endpoint-path"><a href="/api/items" target="_blank">/api/items</a> - Browse Lost & Found Items</span></div>
      <div class="endpoint-item"><span class="endpoint-method">POST</span><span class="endpoint-path">/api/auth/login - Authentication</span></div>
      <div class="endpoint-item"><span class="endpoint-method">POST</span><span class="endpoint-path">/api/auth/register - Student Registration</span></div>
      <div class="endpoint-item"><span class="endpoint-method">GET</span><span class="endpoint-path">/api/notifications - User Live Alerts</span></div>
    </div>
  </div>
</body>
</html>
    `);
  }

  res.status(200).json({
    service: 'Campus Lost & Found Portal API',
    status: 'online',
    version: '1.0.0',
    port: 5000,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      items: '/api/items',
      auth: '/api/auth',
      users: '/api/users',
      notifications: '/api/notifications',
      admin: '/api/admin',
    },
    clientUrl: 'http://localhost:5173',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Campus Lost & Found Portal API',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
