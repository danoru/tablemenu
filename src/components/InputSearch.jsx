import React, {useState} from "react";
// import axios from "axios";

function InputSearch(props) {
  const [inputText, setInputText] = useState("");

  function handleChange(event) {
    const newValue = event.target.value;
    setInputText(newValue);
  }

  // Note to Self: This handleClick is for the eventual inclusion of the BGG API. Need to figure out how to turn XML into JSON to grab values from the API before this can work as intended.

  // function handleClick(event) {
  //   const newValue = event.target.value
  //   setInputText(newValue.replace(" ","+"));
  //   axios.get("https://www.boardgamegeek.com/xmlapi2/search?query="+inputText)
  //     .then((response) => {console.log(response.data)})
  // }

  return (
    <div className="search">
      <input onChange={handleChange} type="text" placeholder="Search Board Games" value={inputText}/>
      <button
        onClick={()=> {
          props.onAdd(inputText);
          setInputText("");
        }}
      >
        <span>Add</span>
      </button>
    </div> 
  )
}

export default InputSearch;