import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Outdoor Adventure | Berea College Base Camp',
  description: 'Equipment reservation and inventory system for Berea College Outdoor Adventure Program.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
