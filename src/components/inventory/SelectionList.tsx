function SelectionList(props: any) {
  return (
    <div
      onClick={() => {
        props.onDelete(props.id);
      }}
    >
      <li>{props.text}</li>
    </div>
  );
}

export default SelectionList;
