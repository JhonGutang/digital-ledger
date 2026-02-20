import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useHealthCheck } from './hooks/useHealthCheck';

const queryClient = new QueryClient();

function Layout() {
  const { data, isError, isLoading } = useHealthCheck();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <header className="p-4 border-b flex justify-between items-center bg-white">
        <h1 className="text-xl font-bold">Digital Ledger</h1>
        <div className="flex items-center gap-2 text-sm font-medium">
          {isLoading ? (
            <span className="text-slate-500">Checking connection...</span>
          ) : isError ? (
            <span className="text-red-500 flex items-center gap-1">🔴 Backend Disconnected</span>
          ) : (
            <span className="text-green-600 flex items-center gap-1">🟢 Backend Connected ({data?.status})</span>
          )}
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center text-4xl font-bold">
        Welcome to Digital Ledger
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
