import React from "react";
import InputSearch from "./InputSearch"
import Header from "./Header";
import Footer from "./Footer";


function App() {
    
  return (
    <div>
      <Header />
      <p>Tablekeeper is a web application currently in development to manage your board game nights with efficiency and fun!</p>
      <InputSearch />
      {/* <div>
        <ul>
          <li></li>
        </ul>
      </div> */}
      <Footer />
    </div>
  );
}

export default App;
