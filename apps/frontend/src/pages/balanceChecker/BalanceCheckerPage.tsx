import { useState, useCallback } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { checkBalance, downloadTemplate, type BalanceCheckResultDto } from '@/services/balanceChecker/balanceCheckerService';

export default function BalanceCheckerPage() {
  const [balanceCheckResult, setBalanceCheckResult] = useState<BalanceCheckResultDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadError('Please upload a .csv file.');
      return;
    }
    setSelectedFile(file);
    setUploadError(null);
    setBalanceCheckResult(null);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false);
  }, []);

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFile = event.target.files?.[0];
    if (chosenFile) handleFileSelect(chosenFile);
  }, [handleFileSelect]);

  const handleCheckBalance = useCallback(async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setUploadError(null);
    try {
      const csvResult = await checkBalance(selectedFile);
      setBalanceCheckResult(csvResult);
    } catch {
      setUploadError('Failed to process the CSV file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setBalanceCheckResult(null);
    setUploadError(null);
  }, []);

  const handleDownloadTemplate = useCallback(async () => {
    try {
      await downloadTemplate();
    } catch {
      setUploadError('Failed to download template.');
    }
  }, []);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Balance Checker</h1>
          <p className="text-zinc-400 mt-1">Upload a CSV T-table to verify if debits and credits are balanced.</p>
        </div>
        <Button
          variant="outline"
          onClick={handleDownloadTemplate}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Upload Zone */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
            CSV Upload
          </CardTitle>
          <CardDescription className="text-zinc-500">
            Drag and drop your CSV file or click to browse. Empty debit or credit fields are treated as 0.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer
              ${isDraggingOver
                ? 'border-indigo-500 bg-indigo-500/10'
                : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50'
              }
            `}
            onClick={() => document.getElementById('csv-file-input')?.click()}
          >
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="h-10 w-10 text-emerald-400" />
                <p className="text-sm font-medium text-zinc-200">{selectedFile.name}</p>
                <p className="text-xs text-zinc-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-zinc-500" />
                <p className="text-sm text-zinc-400">Drop your CSV file here, or click to browse</p>
                <p className="text-xs text-zinc-600">Accepts .csv files only</p>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {uploadError}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <Button
              onClick={handleCheckBalance}
              disabled={!selectedFile || isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Check Balance
                </>
              )}
            </Button>
            {selectedFile && (
              <Button
                variant="ghost"
                onClick={handleReset}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {balanceCheckResult && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Summary Card */}
          <Card className={`border backdrop-blur-sm ${
            balanceCheckResult.isBalanced
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : 'border-red-500/30 bg-red-500/5'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {balanceCheckResult.isBalanced ? (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
                      <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 ring-1 ring-red-500/30">
                      <XCircle className="h-7 w-7 text-red-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">
                      {balanceCheckResult.isBalanced ? 'Balanced' : 'Unbalanced'}
                    </h2>
                    <p className="text-sm text-zinc-400">
                      {balanceCheckResult.entryCount} {balanceCheckResult.entryCount === 1 ? 'entry' : 'entries'} processed
                    </p>
                  </div>
                </div>
                <Badge className={`text-sm px-4 py-1.5 ${
                  balanceCheckResult.isBalanced
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {balanceCheckResult.isBalanced ? 'PASS' : 'FAIL'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Debits</p>
                  <p className="text-lg font-semibold text-zinc-100">
                    {balanceCheckResult.totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Credits</p>
                  <p className="text-lg font-semibold text-zinc-100">
                    {balanceCheckResult.totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`rounded-xl border p-4 ${
                  balanceCheckResult.difference === 0
                    ? 'bg-zinc-900/80 border-zinc-800'
                    : 'bg-red-500/5 border-red-500/20'
                }`}>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Difference</p>
                  <p className={`text-lg font-semibold ${
                    balanceCheckResult.difference === 0 ? 'text-zinc-100' : 'text-red-400'
                  }`}>
                    {balanceCheckResult.difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          {balanceCheckResult.errors.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  Parsing Warnings ({balanceCheckResult.errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {balanceCheckResult.errors.map((csvError, errorIndex) => (
                    <li key={errorIndex} className="text-sm text-amber-300/80 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {csvError}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Entries Table */}
          {balanceCheckResult.entries.length > 0 && (
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Parsed Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-zinc-800 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400 font-medium">Account</TableHead>
                        <TableHead className="text-zinc-400 font-medium">Description</TableHead>
                        <TableHead className="text-zinc-400 font-medium text-right">Debit</TableHead>
                        <TableHead className="text-zinc-400 font-medium text-right">Credit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balanceCheckResult.entries.map((csvEntry, entryIndex) => (
                        <TableRow key={entryIndex} className="border-zinc-800 hover:bg-zinc-800/50">
                          <TableCell className="font-medium text-zinc-200">{csvEntry.account}</TableCell>
                          <TableCell className="text-zinc-400">{csvEntry.description}</TableCell>
                          <TableCell className="text-right tabular-nums text-zinc-200">
                            {csvEntry.debit > 0 ? csvEntry.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-zinc-200">
                            {csvEntry.credit > 0 ? csvEntry.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
