'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const { isAdminAuthenticated } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center text-3xl animate-bounce">
            👨‍🍳
          </div>
          <span className="font-extrabold text-stone-300 text-sm tracking-wide font-display">
            Carregando Painel Administrativo...
          </span>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}
