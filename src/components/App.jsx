import React, {useState} from "react";
import InputSearch from "./InputSearch"
import InventoryList from "./InventoryList"
import Header from "./Header";
import Footer from "./Footer";
import * as Constants from "./constants";

function App() {
  const [inventory, setInventory] = useState(Constants.GAMELIST);
  let user = "Daniel";

  function addGame(inputText) {
    setInventory((prevInventory) => {
      return [...prevInventory, inputText];
    });
  }

  function clearMenu() {
    setInventory((prevInventory) => {
      return [];
    });
  }

  // I have temporarily re-added the functionality for removing a single game from the list until feature is designed for voting on games to play and filtering for votes.

  function removeGame(id) {
    setInventory((prevInventory) => {
      return prevInventory.filter((inventory, index) => {
        return index !== id;
      });
    });
  }

  function generateMenu() {
    let chosenGame = inventory[Math.floor(Math.random() * inventory.length)]
    let chosenGameTwo = inventory[Math.floor(Math.random() * inventory.length)]
    let chosenGameThree = inventory[Math.floor(Math.random() * inventory.length)]

    if (chosenGame === undefined) {
      alert("You must add games before generating a menu.")
    } else {
      alert("You should play "+chosenGame+", "+chosenGameTwo+", and "+chosenGameThree+".") // Requires additional functionality to eliminate duplicate results.
    }
  }

  return (
    <div>
      <Header />
      <div className="introduction">
        <p>Tablekeeper is a web application currently in development to manage your board game nights with efficiency and a bit of flair!</p>
      </div>
      <InputSearch onAdd={addGame}/>
      <div className="inventory">
        <h3>{user}'s Inventory</h3> 
        <ul>
          {inventory.map((gameItem, index) => (
            <InventoryList
              key={index}
              id={index}
              text={gameItem}
              onChecked={removeGame}
            />
          ))}
        </ul>
      </div>
      <div>
        <button onClick={generateMenu}>Generate Menu</button>
        <button onClick={clearMenu}>Clear Menu</button>
      </div>
      <Footer />
    </div>
  );
}

export default App;