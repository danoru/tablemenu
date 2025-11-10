import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";

import LoginForm from "../src/components/account/LoginForm";

import { authOptions } from "./api/auth/[...nextauth]";

function LoginPage() {
  return <LoginForm />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
export default LoginPage;
