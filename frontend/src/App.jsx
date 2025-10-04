import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import AddExpense from './pages/AddExpense'
import ApprovalDetails from './pages/ApprovalDetails'
import ApprovalRules from './pages/ApprovalRules'
import SystemSettings from './pages/SystemSettings'
import Auth from './services/auth'
import { cn } from './lib/utils'

function AppContent() {
  const location = useLocation()
  const user = Auth.getUser()
  const isAuthPage = ['/login', '/signup', '/verify-email', '/forgot', '/reset'].includes(location.pathname)

  // For auth pages, render them without the main app layout
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
      </Routes>
    )
  }

  // For regular pages, use the main app layout
  return (
    <div className="min-h-screen bg-background">
      <Header />
<<<<<<< HEAD
      <div className="flex">
        {!isAuthPage && user && <Sidebar />}
        <main className={cn(
          "flex-1 transition-all duration-200",
          !isAuthPage && user ? "md:ml-64" : "",
          isAuthPage ? "min-h-[calc(100vh-4rem)]" : "min-h-[calc(100vh-4rem)] p-6"
        )}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/reset" element={<ResetPassword />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/rules" element={<ProtectedRoute roles={["admin"]}><ApprovalRules /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute roles={["admin"]}><SystemSettings /></ProtectedRoute>} />
            <Route path="/employee" element={<ProtectedRoute roles={["employee"]}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/employee/add" element={<ProtectedRoute roles={["employee"]}><AddExpense /></ProtectedRoute>} />
            <Route path="/manager" element={<ProtectedRoute roles={["manager"]}><ManagerDashboard /></ProtectedRoute>} />
            <Route path="/manager/approval/:id" element={<ProtectedRoute roles={["manager"]}><ApprovalDetails /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
=======
      {user && <Sidebar />}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/rules" element={<ProtectedRoute roles={["admin"]}><ApprovalRules /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute roles={["admin"]}><SystemSettings /></ProtectedRoute>} />
          <Route path="/employee" element={<ProtectedRoute roles={["employee"]}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/employee/add" element={<ProtectedRoute roles={["employee"]}><AddExpense /></ProtectedRoute>} />
          <Route path="/manager" element={<ProtectedRoute roles={["manager"]}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/manager/approval/:id" element={<ProtectedRoute roles={["manager"]}><ApprovalDetails /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
>>>>>>> 77a214f81d8be43ce25bdecd35c535722fed880b
    </div>
  )
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AppContent />
    </BrowserRouter>
  )
}

export default App
