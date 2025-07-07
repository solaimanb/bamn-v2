'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getUser } from '@/lib/auth';

function AdminNav() {
  return (
    <nav className="flex flex-col">
      <Link href="/dashboard" className="block">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-none"
        >
          Overview
        </Button>
      </Link>
      <Link href="/dashboard/mentors" className="block">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-none"
        >
          Mentors
        </Button>
      </Link>
      <Link href="/dashboard/pending" className="block">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-none"
        >
          Pending Approvals
        </Button>
      </Link>
      <Link href="/dashboard/settings" className="block">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-none"
        >
          Settings
        </Button>
      </Link>
    </nav>
  );
}

function MentorNav() {
  return (
    <nav className="flex flex-col">
      <Link href="/dashboard" className="block">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-none"
        >
          Overview
        </Button>
      </Link>
      <Link href="/dashboard/profile" className="block">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-none"
        >
          My Profile
        </Button>
      </Link>
      <Link href="/dashboard/messages" className="block">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-none"
        >
          Messages
        </Button>
      </Link>
      <Link href="/dashboard/settings" className="block">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-none"
        >
          Settings
        </Button>
      </Link>
    </nav>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = getUser();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">
                {user.role === 'admin' ? 'BAMN Admin' : 'BAMN Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {user.full_name}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64">
            <Card className="p-0">
              {user.role === 'admin' ? <AdminNav /> : <MentorNav />}
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Card>
              {children}
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
} 