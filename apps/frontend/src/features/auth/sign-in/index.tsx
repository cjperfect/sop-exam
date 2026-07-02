import { useEffect } from 'react'
import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

const ACCESS_TOKEN_KEY = 'token'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (token) {
      navigate({ to: redirect || '/', replace: true })
    }
  }, [navigate, redirect])

  return (
    <AuthLayout>
      <Card className='w-full max-w-sm min-w-[320px] gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>登录</CardTitle>
          <CardDescription>输入用户名和密码登录系统</CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
