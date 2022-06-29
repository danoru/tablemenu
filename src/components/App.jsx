import React, {useState} from "react";
import InputSearch from "./InputSearch"
import InventoryList from "./InventoryList"
import SelectionList from "./SelectionList"
import Header from "./Header";
import Footer from "./Footer";
import * as Constants from "./constants";

function App() {
  const [inventory, setInventory] = useState(Constants.GAMELIST_MDM);
  const [gameSelection, setGameSelection] = useState([]);

  // FUNCTIONS FOR INVENTORY & SELECTION MANIPULATION 

  function addGame(inputText) {
    setInventory((prevInventory) => {
      return [...prevInventory, inputText];
    });
  }

  function selectGame(gameItem) {
    setGameSelection((prevGameSelection) => {
      return [...prevGameSelection, gameItem]
    });
    console.log(gameSelection)
  }

  function clearMenu() {
    setGameSelection((prevGameSelection) => {
      return [];
    });
  }

  function removeGame(id) {
    setGameSelection((prevGameSelection) => {
      return prevGameSelection.filter((gameSelection, index) => {
        return index !== id;
      });
    });
  }

  // FUNCTIONS FOR MENU GENERATION

  function generateRandomIndex() {
    return Math.floor(Math.random() * gameSelection.length)
  }

  function generateMenu() {
    const storage = {};
    if (gameSelection.length === 0) {
      alert("You must add games before generating a menu.")
    } else {
      let chosenGameOne = gameSelection[generateRandomIndex()]; 
      let i = 0;
      while (i < 4) {  
        function generateUniqueGame(gameName) { 
          if (storage[gameName]) {
            generateUniqueGame(gameSelection[generateRandomIndex()]);
          } else {
            storage[gameName] = true; 
            i++;
          }
        }
        generateUniqueGame(gameSelection[generateRandomIndex()]);
        console.log({i})
      }
      console.log(storage, Object.keys(storage))
      alert("You should play "+Object.keys(storage)[0]+", "+Object.keys(storage)[1]+", "+Object.keys(storage)[2] +", and "+Object.keys(storage)[3]+".") 
    }
  }
  
  return (
    <div>
      <Header />
      <div className="introduction">
        <p>Tablekeeper is a web application currently in development to manage your board game nights with efficiency and a bit of flair!</p>
      </div>
      <div className="container">
        <div className="left-content">
          <InputSearch onAdd={addGame}/>
          <div className="inventory">
            <h3>Inventory</h3>
            <ul>
              {inventory.map((gameItem, index) => (
                <InventoryList
                  key={index}
                  id={index}
                  text={gameItem}
                  onChecked={selectGame}
                />
              ))}
            </ul>
          </div>
        </div>
        <div className="arrows">
          <p>➔</p>
        </div>
        <div className="right-content">
          <br></br> {/* This is temporary to test positioning. */}
          <div className="selections">
            <h3>Selections</h3>
            <ul>
              {gameSelection.map((selectedItem, index) => (
                <SelectionList
                  key={index}
                  id={index}
                  text={selectedItem}
                  onDelete={removeGame}
                />
              ))}
            </ul>
          </div>
          <div className="menu-buttons">
            <button onClick={generateMenu}>Generate Menu</button>
            <button onClick={clearMenu}>Clear Menu</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;