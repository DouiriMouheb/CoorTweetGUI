// components/Logo.js
import React from 'react';

const Logo = ({ className, width = 200, height = 60 }) => (
  <svg 
    className={className}
    width={width}
    height={height}
    viewBox="0 0 400 80"
    xmlns="http://www.w3.org/2000/svg"
  >
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@500&display=swap');
        .main-text { font: 500 24px 'Comfortaa', sans-serif; fill: #00926c; }
        .powered-by { font: 500 14px 'Comfortaa', sans-serif; fill: #3d3d3c; }
      `}
    </style>
    
    {/* Main Text */}
    <text x="0" y="35" class="main-text">
      Coordinated Sharing Detection Service
    </text>
    
    {/* Powered By */}
    <text x="0" y="60" class="powered-by">
      powered by
      <tspan dx="5" fill="#00926c">CooRTweet</tspan>
    </text>
    
    {/* Optional Decorative Line */}
    <path 
      stroke="#00926c" 
      stroke-width="2" 
      d="M0 45 h 380"
    />
  </svg>
);

export default Logo;