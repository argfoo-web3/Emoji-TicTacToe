import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { handleBotMove } from "./BotLogic";
import { useNetworkContext } from "../NetworkContext";
import tictactoe from "../game_logic/tictactoe.js";

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const isXNext = useRef(true);
  //const winner = calculateWinner(board);
  let winner = 0;
  const { state } = useLocation();
  const { clickedEmoji1, clickedEmoji2, easy, starter } = state || {};
  let p1 = starter? `${clickedEmoji1}`: `${clickedEmoji2}`;
  let p2 = starter? `${clickedEmoji2}`: `${clickedEmoji1}`;
  const [myRound, setMyRound] = useState(starter);
  const [wasm, setWasm] = useState(null);

  // Navigation hook
  const navigate = useNavigate();
  const networkContext = useNetworkContext();

  // Click handler for square
  const handleClick = (index) => {
    if(isXNext.current !== starter) return;
    processMove(index);
    //setMyRound(!starter);
    if (networkContext.conn.current) {
      networkContext.conn.current.send({move: true, index: index});
    }
  };

  const processMove = (index) => {
    /*if (board[index] || winner) {
      return;
    }
    const currentPlayer = isXNext.current ? p1 : p2;
    */
   if(wasm == null)
   {
    alert('wasm is still null!');
    return;
   }
    wasm.move(index, isXNext.current? 1: 2);
    setBoard(board => {
      const boardCopy = [...board];
      //boardCopy[index] = currentPlayer;
      boardCopy[index] = wasm.getBoard(index);
      return boardCopy;
    });
    isXNext.current = !isXNext.current;
    setMyRound(round => !round);
  }

  const receiveMessage = (data) => {
    if(data.move != null)
    {
      processMove(data.index);
    }
  }

  useEffect(() => {
    //initialize
    p1 = starter? `${clickedEmoji1}`: `${clickedEmoji2}`;
    p2 = starter? `${clickedEmoji2}`: `${clickedEmoji1}`;

    tictactoe().then(exports => {
      setWasm(exports);
    });
  }, []);

  useEffect(() => {
    if(wasm == null)
    {
      return;
    }
    var newBoard = Array(9).fill(null);
    // Loop through newBoard and set board value according to getBoard
    newBoard = newBoard.map((value, index) => wasm.getBoard(index));
    setBoard(newBoard);
    // Only start listening to messages when wasm is set
    networkContext.receiveCallback.current = receiveMessage;
  }, [wasm]);

  // Get game status
  const getStatus = useMemo(() => {
    if (winner !== 0) {
      if (winner === "🤖") {
        return `lol, ${winner} Won!`;
      } else {
        return `Congrats, ${winner} Won!`;
      }
    } else if (!board.includes(0)) {
      return "It's a draw!";
    }
  }, [board, winner]);

  // Effect to navigate to end screen when game ends
  useEffect(() => {
    if(wasm == null) {
      return;
    }
    winner = wasm.check_winner();
    if (winner != 0 || !board.includes(0)) {
      navigate("/end", {
        state: { getStatus: getStatus, winner: (winner === 0? 0: (winner ? p1 : p2)), clickedEmoji1, clickedEmoji2, easy },
      });
    }
  }, [getStatus, winner, board, navigate, clickedEmoji1, clickedEmoji2, easy]);

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(0));
    isXNext.current = true;
    setMyRound(starter);
  };

  // Render square button
  const renderSquare = (index) => (
    <button
      className="h-32 w-32 flex items-center justify-center text-4xl"
      onClick={() => handleClick(index)}
    >
      {
        board[index] === 0? null: ((board[index] === 1? p1: p2))
      }
    </button>
  );

  // Effect to handle bot move
  /*useEffect(() => {
    handleBotMove(
      board,
      isXNext,
      p1,
      p2,
      winner,
      navigate,
      getStatus,
      clickedEmoji1,
      clickedEmoji2,
      easy,
      setIsXNext,
      setBoard
    );
  }, [
    getStatus,
    winner,
    board,
    navigate,
    clickedEmoji1,
    clickedEmoji2,
    easy,
    isXNext,
    setIsXNext,
    setBoard,
    p1,
    p2,
  ]);*/
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="relative flex justify-between bg-white my-3 h-16 rounded-md select-none">
          <motion.div
            className="absolute bg-gray-300 h-full w-[50%] rounded-md z-10 top-0"
            animate={{ translateX: myRound ? 0 : 215 }}
          ></motion.div>
          <div className="text-5xl grow h-16 lg:mt-1 mt-3 z-20">{clickedEmoji1}</div>
          <div className="text-5xl grow h-16 lg:mt-1 mt-3 z-30">{clickedEmoji2}</div>
        </div>
        <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-md">
          {[0, 1, 2].map((row) => (
            <div key={row} className="grid grid-rows-3 gap-2">
              {[0, 1, 2].map((col) => (
                <div
                  key={col}
                  className="flex items-center justify-center bg-gray-300 rounded-md"
                >
                  {renderSquare(row * 3 + col)}
                </div>
              ))}
            </div>
          ))}
        </div>
        <button
          className="btn bg-red-700 text-white text-xl mt-4"
          onClick={resetGame}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

// Function to calculate winner
const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

export default TicTacToe;