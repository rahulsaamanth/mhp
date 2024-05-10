import { User } from "@/types";
import { getUserById } from "@/utils/user";

const UserPage = async ({ params }: { params: { id: string } }) => {
  const data: User | null = await getUserById(params.id);

  console.log(data);

  if (!data) return <h1>User not found!</h1>;
  return <div>{data?.orders?.map((order) => <div>{order.id}</div>)}</div>;
};

export default UserPage;
