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

  function generateRandomIndex() {
    return Math.floor(Math.random() * inventory.length)
  }

  function generateMenu() {
    const storage = {};
    if (inventory.length === 0) {
      alert("You must add games before generating a menu.")
    } else {
      let chosenGameOne = inventory[generateRandomIndex()]; 
      let i = 0;
      while (i < 3) {  
        function generateUniqueGame(gameName) { 
          if (storage[gameName]) {
            generateUniqueGame(inventory[generateRandomIndex()]);
          } else {
            storage[gameName] = true; 
            i++;
          }
        }
        generateUniqueGame(inventory[generateRandomIndex()]);
        console.log({i})
      }
      console.log(storage, Object.keys(storage))
      alert("You should play "+Object.keys(storage)[0]+", "+Object.keys(storage)[1]+", and "+Object.keys(storage)[2]+".") 
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