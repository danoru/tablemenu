import React from "react";

function InventoryList(props) {
  return (
    <div
      // onClick={() => {
      //   props.onChecked(props.id);
      // }}
    >
      <li>{props.text}</li>
    </div>
  );
}

export default InventoryList;
