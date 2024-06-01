
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req :NextApiRequest, res :NextApiResponse) {
  const { getUser } = getKindeServerSession()
  const user = getUser()

  if (!user) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  // Return the user data
  res.status(200).json(user)
}
