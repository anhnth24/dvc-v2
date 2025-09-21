import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../styles/globals.css';
import '../styles/components.css';

export const metadata: Metadata = {
  title: 'DVC v2',
  description: 'Hệ thống xử lý văn bản chính phủ - Frontend skeleton',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
