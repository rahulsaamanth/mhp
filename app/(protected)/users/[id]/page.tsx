import { getUserById } from "@/utils/user"

const UserPage = async ({ params }: { params: { id: string } }) => {
  const data = await getUserById(Number(params.id))

  if (!data) return <h1>User not found!</h1>
  return (
    <div>
      <ul>
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong>
            {value?.toString()}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UserPage
