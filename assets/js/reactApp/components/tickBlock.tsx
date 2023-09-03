import React from "react";
const TickBlock = ({ id, isCross }) => {
  const renderIcon = () => {
    switch (isCross) {
      case true:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-white pointer-events-none select-none duration-300 h-full w-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 20 20 4M4 4 20 20"></path>
          </svg>
        );
      case false:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-white pointer-events-none select-none duration-300 h-full w-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728"></path>
          </svg>
        );
      default:
        null;
    }
  };
  return (
    <div
      id={id}
      className="game-screen__cell flex items-center justify-center sm:w-28 mb-4 sm:h-28 w-20 h-20 bg-transparent border-white border-2 rounded-xl bg-white bg-opacity-0 hover:bg-opacity-25 duration-300">
      {renderIcon()}
    </div>
  );
};

export default TickBlock;
