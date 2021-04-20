const GAME_TEXT = document.getElementById('gameTitle')
const RESTART_BUTTON = document.getElementById("restartButton")
const START_BUTTON = document.getElementById("startButton")
const winningMessageElement = document.getElementById('testmessage')
const continueButton = document.getElementById('continue')
const winningMessageTextElement = document.querySelector('[data-textMessage-text]')

const trybutton = document.getElementById('continuez')

let MAIN_BOARD = ["", "", "", "", "", "", "", "", ""];
const WINNING_COMBINATION = [
   [0, 1, 2],
   [3, 4, 5],
   [6, 7, 8],
   [0, 3, 6],
   [1, 4, 7],
   [2, 5, 8],
   [0, 4, 8],
   [2, 4, 6],
 ];
const PLAYER_1_TEXT = "X";
const PLAYER_2_TEXT = "O";
var CURRENT_PLAYER = PLAYER_1_TEXT;
var count = 0;
var player;
let playerMarker;
var gameStatus;
var gameKey = 123456;
var endpoint = 'http://184.72.178.43:8080/TicTacToeServer/tictactoeserver';
var gameReseter = 'http://184.72.178.43:8080/TicTacToeServer/tictactoeserver/reset';
var playerMove = 'http://184.72.178.43:8080/TicTacToeServer/tictactoeserver/move'
var checkGameInterval;
var showBoardInterval;

let gameStarted = false;
let currentPlayer = null;

function getBoard() {
   fetch(`${endpoint}/board?key=${gameKey}`)
   .then((response) => response.text())
   .then((response) => {
      updateBoard(response);      
   });
}

function updateBoard(response) {
   const data = response.split(':');
   let boardChanged = false;
   MAIN_BOARD.forEach((box, i) => {
      if (box != data[i]) {
         boardChanged = true;
         MAIN_BOARD[i] = data[i];
      }
   })
   const boxes = document.querySelectorAll('.box');
   boxes.forEach((box, i) => {
      box.innerText = data[i];
   });
   console.log({ boardChanged, currentPlayer })

   
   if (boardChanged) {
      GAME_TEXT.innerText = playerMarker === currentPlayer ? "Your move" : "waiting player move";
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      if (currentPlayer !== playerMarker) {
         setTimeout(getBoard, 1000);

      }
   } else if (!boardChanged && currentPlayer !== playerMarker) {
      setTimeout(getBoard, 1000);
   }
}
  

function waitPlayers() {
   fetch(`${endpoint}/check?key=${gameKey}`)
   .then((response) => response.text())
   .then((response) => {
      console.log("check", response)
      if (response == "true") {
         gameStarted = true;
         currentPlayer = "X";
         GAME_TEXT.innerText = playerMarker === currentPlayer ? "Your move" : "waiting player move";

         getBoard();

         return;
      }
      setTimeout(waitPlayers, 1000);
   });
}

// CONNECT TO GAME SERVER AND GET PLAYER 
function joinGame () {
   fetch(`${endpoint}/createGame?key=${gameKey}`)
   .then((response) => response.text())
   .then((response) => {
      if (response === "O" || response === "X") {
         playerMarker = response;
         GAME_TEXT.innerText = 'waiting for other player';
         waitPlayers();
      };
   })
}

// Reset the game 
function resetGame() {
   var xhr = new XMLHttpRequest();
   xhr.open("GET", gameServer + 'reset?key=' +gameKey, true);
   xhr.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
         gameStatus = this.responseText;
         if(gameStatus == 'EXIT'){
            gameReseter()
         } else if(gameStatus == 'NO GAME TO RESET'){
            winningMessageTextElement.innerHTML = "There is No Game to Reset";
         } else {
            console.log("ERROR");
         }
      }
   };
   xhr.send();
}

// Player movement
function playerMovement() {
   checkGameInterval = setInterval(checkGame, 1000);
   var xhr = new XMLHttpRequest();
   xhr.open("GET", playerMove + 'createGame?key=' +gameKey, true);
   xhr.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
         player = this.responseText;
         if(player == 'X' || player == 'O'){
            playerMarker = this.responseText;
            winningMessageTextElement.innerHTML = 'You are Player ' + this.responseText;
         } else {
            playerMarker = '';
         }
      }
   };
   xhr.send();
}

function gameResetertest(){
      count = 0;
      const x = document.getElementsByClassName("box");
      for(var i = 0; i < x.length; i++){
         x[i].innerText = "";
      }
      MAIN_BOARD.forEach((marker, index) =>{
         MAIN_BOARD[index] = null;
      });
      GAME_TEXT.innerText = "Game is Reset";
      winningMessageElement.classList.remove('show')
}


trybutton.addEventListener('click', function(){
   gameResetertest();});

RESTART_BUTTON.addEventListener("click", function(){
   fetch(`${endpoint}/reset?key=${gameKey}`).then(() => {
      const x = document.getElementsByClassName("box");
      for(var i = 0; i < x.length; i++){
         x[i].innerText = "";
      }
      MAIN_BOARD.forEach((marker, index) =>{
         MAIN_BOARD[index] = null;
      });
      GAME_TEXT.innerText = "Game is Reset";
      currentPlayer = null;
   })
})

RESTART_BUTTON.addEventListener("click", function(){
   const x = document.getElementsByClassName("box");
   for(var i = 0; i < x.length; i++){
      x[i].innerText = "";
   }
   MAIN_BOARD.forEach((marker, index) =>{
      MAIN_BOARD[index] = null;
   });
   GAME_TEXT.innerText = "Game is Reset";
})

const boxClicked = function(event){
   if (!event.target.classList.contains('box')) {
      return;
   }
   if (currentPlayer !== playerMarker) {
      return;
   } 
   let idNum = Number.parseInt(event.target.id);
   const y = Math.floor(idNum / 3);
   const x = idNum % 3;
   console.log({ x, y })
   fetch(`${endpoint}/move?key=${gameKey}&tile=${playerMarker}&x=${x}&y=${y}`)
      .then((response) => response.text())
      .then((response) => {
         updateBoard(response);
      })
   
   // let idNum = event.target.id;

   // console.log(MAIN_BOARD);
   // GAME_TEXT.innerText =  CURRENT_PLAYER == PLAYER_1_TEXT ? "Player O Turn's" : "Player X Turn's";
   // if(!MAIN_BOARD[idNum]){
   //    MAIN_BOARD[idNum] = CURRENT_PLAYER;
   //    event.target.innerText = CURRENT_PLAYER;
   //    count++;
   //    console.log(count);
   //    if(playerHasWon()){
   //       GAME_TEXT.innerHTML = CURRENT_PLAYER == PLAYER_1_TEXT ? "Player 1 Wins!" : "Player 2 Wins";
   //       winningMessageTextElement.innerText = CURRENT_PLAYER == PLAYER_1_TEXT ? "Player 1 Wins!" : "Player 2 Wins!";
   //       winningMessageElement.classList.add('show')
   //    }

   //    CURRENT_PLAYER = CURRENT_PLAYER == PLAYER_1_TEXT ? PLAYER_2_TEXT : PLAYER_1_TEXT;
   //    if(count === 9){
   //       document.getElementById('gameTitle').innerText = "Game is Draw";
   //       winningMessageTextElement.innerText = 'Game is Draw!'
   //       winningMessageElement.classList.add('show')
   //    }
   // }
}

document.getElementById('gameBoard').addEventListener('click', boxClicked)


const playerHasWon = function(){
   for (let i = 0; i <= 7; i++) {
      const winCondition = WINNING_COMBINATION[i];
      let a = MAIN_BOARD[winCondition[0]]; 
      let b = MAIN_BOARD[winCondition[1]];
      let c = MAIN_BOARD[winCondition[2]];
      if (a === null || b === null || c === null) {
          continue;
      }
      if (a === b && b === c) {
          console.log("TEST TEST");
         return true;
      }
   }
} 

START_BUTTON.addEventListener('click', joinGame)