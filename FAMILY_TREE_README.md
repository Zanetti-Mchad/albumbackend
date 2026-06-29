# Family Tree Backend Implementation

## Overview

This document outlines the complete backend implementation for the Family Tree feature. It includes Prisma schema updates, a comprehensive controller with CRUD operations, routes, and API documentation.

## What Was Created

### 1. Prisma Schema Updates (`prisma/schema.prisma`)

Added two new models to support family trees:

#### `FamilyTree` Model
- Main container for a user's family tree
- One-to-one relationship with User
- Stores the root member ID
- Cascading deletes when user is deleted

```prisma
model FamilyTree {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation("UserFamilyTrees", fields: [userId], references: [id], onDelete: Cascade)
  rootId      String?  @db.VarChar(255)
  members     FamilyTreeMember[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([userId])
  @@map("family_trees")
}
```

#### `FamilyTreeMember` Model
- Represents individual family members/nodes in the tree
- Stores person data: name, gender, birth/death dates
- JSON fields for storing relationship IDs (parent, spouse, children)
- Cascade delete with FamilyTree

```prisma
model FamilyTreeMember {
  id              String   @id @default(cuid())
  treeId          String
  tree            FamilyTree @relation(fields: [treeId], references: [id], onDelete: Cascade)
  externalId      String   @db.VarChar(255)
  name            String   @db.VarChar(255)
  gender          String   @db.VarChar(10)
  birthYear       Int?
  birthMonth      Int?
  deathYear       Int?
  parentIds       Json     @default("[]")
  spouseIds       Json     @default("[]")
  childrenIds     Json     @default("[]")
  relationshipToRoot String? @db.VarChar(100)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@unique([treeId, externalId])
  @@index([treeId])
  @@index([gender])
  @@map("family_tree_members")
}
```

Also updated the User model to include the relationship:
```prisma
familyTrees     FamilyTree[]      @relation("UserFamilyTrees")
```

### 2. Database Migration

Migration file: `prisma/migrations/20260629110029_add_family_tree_models/migration.sql`

Run: `npx prisma migrate dev --name add_family_tree_models`

This creates:
- `family_trees` table
- `family_tree_members` table
- Indexes on userId and treeId for efficient queries
- Unique constraint on (treeId, externalId) to prevent duplicate members

### 3. Controller (`src/controllers/familytreeController.js`)

Implements 9 endpoint handlers:

1. **submitFamilyTree** - POST /api/v1/family-tree
   - Creates or updates a complete family tree with all members
   - Deletes existing members and creates new ones (atomic operation)
   - Perfect for the frontend's "Submit" button

2. **getFamilyTree** - GET /api/v1/family-tree
   - Retrieves user's complete family tree with all members
   - Useful for loading persisted data on app startup

3. **getFamilyTreeStats** - GET /api/v1/family-tree/stats
   - Returns statistics: total members, gender counts, birth/death counts
   - Helpful for analytics and tree summaries

4. **getFamilyTreeMembers** - GET /api/v1/family-tree/members
   - Lists all members with filtering (gender, relationship, pagination)
   - Supports limit/offset for pagination

5. **getFamilyTreeMember** - GET /api/v1/family-tree/member/:memberId
   - Gets a single member by their database ID
   - Includes all relationships and dates

6. **addFamilyTreeMember** - POST /api/v1/family-tree/member
   - Adds a single member to an existing tree
   - Validates against duplicate externalIds

7. **updateFamilyTreeMember** - PUT /api/v1/family-tree/member/:memberId
   - Updates any field of a member
   - Partial updates supported (only send fields to change)

8. **deleteFamilyTreeMember** - DELETE /api/v1/family-tree/member/:memberId
   - Removes a member from the tree
   - Note: Doesn't cascade; parent-child relationships remain as IDs

9. **deleteFamilyTree** - DELETE /api/v1/family-tree
   - Deletes user's entire tree and all members
   - Cascading delete through Prisma relations

**Key Features:**
- Helper function `formatMemberForResponse` parses JSON fields for response
- All endpoints protected by `authenticate` middleware
- Consistent error handling and response formatting
- Comprehensive validation of input data

### 4. Routes (`src/routes/familytreeRoutes.js`)

Express router with all endpoints:

```javascript
POST   /api/v1/family-tree              // submitFamilyTree
GET    /api/v1/family-tree              // getFamilyTree
GET    /api/v1/family-tree/stats        // getFamilyTreeStats
DELETE /api/v1/family-tree              // deleteFamilyTree

GET    /api/v1/family-tree/members      // getFamilyTreeMembers (with filters)
POST   /api/v1/family-tree/member       // addFamilyTreeMember
GET    /api/v1/family-tree/member/:memberId   // getFamilyTreeMember
PUT    /api/v1/family-tree/member/:memberId   // updateFamilyTreeMember
DELETE /api/v1/family-tree/member/:memberId   // deleteFamilyTreeMember
```

All routes require authentication via `authenticate` middleware.

### 5. Server Integration (`src/server.js`)

Added import and route registration:
```javascript
const familytreeRoutes = require('./routes/familytreeRoutes');
// ...
app.use('/api/v1/family-tree', familytreeRoutes);
```

## API Endpoints Summary

### Main Tree Operations
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/family-tree` | Create/update entire tree |
| GET | `/api/v1/family-tree` | Get full tree with members |
| DELETE | `/api/v1/family-tree` | Delete entire tree |
| GET | `/api/v1/family-tree/stats` | Get tree statistics |

### Member Operations
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/family-tree/member` | Add single member |
| GET | `/api/v1/family-tree/members` | List members (filterable) |
| GET | `/api/v1/family-tree/member/:id` | Get specific member |
| PUT | `/api/v1/family-tree/member/:id` | Update member |
| DELETE | `/api/v1/family-tree/member/:id` | Delete member |

## Data Flow

### Saving a Family Tree (Frontend → Backend)

1. User builds tree in React component
2. Clicks "Submit Family Tree" button
3. Frontend makes POST to `/api/v1/family-tree` with payload:
   ```json
   {
     "rootId": "F1",
     "memberCount": 3,
     "members": [
       { "externalId": "F1", "name": "John", "gender": "male", ... }
     ]
   }
   ```
4. Backend creates FamilyTree record if not exists
5. Deletes all existing members
6. Creates new members with relationships
7. Returns 201 with created tree and members

### Loading a Family Tree (Backend → Frontend)

1. Frontend loads component or clicks "Load Tree"
2. Makes GET to `/api/v1/family-tree`
3. Backend queries FamilyTree + members for current user
4. Returns complete tree data
5. Frontend populates state and re-renders tree visualization

## Response Format

All endpoints follow a consistent format:

**Success Response:**
```json
{
  "status": {
    "returnCode": 200,
    "returnMessage": "Success message"
  },
  "data": {
    // endpoint-specific data
  }
}
```

**Error Response:**
```json
{
  "status": {
    "returnCode": 400,
    "returnMessage": "Error message"
  }
}
```

## Error Handling

- **401 Unauthorized** - User not authenticated
- **400 Bad Request** - Invalid input data
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Resource already exists (duplicate externalId)
- **500 Internal Server Error** - Server error

## Frontend Integration

Update your component's `submitTree` function to use `/api/v1/family-tree` endpoint (not `/api/family-tree`).

See `FRONTEND_INTEGRATION.md` for complete integration guide with example functions.

## Testing

### Create a Family Tree
```bash
curl -X POST http://localhost:4210/api/v1/family-tree \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "rootId": "F1",
    "memberCount": 1,
    "members": [
      {
        "externalId": "F1",
        "name": "John Smith",
        "gender": "male",
        "birthYear": 1960,
        "parentIds": [],
        "spouseIds": [],
        "childrenIds": []
      }
    ]
  }'
```

### Get Family Tree
```bash
curl -X GET http://localhost:4210/api/v1/family-tree \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Statistics
```bash
curl -X GET http://localhost:4210/api/v1/family-tree/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Schema Relationships

```
User (1)
  ↓ (has many)
FamilyTree (1)
  ↓ (has many)
FamilyTreeMember (many)
  └─ stores IDs as JSON arrays:
     - parentIds (references other members)
     - spouseIds (references other members)
     - childrenIds (references other members)
```

## Key Design Decisions

1. **External IDs**: Frontend generates IDs (F1, S1, P1, etc.) that are different from database IDs
   - Allows frontend to work offline without database IDs
   - Simple mapping when saving/loading

2. **JSON Arrays for Relationships**: Instead of junction tables
   - Simpler schema and faster queries
   - Relationships are directional (parentIds, childrenIds, etc.)
   - No need for separate relationship tables

3. **Atomic Updates**: Submitting tree replaces all members
   - Ensures consistency
   - No orphaned members
   - Matches frontend's reset behavior

4. **Cascade Deletes**: When tree deleted, all members deleted automatically
   - Maintains data integrity
   - No orphaned records

5. **One Tree Per User**: Each user has maximum one family tree
   - Simplified data model
   - Clear ownership
   - Future: could extend to multiple trees

## Future Enhancements

1. **Soft Deletes**: Keep deleted members for audit trail
2. **Version History**: Track tree changes over time
3. **Media Attachments**: Link photos to family members
4. **Sharing**: Allow family members to view/edit shared trees
5. **Import/Export**: GEDCOM file support for genealogy tools
6. **Duplicate Detection**: Find similar members
7. **Auto-relationships**: Infer relationships from existing ones
8. **Batch Operations**: Update multiple members at once
9. **Real-time Sync**: WebSocket support for collaborative editing

## Files Modified/Created

**Modified:**
- `prisma/schema.prisma` - Added FamilyTree and FamilyTreeMember models
- `src/server.js` - Added family tree routes import and registration

**Created:**
- `src/controllers/familytreeController.js` - 9 handler functions
- `src/routes/familytreeRoutes.js` - Express router with all endpoints
- `FAMILY_TREE_API.md` - Complete API documentation
- `FRONTEND_INTEGRATION.md` - Integration guide for frontend
- `FAMILY_TREE_README.md` - This file

**Database:**
- `prisma/migrations/20260629110029_add_family_tree_models/` - Migration files

## Setup Instructions

1. **Update schema** ✓ (already done)
2. **Run migration** ✓ (already done)
   ```bash
   npx prisma migrate dev --name add_family_tree_models
   ```
3. **Copy controller** ✓ (already done)
4. **Copy routes** ✓ (already done)
5. **Update server.js** ✓ (already done)
6. **Restart server**
   ```bash
   npm run dev
   ```
7. **Test endpoints** (see Testing section above)
8. **Update frontend** (see FRONTEND_INTEGRATION.md)

## Support

For API documentation, see `FAMILY_TREE_API.md`
For frontend integration, see `FRONTEND_INTEGRATION.md`
