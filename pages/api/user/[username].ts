import prisma from "../../../src/data/db";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;

  if (req.method === "GET") {
    try {
      const user = await prisma.users.findUnique({
        where: { username: String(username) },
      });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching user data." });
    }
  }

  if (req.method === "PUT") {
    const { username, firstName, lastName, email, location, website, bio } =
      req.body;

    try {
      const updatedUser = await prisma.users.update({
        where: { username },
        data: { firstName, lastName, email, location, website, bio },
      });
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ message: "Error updating user data." });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    return res
      .status(405)
      .json({ error: `Method ${req.method} is not allowed.` });
  }
}

export default handler;
