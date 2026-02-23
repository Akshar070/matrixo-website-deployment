import { Metadata } from 'next'
import PublicProfile from './PublicProfile'

export const metadata: Metadata = {
  title: 'Profile | matriXO',
  description: 'View this user\'s matriXO public profile',
}

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  return <PublicProfile username={params.username} />
}
