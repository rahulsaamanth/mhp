import { getUsers } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
// import Users from "@/components/users"
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

const UsersPage = async () => {
  const users = await getUsers();

  return (
    <>
      <ul>
        {users?.data?.map((user) => (
          <li key={user.id}>
            <Button variant="link">
              <Link href={`/users/${user.id}`}>{user.id}</Link>
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default UsersPage;
