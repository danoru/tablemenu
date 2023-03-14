import { useRouter } from "next/router";
import * as Gamelists from "../../../data/gamelists";

function ProfilePage() {
  const router = useRouter();
  const userId = router.query.userId;

  const userInventoryCheck = () => {
    if (userId === "Danoru") {
      return Gamelists.GAMELIST_MDM;
    } else if (userId === "Tommy") {
      return Gamelists.GAMELIST_TAD;
    } else {
      return Gamelists.GAMELIST_GROUP;
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
