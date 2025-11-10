import { useState } from "react";
// import axios from "axios";

function InputSearch(props: any) {
  const [inputText, setInputText] = useState("");

  function handleChange(event: any) {
    const newValue = event.target.value;
    setInputText(newValue);
  }

  // Note to Self: This handleClick is for the eventual inclusion of the BGG API. Need to figure out how to turn XML into JSON to grab values from the API before this can work as intended.

  // Check out URL Encode when trying to implement this fully as spaces will not be the only issue when trying to convert names to a usable URL.

  // function handleClick(event) {
  //   const newValue = event.target.value
  //   setInputText(newValue.replace(" ","+"));
  //   axios.get("https://www.boardgamegeek.com/xmlapi2/search?query="+inputText)
  //     .then((response) => {console.log(response.data)})
  // }

  return (
    <div className="search">
      <input placeholder="Add Board Games" type="text" value={inputText} onChange={handleChange} />
      <button
        onClick={() => {
          props.onAdd(inputText);
          setInputText("");
        }}
      >
        <span>Add</span>
      </button>
    </div>
  );
}

export default InputSearch;
