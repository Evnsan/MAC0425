"use strict";

var controller = (function () {

	// constants
	var MODE   = { GAME:1, TEST:2 };
	var STATUS = { START:1, PLAYING:2, GAMEOVER:3, TESTOVER:4, STOP:5 };

	// game state
	var status;
	var board, tetromino, timestep;
	var totalLines, totalScore;
	var startTime;

	// goal configuration
	var goalTetromino;


	// search algorithms
	var searchStrategies = {
		"DFS": DFS,
		"BFS": BFS,
		"BestFS": BestFS,
		"ASTAR": ASTAR
	};

	// tests
	var testPieces;

	var init = function () {
		timestep = model.getTimesteps();
		totalLines = 0;
		totalScore = 0;
		startTime = Date.now();
		board = model.getEmptyBoard();

		tetromino = undefined;
		goalTetromino = undefined;

		// tests
		testPieces = [9, 13, 9, 5, 0];

		view.clear();
		view.update();
	};

	var start = function () {
		startNextRound();

		// search info
		console.log(view.getSearchType());
		console.log("Tamanho;Gerados;Expandidos;Ramificação")

		// go, dude!
		automaticPlayer();
	};

	var stop = function () {
		status = STATUS.STOP;
	};

	var startNextRound = function () {
		status = STATUS.START;
		timestep = model.getTimesteps();

		if (view.getGameMode()) {
			tetromino = model.getNewTetromino();
		}
		else {
			if (testPieces.length === 0) {
				status = STATUS.TESTOVER;
				tetromino = undefined;
				goalTetromino = undefined;
			}
			else {
				tetromino = model.getNewTetromino(testPieces.shift());
			}
		}
		view.update();
	};


	var automaticPlayer = function () {

		// goal formulation
		var goals = goal.goalFormulation(board, tetromino);

		// find solution
		var result;
		do {
			// select best goal so far
			goalTetromino = goals.pop();

			// problem formulation
			var p = new problem.Problem(board, tetromino, goalTetromino);

			// solve problem
			var method = view.getSearchType();
			result = searchStrategies[method](p);

		} while (goals.length > 0 && result === null);

		var solution = result.solution;
		if (solution) {
			// update search info
			var searchType = view.getSearchType();
			var stats = ">> " + searchType + "\n";
			stats    += "solução = " + solution.length + " ações \n";
			stats    += "gerados = " + result.generated + "\n";
			stats    += "expandidos = " + result.expanded + "\n";
			stats    += "ramificação = " + result.ramification.toFixed(2);
			view.setSolutionStats(stats);

			// log search information
			var info = solution.length + ";";
			info    += result.generated + ";";
			info    += result.expanded + ";";
			info    += result.ramification.toFixed(2) + "\n";
			console.log(info);

			// update view
			view.update();
			view.setSolutionTextInput(solution.join("\n"));

			// execute solution
			view.setStatusOutput("Executando solução!");
			executeSolution(solution, 100);
		}
	};

	var executeSolution = function (solution, deltatime) {

		status = STATUS.PLAYING;
		var timeRound = startTime;

		// play all actions
		var steps = solution.map(function (action) {
			return function () {
				if (status === STATUS.STOP) {
					init();
				}
				else {
					if (timeRound === startTime) {
						var valid = play(action);
						var output = valid ? "Ação '" + action + "' executada!" : "Ação inválida: " + action;
						view.setStatusOutput(output);
						view.update();
					}
				}
			};
		});

		// update status
		steps.push(function () {
			if (status === STATUS.STOP) {
				init();
			}
			else {
				if (timeRound === startTime) {
					model.addTetrominoToBoard(board, tetromino);
					var lines = model.removeCompletedLines(board);
					totalLines += lines;
					totalScore += model.getReward() * lines;
					var output = checkGoal() ? "A META FOI ATINGIDA!" : "A meta não foi atingida...";
					view.setStatusOutput(output);
					view.update();
				}
			}
		});

		// start next round
		steps.push(function () {
			if (status === STATUS.STOP) {
				init();
			}
			else {
				if (timeRound === startTime) {
					startNextRound();

					if (status === STATUS.TESTOVER) {
						view.setStatusOutput("FIM DE TESTE! Veja a saída no console...");
					}
					else if (checkGameOver()) {
						status = STATUS.GAMEOVER;
						view.setStatusOutput("GAME OVER!");
					}
					else {
						automaticPlayer();
					}
				}
			}
		});

		for (var i = 0; i < steps.length; i++) {
			setTimeout(steps[i], (i+1) * deltatime);
		}
	};

	var play = function (action) {

		// apply action if valid
		if (!model.isValidAction(action, tetromino, board)) {
			return false;
		}
		tetromino = model.applyAction(action, tetromino, board, timestep);

		// update solution display
		var actions = view.getSolutionTextInput().split("\n");
		actions = actions.slice(1);
		view.setSolutionTextInput(actions.join("\n"));

		// update timestep
		timestep = (timestep === 0) ? model.getTimesteps() : timestep-1;

		return true;
	};

	var checkGoal = function () {
		var checkType = (goalTetromino.type.next === tetromino.type.next);
		var checkPosition = (goalTetromino.xpos === tetromino.xpos && goalTetromino.ypos === tetromino.ypos);
		return (checkType && checkPosition);
	};

	var checkGameOver = function () {
		var type = tetromino.type;
		var xpos = tetromino.xpos;
		var ypos = tetromino.ypos;
		if (status === STATUS.START && model.checkIntersection(board, type, xpos, ypos)) {
			return true;
		}
		return false;
	};


	return {
		MODE: MODE,

		getBoard:  			function () { return board;  },
		getTetromino:		function () { return tetromino;  },
		getGoalTetromino: 	function () { return goalTetromino; },
		getTimestep:		function () { return timestep;   },
		getLines: 			function () { return totalLines; },
		getScore: 			function () { return totalScore; },

		init: 	init,
		start: 	start,
		stop: 	stop
	};

})();
