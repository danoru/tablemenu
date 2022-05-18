import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Button from "@mui/material/Button"

function App() {
  fetch()

  return (
    <div>
      <Header />
        <p>Tablekeeper is a web application currently in development to manage your board game nights with efficiency and fun!</p>
        <div className="search">
          <input type="search" placeholder="Board Game" />
          <Button>Add</Button>
        </div>
        <div>
          <ul>
            <li></li>
          </ul>
        </div>
      <Footer />
    </div>
  );
}

export default App;
