import React from 'react';
import { Navbar } from '@/components/navbar/navbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
    </div>
  )
}

