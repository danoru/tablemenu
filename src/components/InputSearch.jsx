import React, {useState} from "react";
import axios from "axios";

function InputSearch() {
  const [inputText, setInputText] = useState("");

  function handleChange(event) {
    const newValue = event.target.value;
    setInputText(newValue);
  }

  function handleClick(event) {
    const newValue = event.target.value;
    setInputText(newValue.replace(" ","+"));
    axios.get("https://www.boardgamegeek.com/xmlapi2/search?query="+inputText)
      .then((response) => {console.log(response.data)})
  }

  return (
    <div className="search">
      <input onChange={handleChange} placeholder="Search Board Games" value={inputText}/>
      <button onClick={handleClick}>Add</button>
    </div>
        
  )
}

export default InputSearch;