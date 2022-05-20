import React, {useState} from "react";
import InventoryList from "./InventoryList"
import InputSearch from "./InputSearch"
import Header from "./Header";
import Footer from "./Footer";


function App() {
  const [inventory, setInventory] = useState([]);

  function addGame(inputText) {
    setInventory((prevInventory) => {
      return [...prevInventory, inputText];
    });
  }

  function removeGame(id) {
    setInventory((prevInventory) => {
      return prevInventory.filter((inventory, index) => {
        return index !== id;
      });
    });
  }

  return (
    <div>
      <Header />
      <p>Tablekeeper is a web application currently in development to manage your board game nights with efficiency and a bit of flair!</p>
      <InputSearch onAdd={addGame}/>
      <div>
        <ul>
          {inventory.map((gameItem, index) => (
            <InventoryList
              key={index}
              id={index}
              text={gameItem}
              onChecked={removeGame}
            />
          ))}
          <li></li>
        </ul>
      </div>
      <Footer />
    </div>
  );
}

export default App;
