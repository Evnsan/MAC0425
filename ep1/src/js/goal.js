"use strict";

// ---------------------------------------------------------------------------
// goal formulation
// ---------------------------------------------------------------------------

var goal = (function () {

	var copyBoard = function (board, tetromino) {
		var matrix = board.matrix.map(function (row) { return row.slice(); });
	    var board = { height:board.height, width:board.width, matrix:matrix };
	    model.addTetrominoToBoard(board, tetromino);
	    return board;
	};

	var aggregateHeight = function (board, tetromino) {
		var board = copyBoard(board, tetromino);
		model.removeCompletedLines(board);

		var boardHeight = board.height;
		var boardWidth = board.width;

	    var total = 0;
	    for (var j = 1; j < boardWidth-1; j++) {
			var colHeight = boardHeight-1;
			var i = 0;
			while (i < boardHeight-1 && board.matrix[i][j] === 0) {
				colHeight--;
				i++;
			}
			total += colHeight;
	    }
	    return total;
	};

	var completeLines = function (board, tetromino) {
		var board = copyBoard(board, tetromino);
		return model.removeCompletedLines(board);
	};

	var emptyHoles = function (board, tetromino) {
		var board = copyBoard(board, tetromino);
		model.removeCompletedLines(board);

		var boardHeight = board.height;
		var boardWidth = board.width;

	    var total = 0;
	    for (var j = 1; j < boardWidth-1; j++) {
			var colHoles = 0;
			for (var i = 0; i < boardHeight-1; i++) {
				if (board.matrix[i][j] === 1) {
					var k = i+1;
					while (k < boardHeight-1 && board.matrix[k][j] === 0) {
						colHoles++;
						k++;
					}
				}
			}
			total += colHoles;
		}
	    return total;
	};

	var bumpiness = function (board, tetromino) {
		var board = copyBoard(board, tetromino);
		model.removeCompletedLines(board);

		var boardHeight = board.height;
		var boardWidth = board.width;

	    var heights = [];
	    for (var j = 1; j < boardWidth-1; j++) {
			var colHeight = boardHeight-1;
			var i = 0;
			while (i < boardHeight-1 && board.matrix[i][j] === 0) {
				colHeight--;
				i++;
			}
			heights.push(colHeight);
	    }

	    var total = 0;
	    for (var k = 1; k < heights.length; k++) {
			total += Math.abs(heights[k] - heights[k-1]);
	    }
	    return total;
	};

	var score = function (board, tetromino) {
		var a = -0.6, heights = aggregateHeight(board, tetromino);
		var b =  1.5, lines   = completeLines(board, tetromino);
		var c = -0.4, holes   = emptyHoles(board, tetromino);
		var d = -0.2, bumps   = bumpiness(board, tetromino);

		var score = a*heights + b*lines + c*holes + d*bumps;
		return score;
	};

	var goalFormulation = function (board, tetromino) {
		var finalConfigurations = model.getFinalConfigurations(board, tetromino);

		var goalConfigurations = [];

		for (var i = 0; i < finalConfigurations.length; i++) {
			var configurations = finalConfigurations[i];
			for (var j = 0; j < configurations.length; j++) {
				goalConfigurations.push(configurations[j]);
			}
		}
		goalConfigurations.sort(function (a, b) {return score(board, a) - score(board, b);});

		return goalConfigurations;
	};

	return {
		goalFormulation: goalFormulation
	};

})();
