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
        <h1>Welcome to Tablekeeper!</h1>
        <p>Tablekeeper is a web application currently in development to manage your board game nights with efficiency and a bit of flair.</p>
        <p>If you are a <strong>first-time host</strong>, please create an account and start by creating your board game library.</p>
        <p>If you are a <strong>returning host</strong>, please log in to see your board game library.</p>
        <p>If you are a <strong>guest</strong>, please contact your host for your room code to enter below.</p>
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
          <button onClick={submitRoomCode} type="submit">Find Your Table</button>
        </div>
        </form>
      </div>
      <div class="home-redirect">
        <p>If you'd like to make use of the previous functionality, please visit the TableGen page.</p>
      </div>
    </div>
  </div>
  );
};

export default Home;