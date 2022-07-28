import React from "react";
import "../styles/Home.css";

function Home() {
  function submitRoomCode() {
    console.log(document.getElementById("room-code").innerHTML)
  }

  return (
  <div className="home">
    <div className="home-container">
      <div className="home-introduction">
        <h1>Hello.</h1>
        <p>Tablekeeper is a web application currently in development to manage your board game nights with efficiency and a bit of flair!</p>
        <p>If you'd like to make use of the previous functionality, please visit the TableGen page.</p>
      </div>
      <div className="room-code-form">
        <form action="#">
        <div>
          <label htmlFor="roomCode">Room Code</label>
        </div>
        <div> 
          <input type="text" name="roomCode" placeholder="Enter Room Code"></input>
        </div>
        <div>
          <button onClick={submitRoomCode} type="submit">Let Me In</button>
        </div>
        </form>
      </div>
    </div>
  </div>
  );
};

export default Home;