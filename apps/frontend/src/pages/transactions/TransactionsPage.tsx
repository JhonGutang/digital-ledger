import { useNavigate } from 'react-router-dom';
import { useTransactions, useDeleteTransaction } from '../../hooks/transactions/useTransactions';
import type { Transaction } from '../../types/transaction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Pencil, CalendarDays, FileText, Trash2 } from 'lucide-react';

export default function TransactionsPage() {
    const { data: transactions, isLoading } = useTransactions();
    const deleteTransaction = useDeleteTransaction();
    const navigate = useNavigate();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    };

    const getStatusBadge = (txStatus: string) => {
        switch (txStatus) {
            case 'DRAFT': return <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20">Draft</Badge>;
            case 'PENDING_APPROVAL': return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">Pending</Badge>;
            case 'POSTED': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Posted</Badge>;
            case 'VOIDED': return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Voided</Badge>;
            default: return <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20">{txStatus}</Badge>;
        }
    };

    const calculateTransactionTotal = (tx: Transaction) => {
        return tx.entries.filter(e => e.entryType === 'DEBIT').reduce((acc, curr) => acc + curr.amount, 0);
    };

    if (isLoading) return <div className="p-8">Loading journal entries...</div>;

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight pb-2">Journal Entries</h2>
                    <p className="text-zinc-400">
                        Record and manage your manual double-entry transactions.
                    </p>
                </div>
                
                <Button onClick={() => navigate('/transactions/new')} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Entry
                </Button>
            </div>

            {/* Transactions List */}
            <Card className="flex flex-col flex-1 min-h-0 bg-zinc-900/40 border-zinc-800 backdrop-blur-sm shadow-xl overflow-hidden">
                <CardHeader className="border-b border-zinc-800/50 pb-4 shrink-0">
                    <CardTitle className="text-xl text-white">All Transactions</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-auto relative">
                    <Table>
                        <TableHeader className="bg-zinc-950/90 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Date</TableHead>
                                <TableHead className="text-zinc-400">Reference / Memo</TableHead>
                                <TableHead className="text-zinc-400">Account Details</TableHead>
                                <TableHead className="text-right text-zinc-400">Total Amount</TableHead>
                                <TableHead className="text-zinc-400">Status</TableHead>
                                <TableHead className="w-[80px] text-zinc-400"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500 gap-2">
                                        No journal entries found. Click 'New Entry' to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                [...(transactions || [])]
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map(tx => (
                                    <TableRow key={tx.id} className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center text-zinc-300">
                                                <CalendarDays className="mr-2 h-4 w-4 text-zinc-500" />
                                                {new Intl.DateTimeFormat('en-PH', { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    year: 'numeric' 
                                                }).format(new Date(tx.date))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-zinc-200">{tx.referenceNumber || <span className="text-zinc-500 italic">No Ref</span>}</div>
                                            <div className="text-sm text-zinc-400 truncate max-w-xs">{tx.description}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-start gap-2 max-w-sm">
                                                <FileText className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                                                <div className="text-sm truncate text-zinc-300">
                                                    {tx.entries.length} lines: {tx.entries.map(e => e.accountName).join(', ')}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-indigo-400 font-mono">
                                            {formatCurrency(calculateTransactionTotal(tx))}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(tx.status)}
                                        </TableCell>
                                        <TableCell>
                                            {tx.status === 'DRAFT' && (
                                                <div className="flex gap-1 justify-end">
                                                    <Button variant="ghost" size="icon" onClick={() => navigate(`/transactions/${tx.id}/edit`)} className="text-zinc-400 hover:text-white hover:bg-zinc-800" title="Edit Draft">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => {
                                                            if (window.confirm("Are you sure you want to delete this draft journal entry? This cannot be undone.")) {
                                                                deleteTransaction.mutate(tx.id);
                                                            }
                                                        }} 
                                                        className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                                                        disabled={deleteTransaction.isPending}
                                                        title="Delete Draft"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
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
