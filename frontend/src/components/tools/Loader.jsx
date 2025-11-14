// frontend/src/components/Loader.jsx
import React from 'react';
import '../../Loader.css';

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <div className="container">
        <div className="ball">
          <div className="inner">
            <div className="line" />
            <div className="line line--two" />
            <div className="oval" />
            <div className="oval oval--two" />
          </div>
        </div>
        <div className="shadow" />
      </div>
    </div>
  );
}

export default Loader;
