"use client";

import React from "react";

const Spinner = ({ size = 50, color = "#6a5acd", thickness = 4 }) => {
  const spinnerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    border: `${thickness}px solid rgba(106, 90, 205, 0.2)`,
    borderTop: `${thickness}px solid ${color}`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    display: "inline-block",
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={spinnerStyle} />
    </>
  );
};

export default Spinner;
