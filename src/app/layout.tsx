import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClubReads - Run your book club on autopilot",
  description: "Voting, scheduling, discussion questions, reminders—all automated. You focus on reading. We handle the organizing.",
  keywords: ["book club", "reading", "discussion", "voting", "automation"],
  authors: [{ name: "ClubReads" }],
  openGraph: {
    title: "ClubReads - Run your book club on autopilot",
    description: "Voting, scheduling, discussion questions, reminders—all automated.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
