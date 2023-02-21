import { useState } from "react";
import InputSearch from "../../components/inventory/InputSearch";
import InventoryList from "../../components/inventory/InventoryList";
import SelectionList from "../../components/inventory/SelectionList";
import * as Constants from "../../helpers/constants";

function TableGen() {
  const [inventory, setInventory] = useState(Constants.GAMELIST_GROUP);
  const [gameSelection, setGameSelection] = useState([]);
  const [displayName, setDisplayName] = useState("Group Inventory");

  // FUNCTIONS FOR INVENTORY & SELECTION MANIPULATION

  function switchInventory() {
    if (inventory === Constants.GAMELIST_GROUP) {
      setDisplayName("MDM's Inventory");
      setInventory(Constants.GAMELIST_MDM);
    } else if (inventory === Constants.GAMELIST_MDM) {
      setDisplayName("TAD's Inventory");
      setInventory(Constants.GAMELIST_TAD);
    } else if (inventory === Constants.GAMELIST_TAD) {
      setDisplayName("Group Inventory");
      setInventory(Constants.GAMELIST_GROUP);
    }
  }

  function addGame(inputText) {
    setGameSelection((prevGameSelection) => {
      return [...prevGameSelection, inputText];
    });
  }

  function selectGame(gameItem) {
    setGameSelection((prevGameSelection) => {
      return [...prevGameSelection, gameItem];
    });
    console.log(gameSelection);
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
    return Math.floor(Math.random() * gameSelection.length);
  }

  function generateMenu() {
    const storage = {};
    if (gameSelection.length === 0) {
      alert("You must add games before generating a menu.");
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
        console.log({ i });
      }
      console.log(storage, Object.keys(storage));
      alert(
        "You should play " +
          Object.keys(storage)[0] +
          ", " +
          Object.keys(storage)[1] +
          ", " +
          Object.keys(storage)[2] +
          ", and " +
          Object.keys(storage)[3] +
          "."
      );
    }
  }

  return (
    <div>
      <div className="introduction">
        <p>
          TableGen is a quick, simplified version of the Tablekeeper
          application.
        </p>
        <p>
          <strong>How do I use TableGen?</strong>
        </p>
        <p>
          It's easy! Select your inventory on the left and click on the games
          that you would like added to the <strong>Selections</strong> pool.
          Once you have at least four <em>unique</em> games selected, press the{" "}
          <strong>Generate Menu</strong> button to create a menu of games to
          play.
        </p>
        <p>
          Duplicate items in the <strong>Selections</strong> pool will increase
          the item's chances of being selected, but will not be repeated in the
          final game menu. You can remove items from the Selections list by
          clicking on them or by clicking the <strong>Clear Menu</strong>{" "}
          button.
        </p>
      </div>
      <div className="container">
        <div className="left-content">
          <button onClick={switchInventory}>Switch Inventory</button>
          <div className="inventory">
            <h3>{displayName}</h3>
            <div className="inventory-content">
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
        </div>
        <div className="arrows">
          <p>➔</p>
        </div>
        <div className="right-content">
          <InputSearch onAdd={addGame} />
          <div className="selections">
            <h3>Selections</h3>
            <div className="selections-content">
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
          </div>
          <div className="menu-buttons">
            <button onClick={generateMenu}>Generate Menu</button>
            <button onClick={clearMenu}>Clear Menu</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableGen;
