// === backend/server.js ===
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

const userChats = {}; // In-memory session store

// === Auth Route ===
// === JWT Authentication Route ===
app.post('/api/login', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: 'Username required' });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// === WebSocket Auth Middleware ===
// === WebSocket Middleware to Validate JWT ===
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Auth token required'));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// === WebSocket Events ===
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.username}`);

  userChats[socket.id] = [];

  // Handle incoming user messages
  socket.on('userMessage', async (msg) => {
    userChats[socket.id].push({ role: 'user', content: msg });
    socket.emit('typing', true);

    try {

      // Call OpenAI API with full chat context
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful support assistant.' },
          ...userChats[socket.id]
        ],
      });

      const reply = completion.data.choices[0].message.content;
      userChats[socket.id].push({ role: 'assistant', content: reply });

      socket.emit('typing', false);
      socket.emit('botMessage', { text: reply, timestamp: new Date() });
    } catch (err) {
      console.error('OpenAI Error:', err);
      socket.emit('typing', false);
      socket.emit('botMessage', { text: "Sorry, I can't respond right now.", timestamp: new Date() });
    }
  });

  socket.on('disconnect', () => {
    delete userChats[socket.id];
    console.log(`User disconnected: ${socket.user.username}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));