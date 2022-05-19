import React from "react";
import axios from "axios";

import Header from "./Header";
import Footer from "./Footer";

import Autocomplete from "@mui/material/Autocomplete"
import TextField from "@mui/material/TextField"



function App() {
  axios.get("https://www.boardgamegeek.com/xmlapi2/thing?id=174430&type=boardgame&stats=1")
  .then((response) => {console.log(response.data)})
  
  const options = [{label: "Settlers of Catan", id: 1}, {label: "7 Wonders", id: 2}]

  return (
    <div>
      <Header />
        <p>Tablekeeper is a web application currently in development to manage your board game nights with efficiency and fun!</p>
        <div className="search">
          <Autocomplete disablePortal id="combo-box" sx={{ width: 300}} options={options} renderInput={(params) => <TextField {...params} label="Board Game"/>} />
        </div>
        {/* <div>
          <ul>
            <li></li>
          </ul>
        </div> */}
      <Footer />
    </div>
  );
}

export default App;
