import { Link, useLocation } from 'react-router-dom';
import { Home, ListTree, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Chart of Accounts', path: '/accounts', icon: ListTree },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col w-64 border-r border-zinc-800 bg-zinc-950/50 min-h-screen">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <span className="font-semibold text-zinc-100 px-2">Navigation</span>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
          <Menu className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start text-left mb-1 transition-all',
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent'
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-zinc-800 text-xs text-zinc-500 text-center">
        Digital Ledger v1.0
      </div>
    </div>
  );
}
