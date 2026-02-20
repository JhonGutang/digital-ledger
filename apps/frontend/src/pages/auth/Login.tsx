import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useLogin } from '../../hooks/auth/useAuth';
import { useAuthContext } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, Bolt, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: loginUser, isPending, isError, error } = useLogin();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(
      { email, password },
      {
        onSuccess: () => {
          navigate('/');
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 font-sans selection:bg-indigo-500/30">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 shadow-2xl shadow-indigo-500/20">
            <Bolt className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white font-display">Welcome Back</h1>
          <p className="mt-3 text-zinc-400">Enter your credentials to access the ledger</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-xl shadow-2xl rounded-3xl">
          <CardHeader className="p-10 pb-0">
            {isError && (
              <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20 flex items-center gap-3 mb-6">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="font-medium">{error?.message || 'Login failed'}</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-zinc-300 ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="rounded-xl border-zinc-800 bg-zinc-900 px-4 py-6 text-white placeholder-zinc-500 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all h-auto"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-semibold text-zinc-300 ml-1">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="rounded-xl border-zinc-800 bg-zinc-900 px-4 py-6 text-white placeholder-zinc-500 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all h-auto"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-indigo-600 py-7 text-base font-bold text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center p-6 border-t border-zinc-800/50">
             <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
              Secure Entry Point
            </p>
          </CardFooter>
        </Card>
        
        <p className="mt-8 text-center text-sm text-zinc-500">
          Digital Ledger MVP &bull; Property of Enterprise
        </p>
      </div>
    </div>
  );
};

export default Login;
