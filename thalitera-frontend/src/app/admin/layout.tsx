'use client';

import { AdminAuthProvider } from '@/components/admin-auth-provider';

/**
 * Admin layout component
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
} 