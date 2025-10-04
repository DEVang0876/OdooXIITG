# Database Seeding Script

This script populates the database with sample data for development and testing purposes.

## Overview

The seeding script creates:
- **8 Users**: 1 Admin, 2 Managers, 5 Employees
- **8 Categories**: Office Supplies, Travel, Meals, Software, etc.
- **9 Expenses**: Mix of pending, approved, rejected, and processing statuses

## Usage

### Prerequisites
- MongoDB running and accessible
- Backend dependencies installed (`npm install`)
- Environment variables configured (`.env` file)

### Running the Script

1. **Warning**: This script will **clear all existing data** in the database.

2. **Run with confirmation**:
   ```bash
   cd backend
   npm run seed -- --confirm
   ```

   Or directly:
   ```bash
   node scripts/seed.js --confirm
   ```

3. **Without confirmation** (shows warning and exits):
   ```bash
   npm run seed
   ```

## Sample Data Created

### Users
- **Admin**: admin@company.com / admin123
- **Managers**:
  - John Manager: john.manager@company.com / manager123 (Sales)
  - Sarah Manager: sarah.manager@company.com / manager123 (Marketing)
- **Employees**:
  - Mike Johnson: mike.johnson@company.com / employee123 (Sales)
  - Emily Davis: emily.davis@company.com / employee123 (Marketing)
  - David Wilson: david.wilson@company.com / employee123 (IT)
  - Lisa Brown: lisa.brown@company.com / employee123 (HR)
  - James Taylor: james.taylor@company.com / employee123 (Finance)

### Categories
1. Office Supplies - Blue (#007bff)
2. Travel - Green (#28a745)
3. Meals & Entertainment - Yellow (#ffc107)
4. Software & Tools - Purple (#6f42c1)
5. Training & Development - Pink (#e83e8c)
6. Marketing - Orange (#fd7e14)
7. Utilities - Teal (#20c997)
8. Medical - Red (#dc3545)

### Expenses
- **3 Pending**: Office chair, client lunch, Adobe license
- **3 Approved**: Business trip, team building, printer toner
- **2 Rejected**: Gym membership, luxury coffee machine
- **1 Processing**: Conference registration

## Features

- **Password Hashing**: All user passwords are properly hashed
- **Manager Relationships**: Employees are assigned to appropriate managers
- **Random Assignments**: Expenses are randomly assigned to users and categories
- **Realistic Data**: Dates, amounts, and descriptions are varied and realistic
- **Approval Workflow**: Different expense statuses with proper approval tracking

## Safety

- **Confirmation Required**: Script won't run without `--confirm` flag
- **Data Clearing**: Existing data is completely removed before seeding
- **Error Handling**: Comprehensive error handling and logging
- **Rollback**: If seeding fails, partial data is cleaned up

## Customization

To modify the sample data, edit the arrays in `scripts/seed.js`:
- `sampleUsers`: User accounts
- `sampleCategories`: Expense categories
- `sampleExpenses`: Expense records

## Integration

After seeding, you can:
- Test user authentication and role-based access
- Test expense creation and approval workflows
- Test category management
- Test reporting and analytics features
- Verify OCR integration with receipt uploads