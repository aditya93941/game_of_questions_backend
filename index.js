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
  {
    question: "1.Who is the CEO of IndroydLabs?",
    options: ["Shikhar Raj Agarwal", "Jane Smith", "Rohit Sharma", "Amit Kumar"],
    correctAnswer: "Shikhar Raj Agarwal"
  },
  {
    question: "2.What type of games does IndroydLabs manufacture?",
    options: ["Board Games", "Arcade Games and VR Simulators", "Mobile Games", "Puzzle Games"],
    correctAnswer: "Arcade Games and VR Simulators"
  },
  {
    question: "3.What technology does IndroydLabs use for payment solutions in entertainment venues?",
    options: ["QR Code Payments", "Blockchain Technology", "RFID-based Payment Solutions", "Credit Card Processing"],
    correctAnswer: "RFID-based Payment Solutions"
  },
  {
    question: "4.Which of the following venues can benefit from IndroydLabs' RFID solutions?",
    options: ["Amusement Parks", "Restaurants", "Hotels", "Grocery Stores"],
    correctAnswer: "Amusement Parks"
  },
  {
    question: "5.What type of marketing solutions does IndroydLabs provide for brands?",
    options: ["Traditional Advertising", "Experiential Marketing Solutions", "Online Marketing", "Affiliate Marketing"],
    correctAnswer: "Experiential Marketing Solutions"
  }
];

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Send the current question to the new client
  socket.emit('question', questions[currentQuestionIndex]);

  // Handle answer submission
  socket.on('submit_answer', (data) => {
    const { answer, playerName } = data;
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;

    // Check if the answer is correct
    if (answer === correctAnswer) {
      io.emit('result', { result: 'correct', player: playerName, answer });
      
      // Move to the next question only if the answer is correct
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        io.emit('question', questions[currentQuestionIndex]);  // Broadcast the next question
      } else {
        io.emit('end_game', { message: 'Game Completed. Thanks for participating!' });
      }
    } else {
      // If the answer is wrong, emit the wrong result and keep the current question
      io.emit('result', { result: 'wrong', player: playerName, answer });
      io.emit('question', questions[currentQuestionIndex]);  // Re-send the same question to stay on it
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Listening on port 4000');
});
