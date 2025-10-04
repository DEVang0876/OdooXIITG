import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Settings, Building } from 'lucide-react'
import Auth from '../services/auth'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export default function Header() {
  const user = Auth.getUser()
  const navigate = useNavigate()

  const handleLogout = () => {
    Auth.logout()
    navigate('/login')
  }

  const getDashboardPath = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'admin': return '/admin'
      case 'manager': return '/manager'
      case 'employee': return '/employee'
      default: return '/'
    }
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Settings className="h-4 w-4" />
      case 'manager': return <Building className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link to={getDashboardPath()} className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">ExpenseManager</span>
          </Link>
          
          {user && (
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link 
                to={getDashboardPath()} 
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Dashboard
              </Link>
              {user.role === 'employee' && (
                <Link 
                  to="/employee/add" 
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Add Expense
                </Link>
              )}
              {user.role === 'manager' && (
                <Link 
                  to="/manager" 
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Approvals
                </Link>
              )}
              {user.role === 'admin' && (
                <>
                  <Link 
                    to="/admin" 
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Admin
                  </Link>
                  <Link 
                    to="/admin/rules" 
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Rules
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <span className="capitalize">{user.role}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link to="/signup">
                <Button>Get started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
