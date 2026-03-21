import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../src/data/db";

const SAFE_USER_SELECT = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  email: true,
  location: true,
  website: true,
  bio: true,
  image: true,
  badge: true,
  joinDate: true,
} as const;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;

  if (req.method === "GET") {
    try {
      const user = await prisma.users.findUnique({
        where: { username: String(username) },
        select: SAFE_USER_SELECT,
      });

      if (!user) return res.status(404).json({ message: "User not found." });

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching user data." });
    }
  }

  if (req.method === "PUT") {
    const { username, firstName, lastName, email, location, website, bio } = req.body;

    try {
      const updatedUser = await prisma.users.update({
        where: { username },
        data: { firstName, lastName, email, location, website, bio },
        select: SAFE_USER_SELECT,
      });
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ message: "Error updating user data." });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ error: `Method ${req.method} is not allowed.` });
}

export default handler;
