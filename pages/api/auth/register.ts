import { hash } from "bcrypt";
import type { NextApiRequest, NextApiResponse } from "next";
import * as yup from "yup";
import prisma from "../../../src/data/db";

const schema = yup.object({
  username: yup
    .string()
    .min(5, "Username must be at least 5 characters long.")
    .required("Username is required."),
  password: yup
    .string()
    .min(5, "Password must be at least 5 characters long.")
    .required("Password is required."),
});

type ResponseData = { message?: string; error?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body;

    await schema.validate(body, { abortEarly: false });

    const { username, password } = body;

    const existingUser = await prisma.users.findUnique({ where: { username } });
    if (existingUser) return res.status(400).json({ error: "Username already exists." });

    const hashedPassword = await hash(password, 10);

    const user = await prisma.users.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return res.status(200).json({ message: "Registration successful." });
  } catch (err: any) {
    console.error("Registration error:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.errors.join(", ") });
    }

    return res.status(500).json({ error: "Internal server error." });
  }
}
