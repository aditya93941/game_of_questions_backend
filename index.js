const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server);

const questions = [
  {
    question: "Who is the CEO of IndroydLabs?",
    options: ["Shikhar Raj Agarwal", "Jane Smith", "Rohit Sharma", "Amit Kumar"],
    correctAnswer: "Shikhar Raj Agarwal"
  },
  {
    question: "What type of games does IndroydLabs manufacture?",
    options: ["Board Games", "Arcade Games and VR Simulators", "Mobile Games", "Puzzle Games"],
    correctAnswer: "Arcade Games and VR Simulators"
  },
  {
    question: "What technology does IndroydLabs use for payment solutions in entertainment venues?",
    options: ["QR Code Payments", "Blockchain Technology", "RFID-based Payment Solutions", "Credit Card Processing"],
    correctAnswer: "RFID-based Payment Solutions"
  },
  {
    question: "Which of the following venues can benefit from IndroydLabs' RFID solutions?",
    options: ["Amusement Parks", "Restaurants", "Hotels", "Grocery Stores"],
    correctAnswer: "Amusement Parks"
  },
  {
    question: "What type of marketing solutions does IndroydLabs provide for brands?",
    options: ["Traditional Advertising", "Experiential Marketing Solutions", "Online Marketing", "Affiliate Marketing"],
    correctAnswer: "Experiential Marketing Solutions"
  }
];

let currentQuestionIndex = 0;

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.emit('question', questions[currentQuestionIndex]);

  socket.on('answer', (data) => {
    const { player, answer } = data;
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;

    if (answer === correctAnswer) {
      io.emit('result', { player, result: 'correct' });
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        setTimeout(() => {
          io.emit('question', questions[currentQuestionIndex]);
        }, 2000);
      } else {
        io.emit('end_game', { message: "Game Completed. Thanks for participating!" });
      }
    } else {
      socket.emit('result', { player, result: 'wrong' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
