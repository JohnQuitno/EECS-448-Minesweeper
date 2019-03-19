var $_id = id => document.getElementById(id);

//Visual
var skullSymbol = "&#x1F480;";
var starSymbol = "&#x2b50;";
var flagSymbol = "&#9873;";
var spaceSymbol = "&nbsp;";
var bombSymbol = "&#x1F4A3;";

//Board Creation
var rows = 0;
var cols = 0;
var mines = 0;
var userID = "";
var ended = 0;
var isCheat = false;

//Timer
var time = $_id("time")
var seconds = 0;
var minutes = 0;
var hours = 0;
var t;


/**
    * Creates a new board and an empty leaderboard when the page is loaded
    */
window.onload=function()
{
    displayLeaderboard();
    resetBoard();
}


/**
    * Quickly sets the time variables
    */
function add()
{
    seconds++;
    if (seconds >= 60)
    {
        seconds = 0;
        minutes++;
        if (minutes >= 60)
        {
            minutes = 0;
            hours++;
        }
    }

    time.innerHTML = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
    timer();

}


/**
    * Increments add every 1 second
    */
function timer()
{
    t = setTimeout(add, 1000);
}
timer();


/**
    * Gets the values given by the user, assures proper input, and if everything looks okay, it runs createBoard
    */
function resetBoard(){
  const url='api/createBoard';
  clearTimeout(t);
  t = setTimeout(add, 1000);

  time.innerHTML = "00:00:00";
  seconds = 0; minutes = 0; hours = 0;
  rows = $_id("rows").value;
  cols = $_id("cols").value;
  mines = $_id('mines').value;
  userID = $_id("userID").value;
  ended = 0;

  message = $_id("message");
  message.innerHTML="&nbsp";
  if(rows < 2 || cols < 2){
    message.innerHTML='The board must have at least 2 rows and 2 columns.';
    message.style.color="red";
    return;
  }

  if (mines < 1) {
    message.innerHTML='The board must have at least one mine!';
    message.style.color="red";
    return;
  }

  if(mines >= (rows*cols)){
    message.innerHTML="Too many mines!!! The maximum number of mines for this board is "+(rows*cols-1);
    message.style.color="red";
    return;
  }

  $.post(url, {
    json_string: JSON.stringify({rows: rows, cols: cols, mines: mines, userID: userID})
  });
  createBoard(rows, cols);
}


/**
    * Creates the board.
    * @param {number} rows - The number of rows in the grid.
    * @param {number} cols - The number of columns in the grid.
    */
function createBoard(rows, cols){
  board.innerHTML="";
  for (let row=0;row<rows;row++) {
    $_id('board').innerHTML+='<br>';
    for (let col=0;col<cols;col++) {
        var id = 'id="cell-'+ row +'-'+ col +'"';
        var classname = 'class="cell" ';
        var onclick = 'onclick="leftClick('+ row +','+ col +')" ';
        var oncontext = 'oncontextmenu="rightClick('+ row +','+ col +'); return false"';
        var button = '<button '+ id + classname + onclick + oncontext + '>&nbsp;</button>';
        $_id('board').innerHTML += button;
    }
  }
}


/**
    * Updates the front-end board
    * @param {string} data - returns a string from the server side of what value is on a cell
    */
function updateBoard(data) {
    for(let i =0; i < rows; i++){
      for(let j = 0; j < cols; j++){
        var id = 'cell-' + i + '-' + j;
        if(data[i*cols+j] == '_'){
            $_id(id).style.background = '#BFCDF5';
            //do nothing
            $_id(id).innerHTML = spaceSymbol;
            $_id(id).style.color = "black";
        }
        else if(data[i*cols+j] == 'f'){
            $_id(id).innerHTML = flagSymbol;
            $_id(id).style.color = "red";
        }
        else if(data[i*cols+j] == 'b'){
            $_id(id).innerHTML = bombSymbol;
            //$_id(id).style.color = 'red';
        }
        else {
            var numAdjacent = data[i*cols+j];
            switch (numAdjacent) {
                case 0:
                    $_id(id).style.color = 'white'; break;
                case 1:
                    $_id(id).style.color = 'blue'; break;
                case 2:
                    $_id(id).style.color = 'green'; break;
                case 3:
                    $_id(id).style.color = 'red'; break;
                case 4:
                    $_id(id).style.color = 'purple'; break;
                case 5:
                    $_id(id).style.color = 'maroon'; break;
                case 6:
                    $_id(id).style.color = 'turquoise'; break;
                case 7:
                    $_id(id).style.color = 'black'; break;
                case 8:
                    $_id(id).style.color = 'black'; break;
            }
            $_id(id).style.background = '#EEE';
            if (numAdjacent!=0)
                $_id(id).innerHTML=numAdjacent;
        }
      }
    }
}


/**
    * Handles backend of when a cell is left clicked
    * @param {number} rows - The row clicked on
    * @param {number} cols - The col clicked on
    */
function leftClick(row,col) {
    const url = 'api/selectSpace'
    if (ended) {
        ended++;
        if (ended>3) alert("C'mon, the game ended. There's nothing you can do.");
        return;
    }

    if (isCheat) {
        alert("You have to turn off the cheat mode before continuing the game!!");
        return;
    }

    let data;
    //send row and col value in a string with JSON to url
    $.ajax({
      type: "POST",
      url: url,
      data: {
        json_string: JSON.stringify({rows: row, cols: col, rightClick: "false", userID: userID})
      },
      success: function(response){
        data = response;
      },
      dataType: 'text'
    }).done(function() {
        data = data.replace(/'/g, "\"");
        data = JSON.parse(data);
        if (data["status"] != "None") updateBoard(data);
        if (data["status"] == "Win") {
            gameOver(true);
        }
        if (data["status"] == "Lose") {
            gameOver(false);
        }
    });
}


/**
    * Handles backend of when a cell is right clicked
    * @param {number} rows - The row clicked on
    * @param {number} cols - The col clicked on
    */
function rightClick(row,col) {
    const url = 'api/selectSpace';
    if (ended) {
        ended++;
        if (ended>3) alert("C'mon, the game ended. There's nothing you can do.");
        return;
    }

    if (isCheat) {
        alert("You have to turn off the cheat mode before continuing the game!!");
        return;
    }

    let data;
    $.ajax({
      type: "POST",
      url: url,
      data: {
        json_string: JSON.stringify({rows: row, cols: col, rightClick: "true", userID: userID})
      },
      success: function(response){
        data = response;
      },
      dataType: 'text'
    }).done(function() {
      data = data.replace(/'/g, "\"");
      data = JSON.parse(data);
      if (data["status"] == "DoneF"){
        var id = 'cell-' + row + '-' + col;
        if ($_id(id).innerHTML == spaceSymbol) {
            $_id(id).innerHTML = flagSymbol;
            $_id(id).style.color = "red";
        }
        else {
            $_id(id).innerHTML = spaceSymbol;
            $_id(id).style.color = "black";
        }
      }
    });
}


/**
    * Updates the backend leaderboard
    * @constructor
    * @param {string} winTime - The time it took for the user to win
    */
function updateLeaderboard(winTime)
{
  winTime = parseInt(winTime.substr(0,2) * 3600) + parseInt(winTime.substr(3,2) * 60) + parseInt(winTime.substr(6));
  if(winTime<10)
  {
    winTime = "00" + winTime + userID;
  }
  else if(winTime<100)
  {
    winTime = "0" + winTime + userID;
  }
  else {
    winTime = winTime + userID;
  }
  const url = 'api/updateLeaderboard';
  $.ajax({
    type: "POST",
    url: url,
    data: {
      json_string: JSON.stringify({rows: rows, cols: cols, mines: mines, winTime: winTime})
    },
    success: function(response){
      data = response;
    },
  }).done(function() {
    printLeaderboard(data);
  })
}


/**
    * Assures proper values
    * @constructor
    * @param {string} winTime - The time it took for the user to win
    */
function displayLeaderboard(winTime)
{
  const url = 'api/displayLeaderboard';
  $.ajax({
    type: "POST",
    url: url,
    data: {
    },
    success: function(response){
      data = response;
    },
  }).done(function() {
    printLeaderboard(data);
  })
}


/**
    * Updates the frontend leaderboard
    * @constructor
    * @param {string} winTime - The time it took for the user to win
    */
function printLeaderboard(arr)
{
  arr = arr.replace(/, /g," ");
  arr = arr.replace(/"/g,"");
  arr = arr.replace("[","");
  arr = arr.replace("]","");
  let myArray = arr.split(" ");
  let ol = $_id("leaderboard");
  while(ol.firstChild) ol.removeChild(ol.firstChild);
  for(i=0;i<myArray.length;i++){
    let str = myArray[i];
    for(let i=0;i<str.length;i++)
    {
      if(i==(str.length-1)&&(!isNaN(str[i])))
      {
        let sec_num = parseInt(str, 10); // don't forget the second param
        let hours   = Math.floor(sec_num / 3600);
        let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        let seconds = sec_num - (hours * 3600) - (minutes * 60);
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        str = hours+':'+minutes+':'+seconds;
        console.log(time);
        str = str + " -- anonymous";
        break;
      }
      if(isNaN(str[i]))
      {
        let time = str.slice(0,i);
        let sec_num = parseInt(time, 10); // don't forget the second param
        let hours   = Math.floor(sec_num / 3600);
        let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        let seconds = sec_num - (hours * 3600) - (minutes * 60);
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        time = hours+':'+minutes+':'+seconds;
        console.log(time);
        str = time + " -- " + str.slice(i);
        break;
      }
    }
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(str));
    ol.appendChild(li);
  }
}


/**
    * Creates and adds functionality for Cheat Mode button
    * @constructor
    * @param
    */
function cheatModeToggle(){
  const url = 'api/cheatMode'
  if (ended) {
      ended++;
      if (ended>3) alert("C'mon, the game ended. There's nothing you can do.");
      return;
  }
  isCheat = !isCheat;
  if (isCheat) $_id("CheatModeBtn").innerHTML = "Cheat Mode On";
  else $_id("CheatModeBtn").innerHTML = "Cheat Mode Off";
  let data;
  //send row and col value in a string with JSON to url
  $.ajax({
    type: "POST",
    url: url,
    data: {
      json_string: JSON.stringify({cheatMode: isCheat, userID: userID})
    },
    success: function(response){
      data = response;
    },
    dataType: 'text'
  }).done(function() {
      data = data.replace(/'/g, "\"");
      data = JSON.parse(data);
      updateBoard(data);
  });
}


/**
    * Updates the frontend to let the user know they won the game
    * @constructor
    * @param {bool} isWon - Whether the game has ended in a win state
    */
function gameOver(isWon){
  ended=1;
  message = $_id("message");
  if(isWon){
    if((rows==10)&&(cols==10)&&(mines==10))
      updateLeaderboard(time.innerText);
    message.innerHTML="You've won $1B prize!!";
    message.style.color="green";
    for (let row=0;row<rows;row++)
    for (let col=0;col<cols;col++) {
        var id = 'cell-' + row + '-' + col;
        if ($_id(id).innerHTML == spaceSymbol) {
            if ($_id(id).style.color == 'white')
                $_id(id).innerHTML = starSymbol;
            else {
                $_id(id).innerHTML = bombSymbol;
                $_id(id).style.color = 'black';
                $_id(id).style.backgroundColor = 'green';
            }
        }
    }
  }
  else{
    message.innerHTML="You've lost :(";
    message.style.color="red";
    for (let row=0;row<rows;row++)
    for (let col=0;col<cols;col++) {
        var id = 'cell-' + row + '-' + col;
        if ($_id(id).innerHTML == '&nbsp;')
        if ($_id(id).style.color != 'white') {
            $_id(id).innerHTML = skullSymbol;
            $_id(id).style.color = 'black';
            $_id(id).style.backgroundColor = 'red';
        }

    }
  }
  clearTimeout(t);
}
