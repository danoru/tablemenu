import { useRouter } from "next/router";
import {
  GAMELIST_GROUP,
  GAMELIST_MDM,
  GAMELIST_TAD,
} from "../../../src/data/gamelists";

function ProfilePage() {
  const router = useRouter();
  const userId = router.query.userId;

  const userInventoryCheck = () => {
    if (userId === "Danoru") {
      return GAMELIST_MDM;
    } else if (userId === "Tommy") {
      return GAMELIST_TAD;
    } else {
      return GAMELIST_GROUP;
    }
  };

  return (
    <div>
      <h1>Welcome, {userId}!</h1>
      <p>This page is still in development.</p>
    </div>
  );
}

export default ProfilePage;
