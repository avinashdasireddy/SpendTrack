import React, { useState } from 'react';
import { ActiveTab, Expense } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './views/DashboardView';
import { ExpensesView } from './views/ExpensesView';
import { ReportsView } from './views/ReportsView';
import { CalendarView } from './views/CalendarView';
import { SettingsView } from './views/SettingsView';
import { LoginView } from './views/LoginView';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-zinc-400">Loading SpendTrack...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <AppShell activeTab={activeTab} onSelectTab={setActiveTab}>
      {({ onEditExpense, onDeleteExpense, onSelectExpense, onOpenAddExpense }) => {
        switch (activeTab) {
          case 'dashboard':
            return (
              <DashboardView
                onEditExpense={onEditExpense}
                onDeleteExpense={onDeleteExpense}
                onSelectExpense={onSelectExpense}
                onOpenAddExpense={onOpenAddExpense}
                onNavigateToExpenses={() => setActiveTab('expenses')}
                onNavigateToReports={() => setActiveTab('reports')}
              />
            );

          case 'expenses':
            return (
              <ExpensesView
                onEditExpense={onEditExpense}
                onDeleteExpense={onDeleteExpense}
                onSelectExpense={onSelectExpense}
                onOpenAddExpense={onOpenAddExpense}
              />
            );

          case 'reports':
            return <ReportsView />;

          case 'calendar':
            return (
              <CalendarView
                onEditExpense={onEditExpense}
                onDeleteExpense={onDeleteExpense}
                onSelectExpense={onSelectExpense}
                onOpenAddExpense={onOpenAddExpense}
              />
            );

          case 'settings':
            return (
              <SettingsView
                onNavigateToDashboard={() => setActiveTab('dashboard')}
              />
            );

          default:
            return null;
        }
      }}
    </AppShell>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ExpenseProvider>
          <AppContent />
        </ExpenseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
