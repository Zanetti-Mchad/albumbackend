# Prisma Schema Documentation

This document provides an overview of the database schema for the school management system.

## Database Configuration

```prisma
datasource db {
  provider = "postgresql" 
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

- **Provider**: PostgreSQL database
- **Connection**: Uses environment variables for security

## Enums

The schema defines several important enums:

```prisma
enum ActionType {
  LOGIN
  LOGOUT
  PASSWORD_RESET
  PROFILE_UPDATE
  PERMISSION_CHANGE
  ACCOUNT_CREATE
  DATA_ACCESS
  DATA_MODIFY
}

enum LogStatus {
  SUCCESS
  FAILURE
  WARNING
  INFO
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
  MOBILE_MONEY
  CHECK
  CARD
  OTHER
}

enum TransactionType {
  STOCK_ADDITION
  STOCK_ADJUSTMENT
  CHECKOUT
  CHECKOUT_UPDATE_TAKE
  CHECKOUT_UPDATE_RETURN
}

enum BorrowingStatus {
  BORROWED
  RETURNED
  OVERDUE
  LOST
  DAMAGED
}

enum InventoryTransactionType {
  PURCHASE
  SALE
  RETURN
  ADJUSTMENT
  TRANSFER_IN
  TRANSFER_OUT
}

enum SpoiltLostType {
  SPOILT
  LOST
  DAMAGED
}
```

## Core Models

### School Settings

The `SchoolSetting` model stores institutional information:
- **School Identification**: name, motto, address
- **Contact Information**: phone, email, website
- **Visual Identity**: school badge/logo
- **Status Tracking**: isActive flag
- **Audit Fields**: createdAt, updatedAt, createdBy, updatedBy

### User Management

The `User` model is the central entity for authentication and authorization:
- **Authentication**: 
  - email (unique), phone (unique), password (hashed)
  - OTP verification with expiration
- **Personal Information**:
  - name (first, last, middle), gender, address
  - contact details, date joined
- **Employment Details**:
  - salary information
  - bank account details
  - mobile money information
- **Status & Access**:
  - isActive: account status
  - emailVerified: verification status
  - hasAccess: permission flag
- **Relations**:
  - Security logs (one-to-many)
  - Created/updated records (one-to-many)
  - Class teacher assignments (one-to-many)
  - Subject assignments (one-to-many)
  - Payroll entries (one-to-many)
  - Messages (one-to-many)
  - And more...

### Student Management

The `Student` model manages comprehensive student information:
- **Personal Details**:
  - Name components (first, middle, last)
  - Gender, date of birth, country
  - Contact information
- **Academic Information**:
  - Class assignment
  - Program, religion
  - Bursary status (full/half)
- **Financial Information**:
  - Fee structures
  - Payment records
  - Discounts and adjustments
- **Guardian Information**:
  - Primary and secondary guardians
  - Contact details and relationships
- **Status Tracking**:
  - Activation/deactivation with timestamps
  - Reason tracking for status changes
  - Audit fields (createdAt, updatedAt)
- **Relations**:
  - Class assignments (many-to-one)
  - Academic year (many-to-one)
  - Subject activities (many-to-many)
  - Exam results (one-to-many)
  - Fee payments (one-to-many)
  - Attendance records (one-to-many)
  - Library borrowings (one-to-many)
  - Transport registrations (one-to-many)
  - Uniform checkouts (one-to-many)

### User Management

The `User` model is the central entity for authentication and authorization:

- Stores authentication details (email, phone, password)
- Tracks user metadata (name, role, contact details)
- Contains extensive relations to other models
- Supports OTP-based verification
- Manages user roles and permissions
- Tracks security logs

### Student Management

The `Student` model contains comprehensive student information:

- Personal details (name, gender, DOB)
- Academic information (class, program)
- Financial information (fees, bursary status)
- Guardian information
- Activation/deactivation tracking with audit logs
- Subject activity enrollments
- Exam results
- Uniform checkouts
- Library borrowings
- Transport route registrations

### Academic Structure

The system organizes academic data in a hierarchical structure:

1. **AcademicYear**
   - Represents a school year (e.g., "2023-2024")
   - Tracks active status
   - Contains related terms and academic data
   - Has start/end dates
   - **Relations**:
     - Terms (one-to-many)
     - Classes (one-to-many)
     - Fee structures (one-to-many)
     - Exam sets (one-to-many)
     - Timetables (one-to-many)

2. **Term**
   - Belongs to an academic year
   - Has name, start/end dates
   - Tracks active status
   - **Relations**:
     - Academic year (many-to-one)
     - Exam sets (one-to-many)
     - Subject activities (one-to-many)
     - Fee structures (one-to-many)
     - Timetables (one-to-many)

3. **Class**
   - Represents student groups/classrooms
   - Has grade level and section
   - Tracks capacity and current enrollment
   - **Relations**:
     - Students (one-to-many)
     - Class teachers (one-to-many)
     - Subject activities (one-to-many)
     - Timetable entries (one-to-many)
     - Fee structures (one-to-many)

4. **SubjectActivity**
   - Represents both academic subjects and extracurriculars
   - Maps to classes and terms
   - Tracks subject codes and names
   - **Relations**:
     - Class (many-to-one)
     - Term (many-to-one)
     - Teacher assignments (one-to-many)
     - Student enrollments (many-to-many)
     - Exam results (one-to-many)

5. **ClassTermSchedule**
   - Defines class schedules by term
   - Tracks meeting days and times
   - Links to classrooms
   - **Relations**:
     - Class (many-to-one)
     - Term (many-to-one)
     - Subject activities (one-to-many)

6. **Timetable**
   - Weekly schedule for classes
   - Manages time slots and periods
   - Handles special schedules
   - **Relations**:
     - Academic year (many-to-one)
     - Term (many-to-one)
     - Timetable entries (one-to-many)
     - Special periods (one-to-many)

7. **ExamSet**
   - Defines examination periods
   - Tracks weight and scheduling
   - **Relations**:
     - Term (many-to-one)
     - Exam results (one-to-many)
     - Assignments (one-to-many)

### Financial Management

#### Fee Management System

The fee management system handles all financial transactions and structures:

1. **StudentFees**
   - Tracks individual student fee obligations
   - Records total fees, payments, and balances
   - Links to specific terms and academic years
   - **Relations**:
     - Student (many-to-one)
     - Term (many-to-one)
     - Academic year (many-to-one)
     - Fee payments (one-to-many)
     - Fee structure (many-to-one)

2. **FeePayment**
   - Records individual payment transactions
   - Tracks payment method and reference
   - Includes receipt information
   - **Relations**:
     - Student fees (many-to-one)
     - Student (many-to-one)
     - Recorded by user (many-to-one)

3. **FeeStructure**
   - Defines fee templates by class/term/year
   - Sets base fee amounts and components
   - Supports custom fee configurations
   - **Relations**:
     - Class (many-to-one)
     - Term (many-to-one)
     - Academic year (many-to-one)
     - Student fees (one-to-many)

#### Income & Expense Management

The system provides comprehensive financial tracking:

1. **IncomeCategory**
   - Classifies different income sources
   - Supports hierarchical categorization
   - **Relations**:
     - Income records (one-to-many)
     - Created/updated by users

2. **ExpenseCategory**
   - Organizes expenditure types
   - Supports subcategories
   - **Relations**:
     - Expense records (one-to-many)
     - Created/updated by users

3. **Income**
   - Records all incoming revenue
   - Links to categories and subcategories
   - Includes payment details
   - **Relations**:
     - Category (many-to-one)
     - Academic year (many-to-one)
     - Recorded by user (many-to-one)

4. **Expense**
   - Tracks all expenditures
   - Includes vendor and payment details
   - **Relations**:
     - Category (many-to-one)
     - Subcategory (many-to-one)
     - Academic year (many-to-one)
     - Recorded by user (many-to-one)

5. **FinancialReport**
   - Generates periodical financial summaries
   - Includes income, expenses, and net balance
   - **Relations**:
     - Academic year (many-to-one)
     - Term (many-to-one)
     - Created by user (many-to-one)

### Assessment and Reporting

The system provides a comprehensive assessment and reporting framework:

1. **Mark**
   - Records individual assessment scores
   - Tracks different assessment types (tests, exams, assignments)
   - Includes grading and remarks
   - **Relations**:
     - Student (many-to-one)
     - Subject activity (many-to-one)
     - Exam set (many-to-one)
     - Academic year/term (many-to-one)
     - Recorded by user (many-to-one)

2. **StudentReport**
   - Aggregates term performance
   - Includes attendance and behavior
   - Tracks promotion status
   - **Relations**:
     - Student (many-to-one)
     - Term (many-to-one)
     - Academic year (many-to-one)
     - Class (many-to-one)

3. **GradingScale**
   - Defines grading criteria
   - Configurable grade boundaries
   - Supports different assessment types
   - **Relations**:
     - Grading rows (one-to-many)
     - Created/updated by users

4. **GradingRow**
   - Defines grade boundaries and comments
   - Links to grading scales
   - **Relations**:
     - Grading scale (many-to-one)

5. **HeadTeacherComment**
   - Stores head teacher remarks
   - Links to specific mark ranges
   - **Relations**:
     - Academic year/term/class (many-to-one)
     - Created/updated by users

6. **ClassTeacherComment**
   - Stores class teacher remarks
   - Links to specific mark ranges
   - **Relations**:
     - Academic year/term/class (many-to-one)
     - Created/updated by users

7. **AnalysisComment**
   - Detailed performance analysis
   - Tracks strengths and areas for improvement
   - **Relations**:
     - Class/subject/term (many-to-one)
     - Created/updated by users

8. **ReportTemplate**
   - Defines report card layouts
   - Customizable templates
   - **Relations**:
     - Created/updated by users

### Inventory Management

The system provides comprehensive inventory tracking for both general items and uniforms:

1. **InventoryCategory**
   - Organizes inventory items hierarchically
   - Tracks category codes and descriptions
   - **Relations**:
     - Parent/child categories (self-referential)
     - Inventory items (one-to-many)
     - Created/updated by users

2. **InventoryItem**
   - Tracks individual stock items
   - Manages stock levels and reorder points
   - **Fields**:
     - Name, description, SKU
     - Current quantity, minimum stock level
     - Unit of measure
     - Cost price, selling price
   - **Relations**:
     - Category (many-to-one)
     - Inventory codes (one-to-many)
     - Transactions (one-to-many)
     - Created/updated by users

3. **InventoryCode**
   - Unique identifiers for inventory items
   - Tracks item conditions
   - **Relations**:
     - Inventory item (many-to-one)
     - Created/updated by users

4. **InventoryTransaction**
   - Records all stock movements
   - Supports various transaction types:
     - Stock additions
     - Adjustments
     - Transfers
     - Checkouts/returns
   - **Fields**:
     - Transaction type
     - Quantity, unit price
     - Reference numbers
     - Notes
   - **Relations**:
     - Inventory item (many-to-one)
     - Processed by user (many-to-one)
     - Related student (optional)

5. **UniformCategory**
   - Organizes uniform items
   - Tracks uniform types and variants
   - **Relations**:
     - Uniform items (one-to-many)
     - Created/updated by users

6. **UniformItem**
   - Tracks uniform stock
   - Manages sizes and quantities
   - **Relations**:
     - Category (many-to-one)
     - Uniform codes (one-to-many)
     - Transactions (one-to-many)
     - Checkouts (one-to-many)
     - Created/updated by users

7. **UniformCode**
   - Unique identifiers for uniform items
   - Tracks item conditions
   - **Relations**:
     - Uniform item (many-to-one)
     - Created/updated by users

8. **UniformCheckout**
   - Manages uniform distribution to students
   - Tracks issue and return dates
   - **Relations**:
     - Student (many-to-one)
     - Uniform items (many-to-many)
     - Processed by user (many-to-one)

9. **UniformTransaction**
   - Records uniform stock movements
   - Tracks all changes to uniform inventory
   - **Relations**:
     - Uniform item (many-to-one)
     - Student (many-to-one)
     - Processed by user (many-to-one)

10. **SpoiltLostRecord**
    - Tracks damaged or lost inventory
    - Records reasons and actions taken
    - **Relations**:
      - Inventory/uniform item (polymorphic)
      - Reported by user (many-to-one)
      - Resolved by user (many-to-one)

### Communication

The system provides multiple channels for school communication and collaboration:

1. **SchoolAnnouncement**
   - Publishes important notices to the school community
   - **Fields**:
     - Title, content, announcement type
     - Publication date and author
     - Tags for categorization
     - Active status and visibility
   - **Relations**:
     - Academic year/term (optional)
     - Created/updated by users
     - Read receipts (one-to-many)

2. **SchoolEvent**
   - Manages school calendar events and activities
   - **Fields**:
     - Event title, description, and type
     - Date, time, and duration
     - Location and organizer
     - Tags and target audience
   - **Relations**:
     - Class (optional)
     - Academic year/term
     - Created/updated by users

3. **Chat**
   - Facilitates real-time communication
   - **Fields**:
     - Creation and update timestamps
     - Chat type (direct/group)
   - **Relations**:
     - Participants (one-to-many)
     - Messages (one-to-many)

4. **ChatParticipant**
   - Manages chat membership and roles
   - **Fields**:
     - Role (admin, member, etc.)
     - Join/leave timestamps
   - **Relations**:
     - Chat (many-to-one)
     - User (many-to-one)
     - Student (optional, for parent-teacher chats)

5. **Message**
   - Stores communication between users
   - **Fields**:
     - Content (text/rich text)
     - Timestamps
     - Message status (sent/delivered/read)
     - File attachments
   - **Relations**:
     - Chat (many-to-one)
     - Sender (user, many-to-one)
     - Parent message (for threading)

6. **UserReadAnnouncement**
   - Tracks announcement read status
   - **Fields**:
     - Read timestamp
   - **Relations**:
     - User (many-to-one)
     - Announcement (many-to-one)

### Transportation

The system manages student transportation with the following components:

1. **TransportRoute**
   - Defines bus routes and schedules
   - **Fields**:
     - Route code and name
     - Day of operation
     - Start time and fare
     - Vehicle details
     - Academic year/term
   - **Relations**:
     - Student registrations (one-to-many)
     - Created by user (many-to-one)
     - Academic year/term (many-to-one)

2. **StudentRouteRegistration**
   - Manages student assignments to routes
   - **Fields**:
     - Student details
     - Route assignment
     - Pickup/drop-off points
     - Discounts and payments
     - Registration dates
   - **Relations**:
     - Student (many-to-one)
     - Route (many-to-one)
     - Academic year/term (many-to-one)
     - Created by user (many-to-one)

3. **RouteManagement**
   - Administrative controls for routes
   - **Fields**:
     - Route status (active/inactive)
     - Capacity tracking
     - Driver/attendant assignments
   - **Relations**:
     - Route (many-to-one)
     - Assigned staff (many-to-many)
     - Created/updated by users

## Conclusion

This documentation provides a comprehensive overview of the school management system's database schema. The schema is designed to support all major school operations including:

- **Academic Management**: Classes, subjects, timetables
- **Student Life**: Attendance, behavior, activities
- **Financial Operations**: Fees, payroll, expenses
- **Resource Management**: Inventory, uniforms, transportation
- **Communication**: Announcements, events, messaging

The schema follows these key design principles:
1. **Data Integrity**: Foreign key constraints and validations
2. **Audit Trail**: Created/updated timestamps and user tracking
3. **Soft Deletion**: isActive flags for data retention
4. **Flexibility**: Support for various school sizes and types
5. **Security**: Role-based access control

For implementation details and API documentation, please refer to the respective service documentation.

---
*Last Updated: July 23, 2025*

### Financial Management

The system tracks income and expenses:

- **IncomeCategory**: Categories for income
- **ExpenseCategory**: Categories for expenses
- **Income**: Income records
- **Expense**: Expense records
- **FinancialReport**: Financial reporting

### Library Management

The library system includes:

- **Book**: Book inventory
- **BookBorrowing**: Book checkout records

### Payroll Management

The payroll system includes:

- **Payroll**: Payroll periods
- **PayrollEntry**: Individual payroll entries

## Best Practices

The schema implements several database best practices:

1. **UUID Primary Keys**: All models use UUID as primary keys
2. **Timestamps**: Creation and update timestamps on all models
3. **Indexing**: Foreign keys and search fields are indexed
4. **Audit Trails**: Most models track who created/updated them
5. **Soft Deletion**: Uses `isActive` flags instead of hard deletes
6. **Decimal Precision**: Financial fields use appropriate precision

## Schema Maintenance

When modifying the schema:

1. Always run `npx prisma validate` before migrations
2. Use `npx prisma migrate dev --name descriptive_name` for development
3. Use `npx prisma migrate deploy` for production
4. Run `npx prisma generate` after migrations to update the client

## Critical Models

### StudentFees

```prisma
model StudentFees {
  id                String    @id @default(uuid())
  studentId         String
  academicYearId    String
  termId            String
  
  balancePrevTerm   Decimal   @db.Decimal(10, 2) @default(0)
  feesPayable       Decimal   @db.Decimal(10, 2)
  stationery        Decimal   @db.Decimal(10, 2)
  totalExpected     Decimal   @db.Decimal(10, 2)
  feesPaid          Decimal   @db.Decimal(10, 2) @default(0)
  balance           Decimal   @db.Decimal(10, 2)
  
  payments          FeePayment[]
  
  @@unique([studentId, academicYearId, termId])
}
```

### FeePayment

```prisma
model FeePayment {
  id                String      @id @default(uuid())
  studentFeesId     String
  
  amount            Decimal     @db.Decimal(10, 2)
  paymentDate       DateTime    @default(now())
  paymentMethod     PaymentMethod
  
  receiptNumber     String?
  transactionRef    String?
}
```

## Frontend Integration

When working with the frontend:

1. Ensure enums match exactly (e.g., `PaymentMethod` values)
2. Validate inputs against schema constraints
3. Handle nullable fields appropriately
4. Use proper date formatting for DateTime fields
5. Be aware of all required relations when creating records
