import { useMutation } from "../hooks/useMutation"
import { logoutFn } from "../routes/_authed"

export function Logout() {
  const logoutMutation = useMutation({
    fn: logoutFn,
  })
  return <button onClick={() => logoutMutation.mutate({})} className="text-red-600 hover:text-red-800 underline">Sign out</button>
}

