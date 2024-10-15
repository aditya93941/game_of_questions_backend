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
    question: "Why are you here today?",
    options: ["To bring you on board", "To see if you're the one", "To assess your skills", "To check if you bring coffee with you"],
    correctAnswer: "To bring you on board"
  }
,
  {
    question: "What do you call a programmer who loves nature?",
    options: ["A code farmer", "A debugger", "A tree maker", "An eco-logical coder"],
    correctAnswer: "A code farmer"
  }
,
  {
    question: "What motivates you to keep coding?",
    options: ["Solving complex problems", "Seeing my code come to life", "Fixing bugs", "The sound of the keyboard"],
    correctAnswer: "Seeing my code come to life"
 }
,
  {
    question: "What’s your favorite excuse when your code breaks?",
    options: ["It worked yesterday!", "The server's down", "It’s a feature, not a bug", "I didn’t touch it!"],
    correctAnswer: "It’s a feature, not a bug"
  }
,
  {
    question: "How do you feel about comments in code?",
    options: ["They’re essential", "Only when absolutely necessary", "I prefer minimal comments", "Comments? What comments?"],
    correctAnswer: "They’re essential"
  }

];

io.on('connection', (socket) => {
  console.log('New client connected');
  
  currentQuestionIndex = 0;
  io.emit('question', questions[currentQuestionIndex]);

  socket.on('submit_answer', (data) => {
    const { answer, playerName } = data;
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;

    if (answer === correctAnswer) {
      io.emit('result', { result: 'correct', player: playerName, answer });
      
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        io.emit('question', questions[currentQuestionIndex]); 
      } else {
        io.emit('end_game', { message: 'Game Completed. Thanks for participating!' });
      }
    } else {
      io.emit('result', { result: 'wrong', player: playerName, answer });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Listening on port 4000');
});
