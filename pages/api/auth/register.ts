import { hash } from "bcryptjs";
import type { NextApiRequest, NextApiResponse } from "next";
import * as yup from "yup";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import prisma from "@data/db";

const schema = yup.object({
  username: yup
    .string()
    .min(5, "Username must be at least 5 characters long.")
    .max(32, "Username must be at most 32 characters long.")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "Username may only contain letters, numbers, underscores, and dashes."
    )
    .required("Username is required."),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .required("Password is required."),
});

type ResponseData = { message?: string; error?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!rateLimit(`register:${clientIp(req)}`, 5, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many attempts. Please try again later." });
  }

  try {
    const body = req.body;

    await schema.validate(body, { abortEarly: false });

    const { username, password } = body;

    const existingUser = await prisma.users.findUnique({ where: { username } });
    if (existingUser) {
      // Deliberately vague — don't confirm which usernames exist.
      return res.status(400).json({ error: "That username can't be used. Please pick another." });
    }

    const hashedPassword = await hash(password, 10);

    await prisma.users.create({
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
