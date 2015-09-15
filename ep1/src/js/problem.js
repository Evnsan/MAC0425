"use strict";

var problem = (function () {

	// ---------------------------------------------------------------------------
	// Representação de Estado
	// ---------------------------------------------------------------------------

	var State = function (t, b, s) {
		this.tetromino = t;
		this.board = b;
		this.timestep = s;
	};

	State.prototype = {
		toString: function () {
			var to_s = "timestep = " + this.timestep;
			to_s    += ", tetromino ("+this.tetromino.xpos+", "+this.tetromino.ypos+")";
			to_s    += "= " + this.tetromino.type.toString();
			return to_s;
		}
	};

	// ---------------------------------------------------------------------------
	// Formulação do Problema de Busca
	// ---------------------------------------------------------------------------

	var Problem = function (board, tInit, tGoal) {
		this.initialState = new State(tInit, board, model.getTimesteps());
		this.goalState    = new State(tGoal, board, 1);
	};

	Problem.prototype = {

		// Actions(s): dado um estado s retorna as ações aplicáveis no estado s.
		Actions: function (s) {

			if (s.timestep === 0) {
				var t = s.tetromino.type;
				var x = s.tetromino.xpos, y = s.tetromino.ypos;
				if (!model.checkIntersection(s.board, t, x, y) && model.checkIntersection(s.board, t, x, y+1)) {
					return [];
				}
				else {
					return ["noop"];
				}
			}

			var applicable = [];
			var actions = model.getAllActions();
			for (var i = 0; i < actions.length; i++) {
				var a = actions[i];
				if (model.isValidAction(a, s.tetromino, s.board)) {
					applicable.push(a);
				}
			}
			return applicable;
		},


		// Result(s, a): dado um estado s e uma ação a,
		// devolve o estado resultante de aplicar a ação a no estado s.
		Result: function (s, a) {
			if (this.Actions(s).indexOf(a) === -1) {
				return undefined;
			}
			else {
				var tetromino = model.applyAction(a, s.tetromino, s.board, s.timestep);
				var nextTimestep = (s.timestep === 0 ? model.getTimesteps() : s.timestep-1);
				return new State(tetromino, s.board, nextTimestep);
			}
		},


		// GoalTest(s): dado um estado s devolve true se s é um estado meta.
		// Caso contrário, devolve false.
		GoalTest: function (s) {
			var checkType = s.tetromino.type.equals(this.goalState.tetromino.type);
			var checkPosition = (s.tetromino.xpos === this.goalState.tetromino.xpos) && (s.tetromino.ypos === this.goalState.tetromino.ypos);
			return checkType && checkPosition;
		},


		// StepCost(s, a): dado um estado s e uma ação a,
		// devolve o custo de se aplicar a ação a no estado s.
		StepCost: function (s, a) {
			return 1;
		}
	};

	return {
		Problem: Problem
	};

})();