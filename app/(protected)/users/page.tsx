import { getUsers } from "@/actions/users";
import { db } from "@/lib/db";
// import Users from "@/components/users"
import { useQuery } from "@tanstack/react-query";

const UsersPage = async () => {
  const users = await getUsers();

  return (
    // TODO: to make a UsersPage
    <>
      <p></p>
    </>
  );
};

export default UsersPage;
