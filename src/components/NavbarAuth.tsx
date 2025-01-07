// components/NavbarAuth.tsx
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server"
import { buttonVariants } from './ui/button'

export function AuthButtons() {
  return (
    <>
      <LoginLink
        postLoginRedirectURL="/dashboard"
        className={buttonVariants({
          variant: "outline",
          size: 'sm',
        })}
      >
        Sign in
      </LoginLink>

      <RegisterLink
        postLoginRedirectURL="/dashboard"
        className={buttonVariants({
          variant: "default",
          size: 'sm',
        })}
      >
        Get Started
      </RegisterLink>
    </>
  )
}