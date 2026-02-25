require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const http = require('http');
const { WebSocketServer } = require('ws');
const db = require('./src/db');
const setupPassport = require('./src/middleware/passport');
const authRoutes = require('./src/routes/auth');
const issueRoutes = require('./src/routes/issues');
const commentRoutes = require('./src/routes/comments');
const webhookRoutes = require('./src/routes/webhooks');
const userRoutes = require('./src/routes/users');

const app = express();
const server = http.createServer(app);

// WebSocket for real-time kanban updates
const wss = new WebSocketServer({ server, path: '/ws' });
const wsClients = new Set();

wss.on('connection', (ws) => {
  wsClients.add(ws);
  ws.on('close', () => wsClients.delete(ws));
});

function broadcast(event, data) {
  const message = JSON.stringify({ event, data });
  wsClients.forEach((client) => {
    if (client.readyState === 1) client.send(message);
  });
}

// Make broadcast available to routes
app.set('broadcast', broadcast);

// Webhook route MUST come before body parsers (needs raw body)
app.use('/api/webhooks', webhookRoutes);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'lair-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// Passport
setupPassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;

async function start() {
  await db.migrate();
  server.listen(PORT, () => {
    console.log(`Lair Issue Board API running on :${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
