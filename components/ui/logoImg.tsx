import React from "react";
import logo from "./logo.png";

function logoImg() {
  // Import result is the URL of your image
  return (
    <div className="w-1/6">
      <img src={logo.src} alt="Logo" />
    </div>
  );
}

export default logoImg;
