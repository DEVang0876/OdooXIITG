import { v4 as uuidv4 } from 'uuid'

const KEY = 'mock_store_v1'

function defaultData() {
  return {
    users: [
      { id: uuidv4(), name: 'Admin User', email: 'admin@example.com', role: 'admin', password: 'admin123', manager: '' },
      { id: uuidv4(), name: 'Bob Manager', email: 'bob.manager@example.com', role: 'manager', password: 'manager123', manager: '' },
      { id: uuidv4(), name: 'Alice Employee', email: 'alice@example.com', role: 'employee', password: 'alice123', manager: 'Bob Manager' },
    ],
    expenses: [],
    rules: [
      { id: uuidv4(), category: 'default', approvers: ['Bob Manager', 'Finance'] }
    ],
    categories: ['Travel','Meals','Office','Transport'],
    resetTokens: {},
  }
}

function read() {
  const raw = localStorage.getItem(KEY)
  if (!raw) {
    const d = defaultData()
    localStorage.setItem(KEY, JSON.stringify(d))
    return d
  }
  try {
    return JSON.parse(raw)
  } catch {
    const d = defaultData()
    localStorage.setItem(KEY, JSON.stringify(d))
    return d
  }
}

function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

const Store = {
  getUsers() { return read().users },
  getUserByEmail(email) { return read().users.find(u => u.email === email) },
  createUser({ name, email, password, role, manager }){
    const data = read()
    if (data.users.find(u=>u.email===email)) throw new Error('Email exists')
    const user = { id: uuidv4(), name, email, password, role: role||'employee', manager: manager||'' }
    data.users.push(user)
    write(data)
    return user
  },
  updateUser(id, changes){
    const data = read()
    const i = data.users.findIndex(u=>u.id===id)
    if (i === -1) throw new Error('User not found')
    data.users[i] = { ...data.users[i], ...changes }
    write(data)
    return data.users[i]
  },
  deleteUser(id){
    const data = read()
    data.users = data.users.filter(u=>u.id!==id)
    write(data)
  },
  getExpenses(){ return read().expenses },
  getExpense(id){ return read().expenses.find(e=>e.id===id) },
  createExpense(exp){
    const data = read()
    const id = `EXP-${Date.now()}`
    const item = { id, ...exp, status: 'Draft', approvals: [], currentStep: -1, createdAt: new Date().toISOString() }
    data.expenses.push(item)
    write(data)
    return item
  },
  updateExpense(id, changes){
    const data = read()
    const i = data.expenses.findIndex(e=>e.id===id)
    if (i === -1) throw new Error('Expense not found')
    data.expenses[i] = { ...data.expenses[i], ...changes }
    write(data)
    return data.expenses[i]
  },
  submitExpense(id){
    const data = read()
    const i = data.expenses.findIndex(e=>e.id===id)
    if (i === -1) throw new Error('Expense not found')
    const exp = data.expenses[i]
    // determine approvers: find manager from user or use rule
    const user = data.users.find(u=>u.email===exp.email)
    const manager = user?.manager || ''
    const rule = data.rules.find(r=>r.category===exp.category) || data.rules[0]
    const approvers = []
    if (manager) approvers.push(manager)
    if (rule && rule.approvers) rule.approvers.forEach(a=>{ if (!approvers.includes(a)) approvers.push(a) })
    const approvals = approvers.map(a => ({ approver: a, status: 'pending', remarks: null }))
    data.expenses[i].approvals = approvals
    data.expenses[i].currentStep = approvals.length ? 0 : -1
    data.expenses[i].status = approvals.length ? 'Waiting' : 'Approved'
    write(data)
    return data.expenses[i]
  },
  approveExpense(id, approverName, action, remarks){
    const data = read()
    const i = data.expenses.findIndex(e=>e.id===id)
    if (i === -1) throw new Error('Expense not found')
    const exp = data.expenses[i]
    const step = exp.currentStep
    if (step < 0 || !exp.approvals || !exp.approvals[step]) throw new Error('No pending approval')
    const current = exp.approvals[step]
    if (current.approver !== approverName) throw new Error('Not authorized')
    current.status = action === 'approve' ? 'approved' : 'rejected'
    current.remarks = remarks || null
    if (action === 'reject'){
      exp.status = 'Rejected'
      exp.currentStep = -1
    } else {
      // approved this step
      const next = step + 1
      if (exp.approvals[next]){
        exp.currentStep = next
      } else {
        exp.status = 'Approved'
        exp.currentStep = -1
      }
    }
    data.expenses[i] = exp
    write(data)
    return exp
  },
  getPendingForApprover(name){
    const data = read()
    return data.expenses.filter(e=>e.status==='Waiting' && e.approvals && e.approvals[e.currentStep]?.approver===name)
  },
  getRules(){ return read().rules },
  createRule(rule){ const data=read(); rule.id=uuidv4(); data.rules.push(rule); write(data); return rule },
  updateRule(id, changes){ const data=read(); const i=data.rules.findIndex(r=>r.id===id); if(i===-1) throw new Error('Rule not found'); data.rules[i]={...data.rules[i],...changes}; write(data); return data.rules[i] },
  deleteRule(id){ const data=read(); data.rules=data.rules.filter(r=>r.id!==id); write(data) },
  getCategories(){ return read().categories },
  addCategory(name){ const data=read(); if(!data.categories.includes(name)) data.categories.push(name); write(data) },
  deleteCategory(name){ const data=read(); data.categories=data.categories.filter(c=>c!==name); write(data) },
  createResetToken(email){
    const data = read()
    const token = uuidv4()
    data.resetTokens[token] = email
    write(data)
    return token
  },
  resetPassword(token, newPassword){
    const data = read()
    const email = data.resetTokens[token]
    if (!email) throw new Error('Invalid token')
    const user = data.users.find(u=>u.email===email)
    if (!user) throw new Error('User not found')
    user.password = newPassword
    delete data.resetTokens[token]
    write(data)
    return true
  }
}

export default Store
