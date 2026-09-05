import type { Metadata } from 'next'
import EventsListing from '@/components/events/EventsListing'

export const metadata: Metadata = {
  title: 'Events & Programs - matriXO',
  description: 'Explore upcoming workshops, hackathons, bootcamps, and technical events hosted by matriXO. Join thousands of students building their tech careers.',
  keywords: 'matriXO, technical workshops, hackathons, bootcamps, career events, ed-tech, coding workshops, student training, industry skills',
  openGraph: {
    type: 'website',
    url: 'https://matrixo.in',
    title: 'Events & Programs - matriXO',
    description: 'Explore upcoming workshops, hackathons, bootcamps, and technical events hosted by matriXO. Join thousands of students building their tech careers.',
    siteName: 'matriXO',
    images: [
      {
        url: '/logos/logo-dark.png',
        width: 1200,
        height: 630,
        alt: 'Events & Programs - matriXO',
        type: 'image/png',
      },
      {
        url: '/logos/logo-dark.png',
        width: 1080,
        height: 1080,
        alt: 'Events & Programs - matriXO',
        type: 'image/png',
      },
    ],
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Events & Programs - matriXO',
    description: 'Explore upcoming workshops, hackathons, bootcamps, and technical events hosted by matriXO.',
    images: ['/logos/logo-dark.png'],
    creator: '@matrixo',
  },
  other: {
    'instagram:card': 'summary_large_image',
    'instagram:title': 'Events & Programs - matriXO',
    'instagram:description': 'Explore upcoming workshops, hackathons, bootcamps, and technical events hosted by matriXO.',
    'instagram:image': 'https://matrixo.in/logos/logo-dark.png',
  },
}

export default function Home() {
  return <EventsListing />
}

