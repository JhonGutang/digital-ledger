import { useState } from 'react';
import { useHealthCheck } from '../../hooks/useHealthCheck';
import { useAuthContext } from '../../context/AuthContext';
import LogoutConfirmModal from '../auth/LogoutConfirmModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bolt, LogOut, ShieldCheck, Activity } from 'lucide-react';

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toaster } from 'sonner';

export default function Layout() {
  const { data, isError, isLoading } = useHealthCheck();
  const { user, logout } = useAuthContext();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30 overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 relative h-full overflow-hidden">
        <header className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/80 backdrop-blur-xl shrink-0 z-50">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
              <Bolt className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight font-display">Digital Ledger</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <Badge variant="outline" className="px-3 py-1.5 bg-zinc-900/50 border-zinc-800 flex items-center gap-2">
              {isLoading ? (
                <span className="text-zinc-500 flex items-center gap-2">
                  <Activity className="h-3 w-3 animate-pulse" />
                  Validating...
                </span>
              ) : isError ? (
                <span className="text-red-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse"></span>
                  System Offline
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" />
                  {data?.status}
                </span>
              )}
            </Badge>
            
            <div className="h-6 w-px bg-zinc-800"></div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-zinc-100">{user?.email}</span>
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-bold px-2 py-0">
                  {user?.role}
                </Badge>
              </div>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setIsLogoutModalOpen(true)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg group"
              >
                <LogOut className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-0.5" />
                Sign out
              </Button>
            </div>
          </div>
        </header>
        
        <LogoutConfirmModal 
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={logout}
        />
        
        <main className="flex-1 flex flex-col p-8 w-full max-w-7xl mx-auto min-h-0 relative z-10 overflow-hidden">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
