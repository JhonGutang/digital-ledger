import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../../hooks/auth/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Accountant' // Default minimum valid role
  });
  
  const { mutate: registerUser, isPending, isError, error, isSuccess } = useRegister();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerUser(formData, {
      onSuccess: () => {
        setTimeout(() => navigate('/'), 2000);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6 font-sans selection:bg-emerald-500/30">
      <div className="w-full max-w-2xl">
        <div className="mb-10 flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 shadow-2xl shadow-emerald-500/20">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-display">Create User Account</h1>
            <p className="text-zinc-400">Add staff members with specific access levels</p>
          </div>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="p-10 pb-0">
             {isError && (
              <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20 flex items-center gap-3 mb-6">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="font-medium">{error?.message || 'Failed to register user.'}</p>
              </div>
            )}

            {isSuccess && (
              <div className="rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-400 border border-emerald-500/20 flex items-center gap-3 mb-6">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p className="font-medium">User successfully created! Redirecting to dashboard...</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-10 pt-4">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-zinc-300 ml-1">First Name</Label>
                  <Input 
                    id="firstName"
                    name="firstName"
                    type="text" 
                    required 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    className="rounded-xl border-zinc-800 bg-zinc-900 px-4 py-6 text-white placeholder-zinc-500 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all h-auto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-zinc-300 ml-1">Last Name</Label>
                  <Input 
                    id="lastName"
                    name="lastName"
                    type="text" 
                    required 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    className="rounded-xl border-zinc-800 bg-zinc-900 px-4 py-6 text-white placeholder-zinc-500 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all h-auto"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-zinc-300 ml-1">Email Address</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email" 
                    required 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="rounded-xl border-zinc-800 bg-zinc-900 px-4 py-6 text-white placeholder-zinc-500 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all h-auto"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-zinc-300 ml-1">Secure Password</Label>
                  <Input 
                    id="password"
                    name="password"
                    type="password" 
                    required 
                    value={formData.password} 
                    onChange={handleChange} 
                    className="rounded-xl border-zinc-800 bg-zinc-900 px-4 py-6 text-white placeholder-zinc-500 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all h-auto"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="role" className="text-sm font-semibold text-zinc-300 ml-1">System Role</Label>
                  <div className="relative">
                    <select 
                      id="role"
                      name="role"
                      required 
                      value={formData.role} 
                      onChange={handleChange} 
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm appearance-none cursor-pointer"
                    >
                      <option value="Accountant">Accountant (Data Entry)</option>
                      <option value="Auditor">Auditor (Review & Approval)</option>
                      <option value="Admin">Admin (System Management)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-4">
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => navigate('/')} 
                  className="rounded-xl px-8 py-6 text-zinc-400 hover:text-white hover:bg-zinc-800 h-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="rounded-xl bg-emerald-600 px-10 py-6 text-base font-bold text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 active:scale-[0.98] transition-all disabled:opacity-50 h-auto"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Member'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="bg-zinc-900/50 p-6 border-t border-zinc-800/50">
             <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mx-auto">
              Administrator Access Guaranteed
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
