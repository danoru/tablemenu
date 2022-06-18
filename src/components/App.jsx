import React, {useState} from "react";
import InputSearch from "./InputSearch"
import InventoryList from "./InventoryList"
import Header from "./Header";
import Footer from "./Footer";

function App() {
  const [inventory, setInventory] = useState(["7 Wonders", "Arcana", "Ascension", "Battlestar Galactica", "The Binding of Isaac: Four Souls", "Borogrove", "Cards Against Humanity", "Carnival", "Catan", "Chili Mafia", "Citadels", "Creature Clash!", "CULTivate", "Eminent Domain", "Gloomhaven", "Inhuman Conditions", "Iwari", "Kabuto Sumo", "Munchkin Cthulu", "Munchkin Critical Role", "Pandemic", "Parks", "Radlands", "Root", "Scythe", "Seasons", "Sefirot", "Steven Universe: Beach-A-Palooza Card Battling Game", "Tang Garden", "Tapeworm", "Tichu", "Tidal Blades: Heroes of the Reef", "Trails", "The Twelve Doctors", "Veiled Fate", "Volfyirion", "Wingspan", "Your Friend is Sad", "Zombie Dice"]);
  let user = "Daniel";

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
    if (chosenGame === undefined) {
      alert("You must add games before generating a menu.")
    } else {
      alert("You should play "+chosenGame+".")
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
      <button onClick={generateMenu}>Generate Menu</button>
      <button onClick={resetMenu}>Reset Menu</button>
      <Footer />
    </div>
  );
}

export default App;