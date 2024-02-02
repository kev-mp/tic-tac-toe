const DEFAULT_CELL_VALUE = ' ';

function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board.push([]);
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    const resetBoard = () => {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                board[i][j].setValue(DEFAULT_CELL_VALUE);
            }
        }
    }
    const getBoard = () => board;
    const getRows = () => rows;
    const getCols = () => columns;

    const markBoard = (row, column, value) => {
        board[row][column].setValue(value);
    }

    const printBoard = () => {
        const newBoard = board.map((row) => row.map((cell) => cell.getValue()))
        console.log(newBoard);
    }

    return {
        getBoard,
        markBoard,
        printBoard,
        getRows,
        getCols,
        resetBoard
    }
}

function Cell() {
    let value = DEFAULT_CELL_VALUE;

    const setValue = (newValue) => {
        value = newValue;
    };

    const getValue = () => value;

    return {
        setValue,
        getValue
    }
}



function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
    ) {
    
    function PlayerRecord() {
        const row = [];
        const col = [];
        let diag = 0;
        let reverseDiag = 0;
    
        let maxRow = 0
        let maxCol = 0;
        let minDimension = 0;
    
        const populate = (rows, columns) => {
            for (let i = 0; i < rows; i++) {
                row[i] = 0;
            }
            for (let i = 0; i < columns; i++) {
                col[i] = 0;
            }
    
            minDimension = Math.min(rows, columns);
            maxRow = rows;
            maxCol = columns;
            diag = 0;
            reverseDiag = 0;
        }
    
        const winCheck = (r, c) => {
            row[r]++;
            col[c]++;
            if (r==c) diag+=1;
            let sum = Number(r) + Number(c) + 1;
            if (sum == minDimension) reverseDiag+= 1;
            if (row[r]==maxRow || col[c]==maxCol ||
                diag==minDimension || reverseDiag==minDimension) {
                    return true;
                } else {
                    return false;
                }
        }
        
        const getDiag = () => diag;
        const getReverseDiag = () => reverseDiag;
        return {
            populate,
            winCheck,
            getDiag,
            getReverseDiag
            
        }
    }

    const board = Gameboard();
  
    const players = [
        {
            name: playerOneName,
            token: 'X',
            record: PlayerRecord()
        },
        {
            name: playerTwoName,
            token: 'O',
            record: PlayerRecord()
        }
    ];

    let round = 1;
    let lastRound = 0;
    let gameOver = false;

    const getRound = () => round;
    const getGameOver = () => gameOver;
    const getLastRound = () => lastRound;

    const setLastRound = () => {
        lastRound = board.getRows() * board.getCols();
    }
    setLastRound();

    let activePlayer = players[0];

    const printNewRound = () => {
        board.printBoard();
        console.log(`${activePlayer.name}'s turn.`);
    };
    
    const resetGame = () => {
        players[0].record.populate(board.getRows(),board.getCols());
        players[1].record.populate(board.getRows(),board.getCols());
        activePlayer = players[0];
        board.resetBoard();
        printNewRound();
        setLastRound();
        round = 1;
        gameOver = false;
    };
    
    resetGame();
  
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;

    const playRound = (row, column) => { 
        if (gameOver == true || board.getBoard()[row][column].getValue() != DEFAULT_CELL_VALUE) {
            console.log('Impossible move');
            return;
        }     
        board.markBoard(row, column, activePlayer.token);
        
        if (activePlayer.record.winCheck(row,column)) {
            console.log(`${getActivePlayer().name} wins`);
            gameOver = true;
            return;
        } else {
            switchPlayerTurn();
            printNewRound();
            round++;
        }  
    };
  
    // For the console version, we will only use playRound, but we will need
    // getActivePlayer for the UI version, so I'm revealing it now
    return {
        playRound,
        getActivePlayer,
        resetGame,
        getRound,
        getLastRound,
        getGameOver,
        getBoard: board.getBoard
    };
}

(function ViewController() {
    const game = GameController();
    const boardDiv = document.querySelector('.board');
    const turnDiv = document.querySelector('.turn');
    const restartBtn = document.querySelector('.restart');

    const updateView = () => {
        boardDiv.textContent = "";
        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        if (game.getRound() > game.getLastRound()) {
            turnDiv.textContent = 'Draw...';
        } else {
            if (game.getGameOver()) {
                turnDiv.textContent = `${activePlayer.name} wins!`;
            } else {
                turnDiv.textContent = `${activePlayer.name}'s turn. Round ${game.getRound()}`;
            }
    
        }
        
        board.forEach((row, i) => {
            const newRow = document.createElement("div");
            row.forEach((cell, j) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add('cell');
                cellButton.dataset.row = i;
                cellButton.dataset.col = j;
                cellButton.textContent = cell.getValue();
                newRow.appendChild(cellButton);
            })
            boardDiv.appendChild(newRow)
        })
    }

    function boardClickHandler(e) {
        const cellDiv = e.target;
        
        if (cellDiv.classList != "cell") return;
        game.playRound(cellDiv.dataset.row, cellDiv.dataset.col);
        updateView();
    }
    boardDiv.addEventListener('click', boardClickHandler);
    
    function restartBtnHandler(e) {
        game.resetGame();
        updateView();
    }
    restartBtn.addEventListener('click', restartBtnHandler);

    updateView();

})();

