$board = $('#board');

var cols = null;
var rows = null;

function onSubmit(){
  const url='api/createBoard';
  //get user input
  rows = document.getElementById("num_rows").value;
  cols = document.getElementById("num_cols").value;
  const mines = document.getElementById('num_mines').value;
  const userID = createUniqueID();
  $.post(url, {
    json_string: JSON.stringify({rows: rows, cols: cols, mines: mines, userID: userID})
  });
  createBoard(rows, cols);
  let form = document.getElementById('board-def');
  form.style.display = 'none';
  return false;
}

function createUniqueID(){
  //create random number for userID
  let userID = Math.floor((Math.random() * 1000000) + 1);
  return(userID);
}

function createBoard(r, c){

  //board generation through div
  for(let i =0; i < r; i++){
    const $row = $('<div>').addClass('row');
    for(let j = 0; j < c; j++){
      const $col = $('<div>').addClass('col hidden').attr('data-row', i).attr('data-col', j);
      $row.append($col);
    }
    $board.append($row);
  }
}

function gameOver(){
  //reveal all bombs, bring user to welcome page
}

$board.bind('contextmenu', function(e){
      //disable context menu if right-click on board and post data
      if(e.which == 3){
        e.preventDefault();
        $(this).click();


      }
});

$board.on('click', '.col.hidden', function(e){
    const url = 'api/selectSpace'
    //get index on grid of click location
    const $block = $(this);
    const rowVal = $block.data('row');
    const colVal = $block.data('col');

    if(e.which == 3 ){
      let thisSpace = $('.col.hidden[data-row=${rowVal}][data-col=${colVal}]');
      $('<div class=divText>' + '<|' + '</div>').appendTo(thisSpace);
      $.post(url, {
        json_string: JSON.stringify({rows: rowVal, cols: colVal, rightClick: "true"})
      });
    }

    //send row and col value in a string with JSON to url
    let data = $.post(url, {
      json_string: JSON.stringify({rows: rowVal, cols: colVal, rightClick: "false"})
    });
    data = data
    if(data == "gameOver"){
      gameOver();
    }
    else{
      var countRow = 0;
      var countCol = 0;

      for(i in data){

        if(i > cols){
          countCol=0;
          countRow++;
        }

        let curSpace = $('.col.hidden[data-row=${countRow}][data-col=${countCol}]');

        if(data[i] == '0'){
          clearSpace(curSpace);
        }
        else if(data[i] == 'f'){
          flagSpace(curSpace);
        }
        else{
          var numAdjacent = data[i];
          $('<div class=divText>' + numAdjacent + '</div>').appendTo(curSpace);
        }

        counCol++;

      }

    }
})