import Head from "next/head";

import classes from "./index.module.css";

function HomePage() {
  function submitRoomCode() {
    const tableRoomCode = document.getElementById("roomCode")!.innerHTML;
    if (tableRoomCode == "ABCDE") {
      alert(
        "Your room code " +
          tableRoomCode +
          "matches. If this were working, you'd be passed through now."
      );
    } else {
      alert(
        "Your room code did not match. Please contact your host and try again."
      );
    }
  }

  return (
    <div className={classes.home}>
      <Head>
        <title>Tablekeeper</title>
        <meta name="description" content="Find yourself a seat at the table!" />
      </Head>
      <div className={classes.homeContainer}>
        <div className={classes.homeIntroduction}>
          <h1>Welcome to Tablekeeper!</h1>
          <p>
            Tablekeeper is a web application currently in development to manage
            your board game nights with efficiency and a bit of flair.
          </p>
          <p>
            If you are a <strong>first-time host</strong>, please create an
            account and start by creating your board game library.
          </p>
          <p>
            If you are a <strong>returning host</strong>, please log in to see
            your board game library.
          </p>
          <p>
            If you are a <strong>guest</strong>, please contact your host for
            your room code to enter below.
          </p>
        </div>
        <div className={classes.roomCodeForm}>
          <form action="#">
            <div>
              <label htmlFor="roomCode">Room Code</label>
            </div>
            <div>
              <input
                className={classes.roomCodeInput}
                type="text"
                name="roomCode"
                placeholder="Enter Room Code"
              ></input>
            </div>
            <div>
              <button
                className={classes.roomCodeButton}
                onClick={submitRoomCode}
                type="submit"
              >
                Find Your Table
              </button>
            </div>
          </form>
        </div>
        <div className={classes.homeRedirect}>
          <p>
            If you'd like to make use of the previous functionality, please
            visit the TableGen page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
