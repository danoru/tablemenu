import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../src/data/db";

interface FollowRequestBody {
  action: "follow" | "unfollow";
  followingUserId: number;
  userId: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { action, followingUserId, userId } = req.body as FollowRequestBody;

  try {
    if (action === "follow") {
      await prisma.following.create({
        data: {
          followingUserId,
          userId,
        },
      });

      return res.status(200).json({ message: "Successfully followed user." });
    }

    if (action === "unfollow") {
      await prisma.following.delete({
        where: {
          userId_followingUserId: {
            followingUserId,
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
  } finally {
    await prisma.$disconnect();
  }
}
