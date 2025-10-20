import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Custom Skew Protection Demo',
  description: 'Next.js app with manual skew protection using __vdpl cookie',
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
