"use client";

import { getUsers } from "@/actions/users";
import { useQuery } from "@tanstack/react-query";

export default function Users() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  if (error) return <h1>{error.message}</h1>;
  if (data && data.data && data.data.length > 0)
    return (
      <div className="w-full bg-green-300">
        <h1 className="">{JSON.stringify(data.data)}</h1>
      </div>
    );
}
