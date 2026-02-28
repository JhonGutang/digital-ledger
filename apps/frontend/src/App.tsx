import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

const queryClient = new QueryClient();

import Layout from './components/layout/Layout';
import AccountsPage from './pages/accounts/AccountsPage';
import TransactionsPage from './pages/transactions/TransactionsPage';
import TransactionFormPage from './pages/transactions/TransactionFormPage';
import BalanceCheckerPage from './pages/balanceChecker/BalanceCheckerPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={
                  <div className="flex-1 flex flex-col items-center justify-center h-full p-8 w-full max-w-7xl mx-auto">
                    {/* The existing card moves here since Layout shouldn't own dashboard content forever, but for MVP it's fine */}
                    <div className="text-center text-zinc-500 p-12">Dashboard Overview (Coming Soon)</div>
                  </div>
                } />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/transactions/new" element={<TransactionFormPage />} />
                <Route path="/transactions/:id/edit" element={<TransactionFormPage />} />
                <Route path="/tools/balance-checker" element={<BalanceCheckerPage />} />
              </Route>
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
