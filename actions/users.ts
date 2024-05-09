import { db } from "@/lib/db";

export const getUsers = async () => {
  try {
    const data = await db.user.findMany();

    return { data };
  } catch (error) {
    return { error: error };
  }
};
