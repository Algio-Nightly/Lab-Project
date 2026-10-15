import { useAuth } from "../context/AuthContext"

export default function Profile(){
  const { user } = useAuth()
  
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <h1 className='text-3xl font-bold text-gray-800'>Profile</h1>
      <p className='text-2xl font-bold text-gray-800'>{user.email}</p>
    </div>
  )
}