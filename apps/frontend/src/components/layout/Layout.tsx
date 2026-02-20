import { useState } from 'react';
import { useHealthCheck } from '../../hooks/useHealthCheck';
import { useAuthContext } from '../../context/AuthContext';
import LogoutConfirmModal from '../auth/LogoutConfirmModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Bolt, LogOut, Users, ShieldCheck, Activity } from 'lucide-react';

export default function Layout() {
  const { data, isError, isLoading } = useHealthCheck();
  const { user, logout } = useAuthContext();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30">
      <header className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
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
      
      <main className="flex-1 flex flex-col p-8 w-full max-w-7xl mx-auto">
        <Card className="rounded-3xl border-zinc-800 bg-zinc-900/40 p-12 text-center flex-1 flex flex-col items-center justify-center shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
          
          <div className="mb-8 p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <ShieldCheck className="h-12 w-12 text-indigo-500" />
          </div>
          
          <h2 className="text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
            Secure Infrastructure Active.
          </h2>
          <p className="text-zinc-400 max-w-lg mb-10 text-lg leading-relaxed">
            Your financial data is protected by industry-standard encryption and strict role-based access control.
          </p>
          
          {user?.role === 'Admin' && (
            <Button 
              asChild
              className="rounded-xl bg-indigo-600 px-8 py-6 text-base font-bold text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all h-auto"
            >
              <a href="/register">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </a>
            </Button>
          )}
        </Card>
      </main>
    </div>
  );
}
