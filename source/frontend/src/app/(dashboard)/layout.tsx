import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <section className="container py-6">
      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-3">{/* Sidebar placeholder */}</aside>
        <main className="col-span-9">{children}</main>
      </div>
    </section>
  );
}
