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
    question: "1.Why are you here today?",
    options: ["To bring you on board", "To see if you're the one", "To assess your skills", "To check if you bring coffee with you"],
    correctAnswer: "To bring you on board"
  },
  {
    question: "2.What do you call a programmer who loves nature?",
    options: ["A code farmer", "A debugger", "A tree maker", "An eco-logical coder"],
    correctAnswer: "A code farmer"
  },
  {
    question: "3.What motivates you to keep coding?",
    options: ["Solving complex problems", "Seeing my code come to life", "Fixing bugs", "The sound of the keyboard"],
    correctAnswer: "Seeing my code come to life"
  },
  {
    question: "4.What’s your favorite excuse when your code breaks?",
    options: ["It worked yesterday!", "The server's down", "It’s a feature, not a bug", "I didn’t touch it!"],
    correctAnswer: "It’s a feature, not a bug"
  },
  {
    question: "5.How do you feel about comments in code?",
    options: ["They’re essential", "Only when absolutely necessary", "I prefer minimal comments", "Comments? What comments?"],
    correctAnswer: "They’re essential"
  }
];

const players = {};

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Start the game with the first question for the newly connected player
  currentQuestionIndex = 0;
  io.emit('question', questions[currentQuestionIndex]);

  // Handle answer submission
  socket.on('submit_answer', (data) => {
    const { answer, playerName } = data;
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;

    // Save player name if not already saved
    if (!players[socket.id]) {
      players[socket.id] = playerName;
    }

    if (answer === correctAnswer) {
      io.emit('result', { result: 'correct', player: players[socket.id], answer });

      // Move to the next question if there are more questions
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        io.emit('question', questions[currentQuestionIndex]); 
      } else {
        // End the game and send a personalized message
        io.emit('end_game', { message: `Game Completed. Thank you, ${players[socket.id]}, for participating!` });
      }
    } else {
      io.emit('result', { result: 'wrong', player: players[socket.id], answer });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Remove the player from the players object
    delete players[socket.id];
  });
});

server.listen(4000, () => {
  console.log('Listening on port 4000');
});
