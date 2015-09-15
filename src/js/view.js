"use strict";

var view = (function () {

  // constants
  var DOTSIZE = 20;

  /* Sketch game board on canvas. */
  var drawBoard = function () {
    var board = controller.getBoard();
    var height = board.height;
    var width  = board.width;

    background(255);
    stroke(255);
    rect(0,0,width*DOTSIZE-1,height*DOTSIZE-1);

    noStroke();
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        if (board.matrix[i][j] === 1) {

          // borders
          if (i === height - 1 || j === 0 || j === width - 1) {
            fill(41, 128, 185);
          }
          // lines
          else {
            fill(211, 84, 0);
          }

          rect(j*DOTSIZE, i*DOTSIZE, DOTSIZE, DOTSIZE);
        }
      }
    }
  };

  /* Sketch tetromino on canvas. */
  var drawTetromino = function () {
    var tetromino = controller.getTetromino();
    if (!tetromino) return;

    var t = tetromino.type;
    var x = tetromino.xpos;
    var y = tetromino.ypos;

    var width  = t.width;
    var height = t.height;
    var data   = t.data;
    var color  = t.color;

    fill(color);
    stroke('black');
    strokeWeight(1);

    for (var j = 0; j < height; j++) {
      for (var i = 0; i < width; i++) {
        if (data[i + width*j] == 1) {
          rect((x + i)*DOTSIZE, (y + j)*DOTSIZE, DOTSIZE, DOTSIZE);
        }
      }
    }
  };

  var drawGoalTetromino = function () {
    var tetromino = controller.getGoalTetromino();
    if (!tetromino) return;

    var t = tetromino.type;
    var x = tetromino.xpos;
    var y = tetromino.ypos;

    var width  = t.width;
    var height = t.height;
    var data   = t.data;

    fill(39, 174, 96, 0.5*255);
    stroke('black');
    strokeWeight(1);

    for (var j = 0; j < height; j++) {
      for (var i = 0; i < width; i++) {
        if (data[i + width*j] == 1) {
          rect((x + i)*DOTSIZE, (y + j)*DOTSIZE, DOTSIZE, DOTSIZE);
        }
      }
    }
  };

  var getGameMode = function () {
    return document.getElementById("mode-game").checked;
  };

  var getSearchType = function () {
    var e = document.getElementById("search-type")
    return e.options[e.selectedIndex].value;
  };

  var getSolutionTextInput = function () {
    return document.getElementById("solution-input").value;
  }

  var updateLines = function () {
    document.getElementById("lines").innerHTML = controller.getLines().toString();
  };

  var updateTimestep = function () {
    document.getElementById("timestep").innerHTML = controller.getTimestep().toString();
  };

  var updateScore = function () {
    document.getElementById("score").innerHTML = controller.getScore().toString();
  };

  var setSolutionTextInput = function (text) {
    document.getElementById("solution-input").value = text;
  };

  var setStatusOutput = function (text) {
    document.getElementById("status").innerHTML = text;
  };

  var setSolutionStats = function (stats) {
    document.getElementById("solution-stats").value = stats;
  };



  var setup = function () {
    controller.init();
    var width = controller.getBoard().width;
    var height = controller.getBoard().height;
    var tetrisCanvas = createCanvas(width*DOTSIZE, height*DOTSIZE);
    tetrisCanvas.parent('tetris-canvas');
    noLoop();
  };

  var draw = function () {
    drawBoard();
    drawTetromino();
    drawGoalTetromino();
    updateTimestep();
    updateScore();
    updateLines();
  };

  var clear = function () {
    setStatusOutput("Aperte START para jogar!");
    setSolutionTextInput("");
    setSolutionStats("");
  };

  return {
    setup: setup,
    draw: draw,

    update: function () { redraw(); },
    clear: clear,

    getGameMode: getGameMode,
    getSearchType: getSearchType,
    getSolutionTextInput: getSolutionTextInput,

    setSolutionTextInput: setSolutionTextInput,
    setStatusOutput: setStatusOutput,
    setSolutionStats: setSolutionStats
  };

})();

function setup() {
  view.setup();
}

function draw() {
  view.draw();
}
