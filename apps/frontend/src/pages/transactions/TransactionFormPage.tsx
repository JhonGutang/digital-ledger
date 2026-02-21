import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTransaction, useCreateTransaction, useUpdateTransaction } from '../../hooks/transactions/useTransactions';
import { useAccounts } from '../../hooks/accounts/useAccounts';
import type { CreateTransactionDto, EntryType } from '../../types/transaction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { transactionService } from '../../services/transactions/transactionService';

export default function TransactionFormPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const { data: existingTx, isLoading: isTxLoading } = useTransaction(id as string);
    const { data: accounts } = useAccounts();
    const createTransaction = useCreateTransaction();
    const updateTransaction = useUpdateTransaction();

    const AUTOSAVE_KEY = 'draft_transaction_autosave';
    const AUTOSAVE_DEBOUNCE_MS = 1500;

    const [step, setStep] = useState<1 | 2>(1);
    const [lastAutosaved, setLastAutosaved] = useState<string | null>(null);
    const [isFormReady, setIsFormReady] = useState(false);

    // Form State
    const [referenceNumber, setReferenceNumber] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState<'DRAFT' | 'PENDING_APPROVAL'>('DRAFT');
    
    // Line Items State
    const [entries, setEntries] = useState<{ id: string; accountId: string; amount: string; entryType: EntryType; description: string }[]>([
        { id: '1', accountId: '', amount: '', entryType: 'DEBIT', description: '' },
        { id: '2', accountId: '', amount: '', entryType: 'CREDIT', description: '' }
    ]);

    // Populate form with existing data for edit mode
    useEffect(() => {
        if (isEditMode && existingTx) {
            setReferenceNumber(existingTx.referenceNumber || '');
            setDescription(existingTx.description);
            setDate(existingTx.date.split('T')[0]);
            setStatus(existingTx.status as 'DRAFT' | 'PENDING_APPROVAL');
            if (existingTx.entries.length > 0) {
                setEntries(existingTx.entries.map((e, idx) => ({
                    id: idx.toString(),
                    accountId: e.accountId,
                    amount: e.amount.toString(),
                    entryType: e.entryType,
                    description: e.description || ''
                })));
            }
            setIsFormReady(true);
        }
    }, [isEditMode, existingTx]);

    // Restore autosaved draft from localStorage (new entries only)
    useEffect(() => {
        if (isEditMode) {
            return;
        }
        const saved = localStorage.getItem(AUTOSAVE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setReferenceNumber(parsed.referenceNumber || '');
                setDescription(parsed.description || '');
                setDate(parsed.date || new Date().toISOString().split('T')[0]);
                setStatus(parsed.status || 'DRAFT');
                if (parsed.entries?.length >= 2) {
                    setEntries(parsed.entries);
                }
                if (parsed.step) {
                    setStep(parsed.step);
                }
                setLastAutosaved(parsed.savedAt || null);
                toast.info('Restored your previously unsaved draft.');
            } catch {
                localStorage.removeItem(AUTOSAVE_KEY);
            }
        }
        setIsFormReady(true);
    }, [isEditMode]);

    // Debounced autosave to localStorage (new entries only)
    const debouncedAutosave = useCallback(
        debounce((formData: Record<string, unknown>) => {
            const savedAt = new Date().toLocaleTimeString();
            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ ...formData, savedAt }));
            setLastAutosaved(savedAt);
        }, AUTOSAVE_DEBOUNCE_MS),
        []
    );

    // Debounced autosave to database (editing drafts only)
    const debouncedDbAutosave = useCallback(
        debounce(async (transactionId: string, formData: { referenceNumber: string; description: string; date: string; status: string; entries: typeof entries }) => {
            const hasValidEntries = formData.entries.length >= 2 && formData.entries.every(e => e.accountId);
            if (!hasValidEntries) return;

            try {
                await transactionService.update(transactionId, {
                    referenceNumber: formData.referenceNumber || undefined,
                    description: formData.description,
                    date: new Date(formData.date).toISOString(),
                    status: formData.status as 'DRAFT' | 'PENDING_APPROVAL',
                    entries: formData.entries.map(e => ({
                        accountId: e.accountId,
                        amount: parseFloat(e.amount) || 0,
                        entryType: e.entryType,
                        description: e.description || undefined
                    }))
                });
                setLastAutosaved(new Date().toLocaleTimeString());
            } catch (error: any) {
                console.warn('Autosave failed:', error?.response?.data || error?.message);
            }
        }, AUTOSAVE_DEBOUNCE_MS),
        []
    );

    // Trigger localStorage autosave for new entries
    useEffect(() => {
        if (!isFormReady || isEditMode || status !== 'DRAFT') return;
        debouncedAutosave({ referenceNumber, description, date, status, entries, step });
    }, [referenceNumber, description, date, status, entries, step, isFormReady, isEditMode, debouncedAutosave]);

    // Trigger database autosave for editing drafts
    useEffect(() => {
        if (!isFormReady || !isEditMode || !id || status !== 'DRAFT') return;
        debouncedDbAutosave(id, { referenceNumber, description, date, status, entries });
    }, [referenceNumber, description, date, status, entries, isFormReady, isEditMode, id, debouncedDbAutosave]);

    // Cleanup debounces on unmount
    useEffect(() => {
        return () => { debouncedAutosave.cancel(); debouncedDbAutosave.cancel(); };
    }, [debouncedAutosave, debouncedDbAutosave]);

    const clearAutosave = () => {
        localStorage.removeItem(AUTOSAVE_KEY);
        setLastAutosaved(null);
    };

    const handleAddEntry = () => {
        setEntries([
            ...entries,
            { id: Date.now().toString(), accountId: '', amount: '', entryType: 'DEBIT', description: '' }
        ]);
    };

    const handleRemoveEntry = (entryId: string) => {
        if (entries.length <= 2) {
            toast.error("A transaction must have at least 2 entries.");
            return;
        }
        setEntries(entries.filter(e => e.id !== entryId));
    };

    const updateEntry = (entryId: string, field: string, value: string) => {
        setEntries(entries.map(e => e.id === entryId ? { ...e, [field]: value } : e));
    };

    const { totalDebits, totalCredits, isBalanced, balanceDifference } = useMemo(() => {
        let debits = 0;
        let credits = 0;
        entries.forEach(e => {
            const amt = parseFloat(e.amount) || 0;
            if (e.entryType === 'DEBIT') debits += amt;
            else if (e.entryType === 'CREDIT') credits += amt;
        });
        
        const diff = Math.abs(debits - credits);
        const balanced = diff < 0.001 && debits > 0;
        
        return { totalDebits: debits, totalCredits: credits, isBalanced: balanced, balanceDifference: diff };
    }, [entries]);

    const handleNextStep = () => {
        if (!date) {
            toast.error("Posting date is required.");
            return;
        }
        if (!description) {
            toast.error("Description is required.");
            return;
        }
        setStep(2);
    };

    const handleSubmit = async () => {
        if (entries.some(e => !e.accountId)) {
            toast.error("Please select an account for all entries.");
            return;
        }
        if (entries.some(e => parseFloat(e.amount) <= 0 || isNaN(parseFloat(e.amount)))) {
            toast.error("All entry amounts must be greater than zero.");
            return;
        }
        if (status !== 'DRAFT' && !isBalanced) {
            toast.error(`Transaction out of balance by ₱${balanceDifference.toLocaleString(undefined, {minimumFractionDigits: 2})}.`);
            return;
        }

        const payload: CreateTransactionDto = {
            referenceNumber: referenceNumber || undefined,
            description,
            date: new Date(date).toISOString(),
            status,
            entries: entries.map(e => ({
                accountId: e.accountId,
                amount: parseFloat(e.amount),
                entryType: e.entryType,
                description: e.description || undefined
            }))
        };

        if (isEditMode) {
            updateTransaction.mutate(
                { id: id as string, data: payload },
                { onSuccess: () => { clearAutosave(); navigate('/transactions'); } }
            );
        } else {
            createTransaction.mutate(
                payload,
                { onSuccess: () => { clearAutosave(); navigate('/transactions'); } }
            );
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    };

    if (isEditMode && isTxLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const activeAccounts = accounts?.filter(a => a.isActive) || [];

    return (
        <div className="flex flex-col h-full gap-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-4 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => navigate('/transactions')} className="text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight pb-1">
                        {isEditMode ? 'Edit Journal Entry' : 'New Journal Entry'}
                    </h2>
                    <p className="text-zinc-400">
                        {step === 1 ? 'Step 1: Transaction Details' : 'Step 2: Line Items'}
                    </p>
                </div>
            </div>
            
            <div className="flex gap-2 shrink-0 mb-2">
                <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-zinc-800'}`} />
                <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-zinc-800'}`} />
            </div>

            <Card className="flex flex-col flex-1 bg-zinc-900/40 border-zinc-800 backdrop-blur-sm shadow-xl min-h-0 overflow-hidden gap-0">
                <CardHeader className="border-b border-zinc-800/50 flex flex-row items-center justify-between shrink-0">
                    <div>
                        <CardTitle className="text-xl text-white">
                            {step === 1 ? '1. Transaction Details' : '2. Line Items'}
                        </CardTitle>
                        <p className="text-sm text-zinc-400 mt-1">
                            {step === 1 ? 'Provide the general information for this journal entry.' : 'Enter the debits and credits. Must balance to zero.'}
                        </p>
                    </div>
                    {step === 2 && (
                        <Button type="button" variant="outline" size="sm" onClick={handleAddEntry} className="border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 hover:text-white text-zinc-300">
                            <PlusCircle className="mr-2 h-3 w-3" /> Add Line
                        </Button>
                    )}
                </CardHeader>
                
                <CardContent className={`flex-1 overflow-hidden min-h-0 ${step === 1 ? 'p-6' : 'p-0 flex flex-col md:flex-row'}`}>
                    {step === 1 ? (
                        <div className="grid grid-cols-2 gap-6 p-1">
                            <div className="space-y-3">
                                <Label htmlFor="date" className="text-zinc-300">Posting Date <span className="text-red-400">*</span></Label>
                                <Input 
                                    id="date" 
                                    type="date" 
                                    value={date} 
                                    onChange={(e) => setDate(e.target.value)}
                                    className="bg-zinc-900 border-zinc-800 [color-scheme:dark]"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="reference" className="text-zinc-300">Reference Number</Label>
                                <Input 
                                    id="reference" 
                                    placeholder="e.g., JE-2024-001" 
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                                />
                            </div>
                            <div className="col-span-2 space-y-3">
                                <Label htmlFor="description" className="text-zinc-300">Description (Memo) <span className="text-red-400">*</span></Label>
                                <Input 
                                    id="description" 
                                    placeholder="Explanation for this entry..." 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="status" className="text-zinc-300">Submission Status</Label>
                                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        <SelectItem value="DRAFT">Save as Draft</SelectItem>
                                        <SelectItem value="PENDING_APPROVAL">Submit for Approval</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto overflow-x-hidden border-r border-zinc-800 relative">
                                <table className="w-full caption-bottom text-sm relative">
                                    <TableHeader className="bg-zinc-950/90 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                                        <TableRow className="border-zinc-800 hover:bg-transparent">
                                            <TableHead className="text-zinc-400">Account</TableHead>
                                            <TableHead className="text-zinc-400">Description</TableHead>
                                            <TableHead className="w-[120px] text-zinc-400">Type</TableHead>
                                            <TableHead className="w-[150px] text-right text-zinc-400">Amount (₱)</TableHead>
                                            <TableHead className="w-[50px] text-zinc-400"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {entries.map((entry) => (
                                            <TableRow key={entry.id} className="border-zinc-800 hover:bg-zinc-800/30">
                                                <TableCell>
                                                    <Select value={entry.accountId} onValueChange={(val) => updateEntry(entry.id, 'accountId', val)}>
                                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                                            <SelectValue placeholder="Select Account" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-56">
                                                            {activeAccounts.map(acc => (
                                                                <SelectItem key={acc.id} value={acc.id}>
                                                                    <span className="font-mono text-zinc-500 mr-2">{acc.code}</span>
                                                                    {acc.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input 
                                                        placeholder="Line memo..." 
                                                        value={entry.description}
                                                        onChange={(e) => updateEntry(entry.id, 'description', e.target.value)}
                                                        className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Select value={entry.entryType} onValueChange={(val) => updateEntry(entry.id, 'entryType', val as EntryType)}>
                                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                            <SelectItem value="DEBIT">Debit</SelectItem>
                                                            <SelectItem value="CREDIT">Credit</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input 
                                                        type="number" 
                                                        step="0.01" 
                                                        min="0.01"
                                                        placeholder="0.00"
                                                        className="text-right bg-zinc-900 border-zinc-800 text-white font-mono placeholder:text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        value={entry.amount}
                                                        onChange={(e) => updateEntry(entry.id, 'amount', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                                                        onClick={() => handleRemoveEntry(entry.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                                </table>
                            </div>

                            <div className="w-full md:w-72 bg-zinc-900/30 p-6 shrink-0 flex flex-col justify-start border-t md:border-t-0 md:border-l border-zinc-800 overflow-y-auto">
                                <h3 className="text-xs font-semibold text-zinc-500 mb-6 uppercase tracking-wider">Balance Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Total Debits</span>
                                        <span className="font-medium text-zinc-200">{formatCurrency(totalDebits)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Total Credits</span>
                                        <span className="font-medium text-zinc-200">{formatCurrency(totalCredits)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold border-t border-zinc-800 pt-4 mt-2">
                                        <span className="text-zinc-300">Difference</span>
                                        <span className={isBalanced ? "text-emerald-500" : "text-red-500"}>
                                            {formatCurrency(balanceDifference)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
                
                <div className="border-t border-zinc-800/50 p-4 flex justify-between bg-zinc-950/30 rounded-b-xl items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <Button  
                            variant="outline" 
                            onClick={() => step === 2 ? setStep(1) : navigate('/transactions')}
                            className="border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                        >
                            {step === 2 ? (
                                <><ArrowLeft className="mr-2 h-4 w-4" /> Back to Details</>
                            ) : 'Cancel'}
                        </Button>
                        {lastAutosaved && status === 'DRAFT' && (
                            <span className="text-xs text-zinc-500 hidden sm:inline">
                                Autosaved at {lastAutosaved}
                            </span>
                        )}
                    </div>
                    
                    {step === 1 ? (
                        <Button onClick={handleNextStep} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                            Next: Line Items <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleSubmit} 
                            disabled={(status !== 'DRAFT' && !isBalanced) || createTransaction.isPending || updateTransaction.isPending}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none"
                        >
                            {(createTransaction.isPending || updateTransaction.isPending) ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> Save Journal Entry</>
                            )}
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}
