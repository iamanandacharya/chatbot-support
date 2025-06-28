const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
require('dotenv').config();

const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('userMessage', async (msg) => {
    console.log('User:', msg);

    try {
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: msg }],
      });

      const reply = completion.data.choices[0].message.content;
      socket.emit('botMessage', reply);
    } catch (error) {
      console.error(error.message);
      socket.emit('botMessage', "Sorry, I couldn't process your request.");
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
