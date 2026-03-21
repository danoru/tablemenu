import { useState } from "react";
function InputSearch(props: any) {
  const [inputText, setInputText] = useState("");

  function handleChange(event: any) {
    const newValue = event.target.value;
    setInputText(newValue);
  }

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
