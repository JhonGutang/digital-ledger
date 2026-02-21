import { useState } from 'react';
import { useAccounts, useCreateAccount } from '../../hooks/accounts/useAccounts';
import { useAuthContext } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Search, Loader2 } from 'lucide-react';
import type { AccountCategory } from '../../types/account';

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const { user } = useAuthContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AccountCategory>('ASSET');
  const [description, setDescription] = useState('');

  const filteredAccounts = accounts?.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          acc.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || acc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    createAccount.mutate(
      { code, name, category, description },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setCode('');
          setName('');
          setDescription('');
        }
      }
    );
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'ASSET': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'LIABILITY': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'EQUITY': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'REVENUE': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'EXPENSE': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight pb-2">Chart of Accounts</h2>
          <p className="text-zinc-400">Manage standard categories for financial data classification.</p>
        </div>
        
        {user && (user.role === 'Admin' || user.role === 'Accountant') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                <Plus className="mr-2 h-4 w-4" /> Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white">
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Create a new account for your ledger. Normal balance is derived automatically.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAccount} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-zinc-300">Account Code</Label>
                  <Input 
                    id="code" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                    placeholder="e.g. 1000" 
                    required 
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">Account Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g. Cash" 
                    required 
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-zinc-300">Category</Label>
                  <Select value={category} onValueChange={(val: AccountCategory) => setCategory(val)}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="ASSET">Asset</SelectItem>
                      <SelectItem value="LIABILITY">Liability</SelectItem>
                      <SelectItem value="EQUITY">Equity</SelectItem>
                      <SelectItem value="REVENUE">Revenue</SelectItem>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-zinc-300">Description (Optional)</Label>
                  <Input 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={createAccount.isPending} className="w-full bg-indigo-600 hover:bg-indigo-500">
                    {createAccount.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Account"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="flex flex-col flex-1 min-h-0 bg-zinc-900/40 border-zinc-800 backdrop-blur-sm shadow-xl overflow-hidden">
        <CardHeader className="border-b border-zinc-800/50 pb-4 shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl text-white">All Accounts</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search code or name..."
                  className="pl-9 bg-zinc-950/50 border-zinc-800 focus-visible:ring-indigo-500 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px] bg-zinc-950/50 border-zinc-800 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="ASSET">Asset</SelectItem>
                  <SelectItem value="LIABILITY">Liability</SelectItem>
                  <SelectItem value="EQUITY">Equity</SelectItem>
                  <SelectItem value="REVENUE">Revenue</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-auto relative">
          <Table>
            <TableHeader className="bg-zinc-950/90 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="w-[100px] text-zinc-400">Code</TableHead>
                <TableHead className="text-zinc-400">Account Name</TableHead>
                <TableHead className="text-zinc-400">Category</TableHead>
                <TableHead className="text-zinc-400">Normal Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-500" />
                  </TableCell>
                </TableRow>
              ) : filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-zinc-500 gap-2">
                    No accounts found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => (
                  <TableRow key={account.id} className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors cursor-pointer">
                    <TableCell className="font-mono text-indigo-400 font-medium">{account.code}</TableCell>
                    <TableCell className="font-medium text-zinc-200">{account.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-semibold tracking-wider text-[10px] ${getCategoryColor(account.category)}`}>
                        {account.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-bold ${account.normalBalance === 'DEBIT' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {account.normalBalance}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
