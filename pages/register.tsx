import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";

import RegistrationForm from "../src/components/account/RegistrationForm";

import { authOptions } from "./api/auth/[...nextauth]";

function RegisterPage() {
  return <RegistrationForm />;
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

export default RegisterPage;
