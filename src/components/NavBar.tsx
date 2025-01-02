import React from 'react';
import MaxWidthWrapper from './MaxWidthWrapper';
import Link from 'next/link';
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server"; // Assuming this hook provides auth info
import { buttonVariants } from './ui/button';
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";
import {LogoutLink} from "@kinde-oss/kinde-auth-nextjs/components";

export default async function NavBar() {
   
   const {isAuthenticated} = getKindeServerSession();
   const isUserAuthenticated = await isAuthenticated();
   

  return (
    <nav className='sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 transition-all backdrop-blur-lg'>
      <MaxWidthWrapper>
        <div className='flex h-14 items-center justify-between border-b border-zinc-200'>
          <Link href="/" className="flex z-14 font-semibold">
            <span>docMentor.</span>
          </Link>

          {/* Mobile navbar goes here */}
          <div className="hidden items-center space-x-4 sm:flex">
            <Link
              href={'pricing'}
              className={buttonVariants({
                variant: "ghost",
                size: 'sm',
              })}
            >
              Pricing
            </Link>

            {isUserAuthenticated && (
               <>
               <LogoutLink
            postLogoutRedirectURL='/'
            className={
               buttonVariants({
                  variant:'default',
                  size:'sm'
               })
            }
            >Log out
            </LogoutLink>
               </>
            )}
            {!isUserAuthenticated && (
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
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
}
