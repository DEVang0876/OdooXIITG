import React, { useEffect, useState } from 'react'
import { Download, Search, Eye, EyeOff, Plus, Receipt, TrendingUp, Clock } from 'lucide-react'
import API from '../services/api'
import Auth from '../services/auth'
import { exportToCsv } from '../utils/exportCsv'
import { toast } from 'react-toastify'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'

export default function EmployeeDashboard() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await API.get('/expenses')
      const data = response.data.data || response.data || []
      setExpenses(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Fetch expenses error:', error)
      setExpenses([]) // Ensure it's always an array
      toast.error('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  const filtered = (Array.isArray(expenses) ? expenses : []).filter(e =>
    !filter ||
    e._id?.includes(filter) ||
    e.title?.toLowerCase().includes(filter.toLowerCase()) ||
    e.category?.toLowerCase().includes(filter.toLowerCase()) ||
    e.description?.toLowerCase().includes(filter.toLowerCase())
  )

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const totalExpenses = expenses.length
  const approvedExpenses = expenses.filter(e => e.status === 'approved').length
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage your expense submissions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses}</div>
            <p className="text-xs text-muted-foreground">
              All time submissions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedExpenses}</div>
            <p className="text-xs text-muted-foreground">
              {totalExpenses > 0 ? Math.round((approvedExpenses / totalExpenses) * 100) : 0}% approval rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingExpenses}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total submitted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>
                View and manage all your expense submissions
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => exportToCsv('expenses.csv', expenses)}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, title, or category..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((expense) => (
                <React.Fragment key={expense._id}>
                  <TableRow>
                    <TableCell className="font-mono text-sm">
                      {expense._id?.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell>
                      {new Date(expense.date || expense.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>${expense.amount}</TableCell>
                    <TableCell>{getStatusBadge(expense.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(expanded === expense._id ? null : expense._id)}
                      >
                        {expanded === expense._id ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expanded === expense._id && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/50">
                        <div className="p-4 space-y-2">
                          <h4 className="font-medium">Description</h4>
                          <p className="text-sm text-muted-foreground">
                            {expense.description || 'No description provided'}
                          </p>
                          {expense.receipt && (
                            <>
                              <Separator />
                              <h4 className="font-medium">Receipt</h4>
                              <p className="text-sm text-muted-foreground">
                                Receipt file attached
                              </p>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {expenses.length === 0 ? 'No expenses yet' : 'No expenses match your search'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
