import Link from "next/link";

import classes from "./header.module.css";

function Header() {
  return (
    <header className={classes.header}>
      <div className={classes.navbar}>
        <div>
          <Link href="/">
            <h1>Tablekeeper</h1>
          </Link>
        </div>
        <nav>
          <ul>
            <li>
              <Link href="/Login">Login</Link>
            </li>
            <li>
              <Link href="/TableGen">TableGen</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
