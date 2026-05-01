// Service Categories
export const SERVICE_CATEGORIES = [
  'Tutoring',
  'Freelance',
  'Tech',
  'Design',
  'Photography',
  'Writing',
  'Other',
]

// Project Categories
export const PROJECT_CATEGORIES = [
  'Technology',
  'Marketing',
  'Research',
  'Creative',
  'Community',
  'Business',
  'Other',
]

// Availability Options
export const AVAILABILITY_OPTIONS = [
  'Flexible',
  'Weekdays',
  'Weekends',
  'Evenings',
  'By Appointment',
]

// Project Status
export const PROJECT_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
]

// Navigation Links
export const NAV_LINKS = [
  { href: '/discover', label: 'Discover' },
  { href: '/canvas', label: 'Canvas' },
  { href: '/projects', label: 'Projects' },
  { href: '/stories', label: 'Stories' },
]

// Footer Links
export const FOOTER_LINKS = {
  discover: [
    { href: '/discover', label: 'Services' },
    { href: '/projects', label: 'Projects' },
    { href: '/canvas', label: 'Canvas' },
    { href: '/stories', label: 'Stories' },
  ],
  account: [
    { href: '/auth/sign-in', label: 'Sign In' },
    { href: '/auth/sign-up', label: 'Sign Up' },
    { href: '/dashboard', label: 'Dashboard' },
  ],
  legal: [
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Terms of Service' },
    { href: '#', label: 'Contact' },
  ],
}
