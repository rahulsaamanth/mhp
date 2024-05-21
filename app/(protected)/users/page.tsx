import { getUsers } from "@/actions/users"
import { DataTable } from "@/components/data-table"
import { UserColumn, columns } from "./columns"

const UsersPage = async () => {
  const users = await getUsers()

  const columnData: UserColumn[] = users?.data!

  return (
    <div className="w-full py-10">
      <DataTable columns={columns} data={columnData} />
    </div>
  )
}

export default UsersPage
