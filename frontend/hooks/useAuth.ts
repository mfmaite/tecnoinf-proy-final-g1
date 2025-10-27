import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoading = status === 'loading'
  const isAuthenticated = !!session?.user

  const logout = async () => {
    await signOut({
      redirect: false,
      callbackUrl: '/login'
    })
    router.push('/login')
  }

  const getUser = () => {
    return session?.user || null
  }

  const getAccessToken = () => {
    return session?.accessToken || null
  }

  return {
    user: getUser(),
    accessToken: getAccessToken(),
    isLoading,
    isAuthenticated,
    logout,
  }
}
