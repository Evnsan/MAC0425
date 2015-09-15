"use strict";

var model = (function () {

  // ---------------------------------------------------------------------------
  // game constants
  // ---------------------------------------------------------------------------

  // board layout parameters
  var WIDTH   = 12;
  var HEIGHT  = 22;

  var TIMESTEPS = 1;  // number of possible actions before tetromino drops
  var REWARD = 40;    // score gained by line completion

  // ---------------------------------------------------------------------------
  // tetris board
  // ---------------------------------------------------------------------------

  var Board = function () {
    this.width = WIDTH;
    this.height = HEIGHT;
    this.matrix = [];
    for (var i = 0; i < HEIGHT; i++) {
      this.matrix[i] = [];
      for (var j = 0; j < WIDTH; j++) {
        if (j === 0 || j === WIDTH-1 || i === HEIGHT-1) {
          this.matrix[i][j] = 1;
        }
        else {
          this.matrix[i][j] = 0;
        }
      }
    }
  };

  // ---------------------------------------------------------------------------
  // tetris pieces
  // ---------------------------------------------------------------------------

  var Tetromino = function (width, height, name, color, data, next) {
    this.width  = width;
    this.height = height;
    this.name   = name;
    this.color  = color;
    this.data   = data;
    this.next   = next;
  };

  Tetromino.prototype = {
    equals: function (t) {
      if (this.width !== t.width || this.height !== t.height ||
          this.name !== t.name   || this.color  !== t.color  ||
          this.data.length !== t.data.length || this.next !== t.next) {
        return false;
      }
      for (var i = 0; i < t.data.length; i++) {
        if (this.data[i] !== t.data[i]) {
          return false;
        }
      }
      return true;
    },
    toString: function () {
      var to_s = "name: " + this.name + ", data: " + this.data.toString();
      return to_s;
    }
  };

  var tetrominoes = [];
  tetrominoes[0]  = new Tetromino(4, 2, 'i', 'red', [0,0,0,0,1,1,1,1], 1);
  tetrominoes[1]  = new Tetromino(3, 4, 'i', 'red', [0,0,1,0,0,1,0,0,1,0,0,1], 2);
  tetrominoes[2]  = new Tetromino(4, 3, 'i', 'red', [0,0,0,0,0,0,0,0,1,1,1,1], 3);
  tetrominoes[3]  = new Tetromino(2, 4, 'i', 'red', [0,1,0,1,0,1,0,1], 0);
  tetrominoes[4]  = new Tetromino(2, 2, 'o', 'blue', [1,1,1,1], 4);
  tetrominoes[5]  = new Tetromino(3, 2, 't', 'cyan', [0,1,0,1,1,1], 6);
  tetrominoes[6]  = new Tetromino(3, 3, 't', 'cyan', [0,1,0,0,1,1,0,1,0], 7);
  tetrominoes[7]  = new Tetromino(3, 3, 't', 'cyan', [0,0,0,1,1,1,0,1,0], 8);
  tetrominoes[8]  = new Tetromino(2, 3, 't', 'cyan', [0,1,1,1,0,1], 5);
  tetrominoes[9]  = new Tetromino(3, 2, 's', 'green', [0,1,1,1,1,0],10);
  tetrominoes[10] = new Tetromino(3, 3, 's', 'green', [0,1,0,0,1,1,0,0,1],11);
  tetrominoes[11] = new Tetromino(3, 3, 's', 'green', [0,0,0,0,1,1,1,1,0],12);
  tetrominoes[12] = new Tetromino(2, 3, 's', 'green', [1,0,1,1,0,1], 9);
  tetrominoes[13] = new Tetromino(3, 2, 'z', 'magenta', [1,1,0,0,1,1], 14);
  tetrominoes[14] = new Tetromino(3, 3, 'z', 'magenta', [0,0,1,0,1,1,0,1,0], 15);
  tetrominoes[15] = new Tetromino(3, 3, 'z', 'magenta', [0,0,0,1,1,0,0,1,1], 16);
  tetrominoes[16] = new Tetromino(2, 3, 'z', 'magenta', [0,1,1,1,1,0], 13);
  tetrominoes[17] = new Tetromino(3, 2, 'j', 'gray', [1,0,0,1,1,1], 18);
  tetrominoes[18] = new Tetromino(3, 3, 'j', 'gray', [0,1,1,0,1,0,0,1,0], 19);
  tetrominoes[19] = new Tetromino(3, 3, 'j', 'gray', [0,0,0,1,1,1,0,0,1], 20);
  tetrominoes[20] = new Tetromino(2, 3, 'j', 'gray', [0,1,0,1,1,1], 17);
  tetrominoes[21] = new Tetromino(3, 2, 'l', 'orange', [0,0,1,1,1,1], 22);
  tetrominoes[22] = new Tetromino(3, 3, 'l', 'orange', [0,1,0,0,1,0,0,1,1], 23);
  tetrominoes[23] = new Tetromino(3, 3, 'l', 'orange', [0,0,0,1,1,1,1,0,0], 24);
  tetrominoes[24] = new Tetromino(2, 3, 'l', 'orange', [1,1,0,1,0,1], 21);

  // ---------------------------------------------------------------------------
  // tetris procedures
  // ---------------------------------------------------------------------------

  return {

    getBoardHeight: function () { return HEIGHT; },
    getBoardWidth:  function () { return WIDTH;  },
    getTimesteps:   function () { return TIMESTEPS; },
    getReward:      function () { return REWARD; },

    getEmptyBoard: function () { return new Board(); },

    getNewRandomBoard: function () {
      var board = new Board();
      for (var x = 1; x < board.width-1; x++) {
        var maxHeight = Math.floor(Math.random()*board.height/3);
        for (var y = board.height-2; y >= board.height-maxHeight-2; y--) {
          board.matrix[y][x] = 1;
        }
      }
      this.removeCompletedLines(board);
      return board;
    },

    getNewTetromino: function (id) {
      if (id === undefined) {
        id = Math.floor(Math.random()*tetrominoes.length);
      }
      var tetromino = tetrominoes[id];
      var x = Math.floor((WIDTH-tetromino.width)/2.0);
      var y = 0;
      return { type: tetromino, xpos: x, ypos: y };
    },

    getRotatedTetromino: function (tetromino) {
      return tetrominoes[tetromino.type.next];
    },

    getAllActions: function () { return ["drop", "noop", "left", "right", "down", "rotate"]; },

    getFinalConfigurations: function (board, tetromino) {
      var type = tetromino.type;
      var boardHeight = board.height;
      var boardWidth = board.width;

      var configurations = [];
      var t = type;
      var r = 0;
      do {
        configurations[r] = [];
        for (var x = 0; x < boardWidth; x++) {
          for (var y = boardHeight; y >=0 ; y--) {
            if (!model.checkIntersection(board, t, x, y) && model.checkIntersection(board, t, x, y+1)) {
              configurations[r].push({type:t, xpos:x, ypos:y});
            }
          }
        }
        t = tetrominoes[t.next];
        r++;
      } while (t.next !== type.next);

      return configurations;
    },

    isValidAction: function (action, tetromino, board) {
      if (action === "noop") { return true; }

      var t = tetromino.type, x = tetromino.xpos, y = tetromino.ypos;

      var valid;
      switch (action) {
        case "left":  valid = !this.checkIntersection(board, t, x-1, y);    break;
        case "right": valid = !this.checkIntersection(board, t, x+1, y);    break;
        case "drop":
        case "down":  valid = !this.checkIntersection(board, t, x, y+1);    break;
        case "rotate":
          valid = !this.checkIntersection(board, tetrominoes[t.next], x, y);
          break;
        default:
          valid = false;
          break;
      }
      return valid;
    },

    applyAction: function (action, tetromino, board, timestep) {
      var t = tetromino.type;
      var x = tetromino.xpos, y = tetromino.ypos;
      switch (action) {
        case "left":  x--;          break;
        case "right": x++;          break;
        case "down":  y++;          break;
        case "drop":
          while (!this.checkIntersection(board, t, x, y+1)) {
            y++;
          }
          break;
        case "rotate":
          t = tetrominoes[t.next];
          break;
      }
      if (timestep === 0 && !this.checkIntersection(board, t, x, y+1)) {
        y++;
      }
      return { type: t, xpos: x, ypos: y };
    },

    checkIntersection: function (board, t, x, y) {
      var height = t.height;
      var width  = t.width;

      for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
          var outOfBoard = (y+i >= board.height || x+j >= board.width);
          if (outOfBoard) { return true; }
          var intersectWithBoard = board.matrix[y + i][x + j] && t.data[i*width + j];
          if (intersectWithBoard) { return true; }
        }
      }
      return false;
    },

    addTetrominoToBoard: function (board, tetromino) {
      var height = tetromino.type.height;
      var width  = tetromino.type.width;
      var xpos = tetromino.xpos;
      var ypos = tetromino.ypos;
      for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
          board.matrix[ypos + i][xpos + j] |= tetromino.type.data[i*width + j];
        }
      }
    },

    removeCompletedLines: function (board) {
      var totalLines = 0;

      var boardWidth = board.width;
      var boardHeight = board.height;

      // calculate number of lines complete
      var i = boardHeight-2;
      while (i >= 0) {
        var lineComplete = true;

        // check if i-th line complete
        for (var j = 0; j < boardWidth; j++) {
          if (board.matrix[i][j] === 0) {
            lineComplete = false;
            break;
          }
        }

        if (lineComplete) {
          totalLines++;

          // scroll down board rows if i-th line complete
          for (var y = i; y > 0; y--) {
            for (var j = 0; j < boardWidth; j++) {
              board.matrix[y][j] = board.matrix[y-1][j];
            }
          }
        }
        else {
          i--;
        }
      }

      return totalLines;
    }
  };

})();
