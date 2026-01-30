# ClubReads 📚

Run your book club on autopilot. Voting, scheduling, AI discussion questions, and reminders—all automated.

## Features

- **Democratic Voting**: Members nominate books and vote. The group decides fairly.
- **AI Discussion Questions**: Claude-generated questions assigned to members (Premium)
- **Theme Rotation**: Psychological thrillers, hidden gems, international fiction, and more
- **Email Notifications**: Book selected, voting open, meeting reminders (Premium)
- **Easy Invites**: Share a link, friends join instantly

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (Postgres + Auth)
- **Styling**: Tailwind CSS + custom theme
- **Payments**: Stripe ($19/year subscription)
- **Email**: Resend
- **AI**: Anthropic Claude API

## Getting Started

### 1. Set Up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project called "clubreads"
3. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
4. Go to **Project Settings > API** and copy your URL and anon key

### 2. Set Up Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create a product: "ClubReads Premium" at $19/year (recurring)
3. Copy the Price ID (starts with `price_`)
4. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`

### 3. Set Up Resend

1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain (or use their test domain for development)
3. Create API key

### 4. Set Up Anthropic

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key

### 5. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

### 6. Run Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pricing Model

- **Free**: 1 club, up to 6 members, basic voting
- **Premium ($19/year)**: Unlimited clubs & members, AI questions, email notifications

## Deployment

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy
5. Update Stripe webhook URL to production domain

## License

MIT
