import React from 'react';
import './App.css';

function FPSInput({ value, onChange }) {
  return (
    <div className="fps-input-container">
      <label>FPS:</label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder="Enter FPS (24)"
        style={{
          width: '80px',
          textAlign: 'right', // Right-align the text inside the input
          color: 'white',
          backgroundColor: '#000', // Optional: dark background for visibility
          border: '1px solid #666', // Optional: visible border
          fontFamily: 'Arial, sans-serif'
        }}
      />
    </div>
  );
}


export default FPSInput;
