import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

function LogoutButton() {
  const router = useRouter();
  return (
    <span
      onClick={() => {
        signOut({ redirect: false }).then(() => {
          router.push("/");
        });
      }}
    >
      Logout
    </span>
  );
}

export default LogoutButton;
