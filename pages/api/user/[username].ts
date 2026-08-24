import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

// Fields safe to expose to anyone. `email` is intentionally omitted — it is
// private and must never be returned for another user's profile.
const PUBLIC_USER_SELECT = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  location: true,
  website: true,
  bio: true,
  image: true,
  badge: true,
  joinDate: true,
} as const;

// Adds private fields (email); only returned to the profile's own owner.
const PRIVATE_USER_SELECT = {
  ...PUBLIC_USER_SELECT,
  email: true,
} as const;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;

  if (req.method === "GET") {
    try {
      const session = await getServerSession(req, res, authOptions);
      // username is citext in Postgres — match its case-insensitivity here.
      const isOwnProfile =
        !!session?.user &&
        ((session.user as any).username as string).toLowerCase() === String(username).toLowerCase();

      const user = await prisma.users.findUnique({
        where: { username: String(username) },
        select: isOwnProfile ? PRIVATE_USER_SELECT : PUBLIC_USER_SELECT,
      });

      if (!user) return res.status(404).json({ message: "User not found." });

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching user data." });
    }
  }

  if (req.method === "PUT") {
    const { username } = req.query;
    const { firstName, lastName, location, website, bio } = req.body;

    if (!username || typeof username !== "string") {
      return res.status(400).json({ message: "Invalid username." });
    }

    const session = await getServerSession(req, res, authOptions);

    // username is citext in Postgres, and the GET above already compares
    // case-insensitively. Comparing raw here meant visiting your own profile
    // at a different case rendered an editable page whose save then 403'd.
    const isOwnProfile =
      !!session?.user &&
      ((session.user as any).username as string).toLowerCase() === username.toLowerCase();
    if (!isOwnProfile) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    // The client form enforces these with Yup, but the endpoint is reachable
    // directly — an unvalidated `website` becomes a link rendered to every
    // visitor of the profile.
    for (const [field, value, max] of [
      ["firstName", firstName, 50],
      ["lastName", lastName, 50],
      ["location", location, 100],
      ["bio", bio, 280],
    ] as const) {
      if (value === undefined || value === null) continue;
      if (typeof value !== "string") {
        return res.status(400).json({ message: `${field} must be text.` });
      }
      if (value.length > max) {
        return res.status(400).json({ message: `${field} must be ${max} characters or fewer.` });
      }
    }

    if (website !== undefined && website !== null && website !== "") {
      if (typeof website !== "string") {
        return res.status(400).json({ message: "Website must be text." });
      }
      let parsed: URL;
      try {
        parsed = new URL(website);
      } catch {
        return res.status(400).json({ message: "Website must be a full URL including https://" });
      }
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        return res.status(400).json({ message: "Website must be an http or https URL." });
      }
    }

    try {
      const updatedUser = await prisma.users.update({
        where: { username },
        data: { firstName, lastName, location, website, bio },
        select: PRIVATE_USER_SELECT,
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error updating user data." });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ error: `Method ${req.method} is not allowed.` });
}

export default handler;
