// ===========================================================================
//                    MAC0425 -- INTELIGENCIA ARTIFICIAL
//                     PRIMEIRO EXERCICIO PROGRAMA(EP1)
// Evandro Augusto Nunes Sanches                       <evnsanches@ig.com.br>
// NUSP - 5388861
// ===========================================================================
"use strict";

// ---------------------------------------------------------------------------
// Nós da busca (Search nodes)
// ---------------------------------------------------------------------------

// Construtor da estrutura Nó da árvore de busca
var Node = function (action, parent, state, depth, g, h) {
	this.state = state;     // representação do estado do nó
	this.parent = parent;   // nó pai na árvore de busca
	this.action = action;   // ação que gerou o nó
	this.depth = depth;     // profundidade do nó na árvore de busca
	this.g = g;             // custo de caminho até o nó
	this.h = h;             // heurística de custo até meta
};


// Recupera o caminho (sequência de ações) do nó raiz até nó corrente.
Node.prototype.getPath = function () {
	var path = [];
	var node = this;
	while (node.parent !== null) {
		path.unshift(node.action);
		node = node.parent;
	}
	return path;
};


// ==========================================================================================
// Buscas não-informadas (cegas)


// ---------------------------------------------------------------------------
// Busca em Profundidade (Depth-First Search)
// ---------------------------------------------------------------------------
var DFS = function (problem) {

	// retorno da função: mantenha essa interface!!!
	// solução e estatísticas de busca
	var result = {
		solution: null,   // solução: sequência de ações
		generated: 0,     // número de nós gerados
		expanded: 0,      // número de nós expandidos
		ramification: 0   // fator de ramificação médio
	}

	// Implemente a busca em profundidade com busca em grafo
	var frontier = new Stack();
    var raiz = new Node(null, null, problem.initialState, 0, 0, null);
    result.generated += 1;
    
    //deveria ser explored para busca em grafo, mas para usar um Set, ficou added
    var added = new Set();  //representara explorado + borda
    var node = null;        //apontador para o no expandido
    var child = null;       //apontador para o no criado
    var actions = null;     //lista de acoes possivel no dado estado atual
    
    frontier.push(raiz);
    added.add(raiz.state);
    while(!frontier.empty()){
        node = frontier.pop();
        result.expanded += 1;
        //explored.push(node);
        var childstate = null;
        actions = problem.Actions(node.state);
        for(var act in actions){
            childstate = problem.Result(node.state, actions[act]);
            
            //se nao esta em frontier nem em explored->
              //-->modificado para "se nunca entrou em frontier"
            if(!added.hasElement(childstate)){
                child = new Node(actions[act], node, childstate, node.depth + 1,
                   node.g + problem.StepCost(node.state, actions[act]), null);
                result.generated += 1;
                if(problem.GoalTest(child.state)){
                    result.ramification = result.generated / result.expanded;
                    result.solution = child.getPath();
                    return result;
                }
                frontier.push(child);
                added.add(child.state);
            }
        }

    }
	return result; //return failure
};


// ---------------------------------------------------------------------------
// Busca em Largura (Breadth-First Search)
// ---------------------------------------------------------------------------
var BFS = function (problem) {

	// retorno da função: mantenha essa interface!!!
	// solução e estatísticas de busca
	var result = {
		solution: null,   // solução: sequência de ações
		generated: 0,     // número de nós gerados
		expanded: 0,      // número de nós expandidos
		ramification: 0   // fator de ramificação médio
	}

	// Implemente a busca em profundidade com busca em grafo
	var frontier = new Queue();
    var raiz = new Node(null, null, problem.initialState, 0, 0, null);
    result.generated += 1;
    
    //deveria ser explored para busca em grafo, mas para usar um Set, ficou added
    var added = new Set();  //representara explorado + borda
    var node = null;        //apontador para o no expandido
    var child = null;       //apontador para o no criado
    var actions = null;     //lista de acoes possivel no dado estado atual
    
    frontier.put(raiz);
    added.add(raiz.state);
    while(!frontier.empty()){
        node = frontier.get();
        result.expanded += 1;
        //explored.push(node);
        var childstate = null;
        actions = problem.Actions(node.state);
        for(var act in actions){
            childstate = problem.Result(node.state, actions[act]);
            
            //se nao esta em frontier nem em explored->
              //-->modificado para "se nunca entrou em frontier"
            if(!added.hasElement(childstate)){
                child = new Node(actions[act], node, childstate, node.depth + 1,
                   node.g + problem.StepCost(node.state, actions[act]), null);
                result.generated += 1;
                if(problem.GoalTest(child.state)){
                    result.ramification = result.generated / result.expanded;
                    result.solution = child.getPath();
                    return result;
                }
                frontier.put(child);
                added.add(child.state);
            }
        }

    }

	return result; // retorna falha se não encontrou solução
};



// ==========================================================================================
// Buscas informadas


// Heurística da distância de manhatttan: devolve a distância de manhattan
// entre a posição do tetraminó do estado s1 e a posição do tetraminó do estado s2
var manhattanDistance = function (s1, s2) {
	return Math.abs(s1.tetromino.xpos - s2.tetromino.xpos) + Math.abs(s1.tetromino.ypos - s2.tetromino.ypos);
};

var manhattanDistanceAdmissible = function (s1, s2) {
	// Modifique o cálculo da distância de manhattan para tornar a heurística admissível
	// ...
    var distX = Math.abs(s1.tetromino.xpos - s2.tetromino.xpos);
    var distY = Math.abs(s1.tetromino.ypos - s2.tetromino.ypos);
    //normalizando pela  altura maxima:

	return (distX + distY*1.0/22);
};

//Minha implementacao de uma heuristica melhorada
var minhaHeuristicaAdmissivel = function (s1, s2) {
	// ...
    var distX = Math.abs(s1.tetromino.xpos - s2.tetromino.xpos);
    var distY = Math.abs(s1.tetromino.ypos - s2.tetromino.ypos);
    var distR = Math.abs(s1.tetromino.next - s2.tetromino.next);
    //distancia de manhattan normalizanda na altura e acrescentada de rotacao:
        //deu errado !

	return (distX*1.0 + Math.max((distY - distX - distR), 0)*1.0/22 + distR*1.0);
};


// ---------------------------------------------------------------------------
// Busca de melhor escolha (Best-First Search)
// ---------------------------------------------------------------------------
var BestFS = function (problem) {

	// retorno da função: mantenha essa interface!!!
	// solução e estatísticas de busca
	var result = {
		solution: null,   // solução: sequência de ações
		generated: 0,     // número de nós gerados
		expanded: 0,      // número de nós expandidos
		ramification: 0   // fator de ramificação médio
	}

	// Implemente a busca de melhor escolha com busca em grafo
    var scoreFn = function(node) { return node.h; };
	var frontier = new PQueue(scoreFn);
    var raiz = new Node(null, null, problem.initialState, 0, 0, manhattanDistance(problem.initialState, problem.goalState));
    result.generated += 1;
    
    //deveria ser explored para busca em grafo, mas para usar um Set, ficou added
    var added = new Set();  //representara explorado + borda
    var node = null;        //apontador para o no expandido
    var child = null;       //apontador para o no criado
    var actions = null;     //lista de acoes possivel no dado estado atual
    
    frontier.put(raiz);
    added.add(raiz.state);
    while(!frontier.empty()){
        node = frontier.get();
        result.expanded += 1;
        //explored.push(node);
        var childstate = null;
        actions = problem.Actions(node.state);
        for(var act in actions){
            childstate = problem.Result(node.state, actions[act]);
            
            //se nao esta em frontier nem em explored->
              //-->modificado para "se nunca entrou em frontier"
            if(!added.hasElement(childstate)){
                child = new Node(actions[act], node, childstate, node.depth + 1,
                   node.g + problem.StepCost(node.state, actions[act]), 
                   manhattanDistance(childstate, problem.goalState));
                result.generated += 1;
                if(problem.GoalTest(child.state)){
                    result.ramification = result.generated / result.expanded;
                    result.solution = child.getPath();
                    return result;
                }
                frontier.put(child);
                added.add(child.state);
            }
        }
    }
	return result; // retorna falha se não encontrou solução
};


// ---------------------------------------------------------------------------
// Busca A*
// ---------------------------------------------------------------------------
var ASTAR = function (problem) {

	// retorno da função: mantenha essa interface!!!
	// solução e estatísticas de busca
	var result = {
		solution: null,   // solução: sequência de ações
		generated: 0,     // número de nós gerados
		expanded: 0,      // número de nós expandidos
		ramification: 0   // fator de ramificação médio
	}

	// Implemente a busca A* com busca em grafo
	// ...
    var scoreFn = function(node) { 
        return node.h + node.g; };
	var frontier = new PQueue(scoreFn);
    var raiz = new Node(null, null, problem.initialState, 0, 0, 
            manhattanDistanceAdmissible(problem.initialState, problem.goalState));
    result.generated += 1;
    
    //deveria ser explored para busca em grafo, mas para usar um Set, ficou added
    var added = new Set();  //representara explorado + borda
    var node = null;        //apontador para o no expandido
    var child = null;       //apontador para o no criado
    var actions = null;     //lista de acoes possivel no dado estado atual
    
    frontier.put(raiz);
    added.add(raiz.state);
    while(!frontier.empty()){
        node = frontier.get();
        result.expanded += 1;
        //explored.push(node);
        var childstate = null;
        actions = problem.Actions(node.state);
        for(var act in actions){
            childstate = problem.Result(node.state, actions[act]);
            
            //se nao esta em frontier nem em explored->
              //-->modificado para "se nunca entrou em frontier"
            if(!added.hasElement(childstate)){
                child = new Node(actions[act], node, childstate, node.depth + 1,
                   node.g + problem.StepCost(node.state, actions[act]), 
                   manhattanDistanceAdmissible(node.state, problem.goalState));
                result.generated += 1;
                if(problem.GoalTest(child.state)){
                    result.ramification = result.generated / result.expanded;
                    result.solution = child.getPath();
                    return result;
                }
                frontier.put(child);
                added.add(child.state);
            }
        }
    }
	// ...

	return result; // retorna falha se não encontrou solução
};
