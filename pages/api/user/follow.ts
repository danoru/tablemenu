import { authOptions } from "@/lib/authOptions";
import prisma from "@data/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

interface FollowRequestBody {
  action: "follow" | "unfollow";
  followingUserId: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const userId = Number((session.user as any).id);
  const { action, followingUserId } = req.body as FollowRequestBody;

  if (!followingUserId || isNaN(Number(followingUserId))) {
    return res.status(400).json({ error: "Invalid followingUserId." });
  }

  if (userId === Number(followingUserId)) {
    return res.status(400).json({ error: "You cannot follow yourself." });
  }

  try {
    if (action === "follow") {
      await prisma.following.create({
        data: {
          followingUserId: Number(followingUserId),
          userId,
        },
      });
      return res.status(200).json({ message: "Successfully followed user." });
    }

    if (action === "unfollow") {
      await prisma.following.delete({
        where: {
          userId_followingUserId: {
            followingUserId: Number(followingUserId),
            userId,
          },
        },
      });
      return res.status(200).json({ message: "Successfully unfollowed user." });
    }

    return res.status(400).json({ error: "Invalid action." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to update follow status." });
  }
}
