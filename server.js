const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let currentQuestionIndex = 0;
const questions = [
  { question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], answer: '4' },
  { question: 'What is the capital of France?', options: ['Paris', 'London', 'Berlin', 'Madrid'], answer: 'Paris' },
  { question: 'What is the largest planet?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], answer: 'Jupiter' },
  { question: 'What is the boiling point of water?', options: ['50°C', '100°C', '150°C', '200°C'], answer: '100°C' },
  { question: 'What color is the sky?', options: ['Green', 'Blue', 'Red', 'Yellow'], answer: 'Blue' }
];

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Send the current question when a player joins
  socket.emit('question', questions[currentQuestionIndex]);

  socket.on('submit_answer', (data) => {
    const { answer, playerName } = data;
    const correctAnswer = questions[currentQuestionIndex].answer;

    if (answer === correctAnswer) {
      io.emit('result', { result: 'correct', player: playerName });
    } else {
      io.emit('result', { result: 'wrong', player: playerName });
    }

    // Move to next question or end game
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      io.emit('question', questions[currentQuestionIndex]);
    } else {
      io.emit('end_game', { message: 'Game Completed. Thanks for participating!' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Listening on port 4000');
});
