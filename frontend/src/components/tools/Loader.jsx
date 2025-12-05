import React from "react";

const Loader = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="loader-container">
        <div className="circle circle-1" />
        <div className="circle circle-2" />
        <div className="circle circle-3" />
        <div className="circle circle-4" />
      </div>
      <style>{`
        .loader-container {
          width: 3rem;
          height: 3rem;
          position: relative;
          animation: spin988 2s linear infinite;
        }

        .circle {
          width: 1.2rem;
          height: 1.2rem;
          background-color: #ea580c;
          border-radius: 50%;
          position: absolute;
        }

        .circle-1 {
          top: 0;
          left: 0;
        }

        .circle-2 {
          top: 0;
          right: 0;
        }

        .circle-3 {
          bottom: 0;
          left: 0;
        }

        .circle-4 {
          bottom: 0;
          right: 0;
        }

        @keyframes spin988 {
          0% {
            transform: scale(1) rotate(0);
          }
          20%, 25% {
            transform: scale(1.3) rotate(90deg);
          }
          45%, 50% {
            transform: scale(1) rotate(180deg);
          }
          70%, 75% {
            transform: scale(1.3) rotate(270deg);
          }
          95%, 100% {
            transform: scale(1) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
