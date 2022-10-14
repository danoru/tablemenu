function InventoryList(props) {
  return (
    <div
      onClick={() => {
        props.onChecked(props.text);
      }}
    >
      <li>{props.text}</li>
    </div>
  );
}

export default InventoryList;
