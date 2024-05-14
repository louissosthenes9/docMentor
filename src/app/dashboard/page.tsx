
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

const page = () => {
  const {getUser} = getKindeServerSession()
  const user = getUser()
  if(!user) redirect('/auth-callback?origin=dashboard');
  return (
      <div>
           
      </div>
  )
}

export default page