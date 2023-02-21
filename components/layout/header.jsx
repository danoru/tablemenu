import Link from "next/link";
import classes from "./header.module.css";

function Header() {
  return (
    <header className={classes.header}>
      <div>
        <div>
          <Link href="/">
            <h1>Tablekeeper</h1>
          </Link>
        </div>
        <nav>
          <ul className={classes.navbar}>
            <li>
              <Link href="/login">Login</Link>
            </li>
            <li>
              <Link href="/tablegen">TableGen</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
