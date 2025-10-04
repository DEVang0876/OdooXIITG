import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Plus, 
  Receipt, 
  Users, 
  Settings, 
  CheckCircle, 
  BarChart3, 
  Shield 
} from 'lucide-react'
import Auth from '../services/auth'
import { cn } from '../lib/utils'

export default function Sidebar() {
  const user = Auth.getUser()
  const role = user?.role

  const navItems = [
    {
      title: 'Home',
      href: '/',
      icon: Home,
      roles: ['admin', 'manager', 'employee']
    },
    // Admin navigation
    {
      title: 'Admin Dashboard',
      href: '/admin',
      icon: BarChart3,
      roles: ['admin']
    },
    {
      title: 'Approval Rules',
      href: '/admin/rules',
      icon: Shield,
      roles: ['admin']
    },
    {
      title: 'System Settings',
      href: '/admin/settings',
      icon: Settings,
      roles: ['admin']
    },
    // Employee navigation
    {
      title: 'My Expenses',
      href: '/employee',
      icon: Receipt,
      roles: ['employee']
    },
    {
      title: 'Add Expense',
      href: '/employee/add',
      icon: Plus,
      roles: ['employee']
    },
    // Manager navigation
    {
      title: 'Approvals',
      href: '/manager',
      icon: CheckCircle,
      roles: ['manager']
    }
  ]

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(role)
  )

  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-40 border-r bg-background">
      <div className="flex flex-col h-full pt-16">
        <div className="flex-1 flex flex-col px-3 py-4">
          <nav className="space-y-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* User info at bottom */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
              <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
