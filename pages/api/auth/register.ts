import prisma from "../../../src/data/db";
import { NextApiRequest, NextApiResponse } from "next";
import { hash } from "bcrypt";
import * as yup from "yup";

const schema = yup.object().shape({
  username: yup
    .string()
    .min(5, "Username must be at least 5 characters long.")
    .required("Username is required."),
  password: yup.string().min(5, "Password must be at least 5 characters long."),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    await schema.validate(req.body);

    const { username, password } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: { username },
    });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists." });
    }

    const hashedPassword = await hash(password, 10);

    await prisma.users.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: "Success." });
  } catch (e) {
    if (e instanceof yup.ValidationError) {
      return res.status(400).json({ error: e.errors.join(", ") });
    }
    console.error({ e });
    res.status(500).json({ error: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
}

export default handler;
