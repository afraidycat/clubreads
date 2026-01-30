export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  is_premium: boolean
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export type Club = {
  id: string
  name: string
  description: string | null
  owner_id: string
  invite_code: string
  current_theme: string | null
  meeting_cadence: 'monthly' | '6-week'
  created_at: string
  updated_at: string
}

export type ClubMember = {
  id: string
  club_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

export type Theme = {
  id: string
  name: string
  description: string | null
  icon: string | null
  sort_order: number
}

export type BookStatus = 'nominated' | 'voting' | 'selected' | 'reading' | 'completed'

export type Book = {
  id: string
  club_id: string
  title: string
  author: string
  page_count: number | null
  cover_url: string | null
  goodreads_url: string | null
  theme_id: string | null
  status: BookStatus
  nominated_by: string | null
  selected_at: string | null
  completed_at: string | null
  created_at: string
}

export type BookVote = {
  id: string
  book_id: string
  user_id: string
  rank: 1 | 2 | 3
  created_at: string
}

export type Meeting = {
  id: string
  club_id: string
  book_id: string | null
  title: string
  scheduled_at: string
  location: string | null
  notes: string | null
  created_at: string
}

export type DiscussionQuestion = {
  id: string
  book_id: string
  question: string
  assigned_to: string | null
  sort_order: number
  created_at: string
}

// Extended types with relations
export type ClubWithMembers = Club & {
  members: (ClubMember & { profile: Profile })[]
  current_book?: Book
}

export type BookWithDetails = Book & {
  theme?: Theme
  nominated_by_profile?: Profile
  votes?: BookVote[]
  questions?: DiscussionQuestion[]
}

export type MeetingWithBook = Meeting & {
  book?: Book
}
