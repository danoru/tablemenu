import React, {useState} from "react";
import InputSearch from "./InputSearch"
import InventoryList from "./InventoryList"
import Header from "./Header";
import Footer from "./Footer";

function App() {
  const [inventory, setInventory] = useState([]);

  function addGame(inputText) {
    setInventory((prevInventory) => {
      return [...prevInventory, inputText];
    });
  }

  function resetMenu() {
    setInventory((prevInventory) => {
      return [];
    });
  }

  // I have temporarily removed the functionality for removing a single game from the list, this might be added back in later and so the code remains.

  // function removeGame(id) {
  //   setInventory((prevInventory) => {
  //     return prevInventory.filter((inventory, index) => {
  //       return index !== id;
  //     });
  //   });
  // }

  function generateMenu() {
    let chosenGame = inventory[Math.floor(Math.random() * inventory.length)]
    if (chosenGame === undefined) {
      alert("You must add games before generating a menu.")
    } else {
      alert("You should play "+chosenGame+".")
    }
  }

  function resetMenu() {
    setInventory((prevInventory) => {
      return [];
    });
  }

  return (
    <div>
      <Header />
      <div className="introduction">
        <p>Tablekeeper is a web application currently in development to manage your board game nights with efficiency and a bit of flair!</p>
      </div>
      <InputSearch onAdd={addGame}/>
      <div className="inventory">
        <h3>Inventory</h3> 
        <ul>
          {inventory.map((gameItem, index) => (
            <InventoryList
              key={index}
              id={index}
              text={gameItem}
              // onChecked={removeGame}
            />
          ))}
        </ul>
      </div>
      <button onClick={generateMenu}>Generate Menu</button>
      <button onClick={resetMenu}>Reset Menu</button>
      <Footer />
    </div>
  );
}

export default App;