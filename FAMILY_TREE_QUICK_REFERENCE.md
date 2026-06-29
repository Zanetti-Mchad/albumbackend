# Family Tree API - Quick Reference

## Base URL
```
/api/v1/family-tree
```

## All Endpoints

### Tree Management
```
POST   /api/v1/family-tree              Create or update entire tree
GET    /api/v1/family-tree              Get user's complete tree
DELETE /api/v1/family-tree              Delete entire tree
GET    /api/v1/family-tree/stats        Get tree statistics
```

### Member Management
```
POST   /api/v1/family-tree/member                Add single member
GET    /api/v1/family-tree/members               List all members (with filters)
GET    /api/v1/family-tree/member/:id            Get specific member
PUT    /api/v1/family-tree/member/:id            Update member
DELETE /api/v1/family-tree/member/:id            Delete member
```

## Key Facts

- **Authentication**: Required (Bearer token)
- **Database**: PostgreSQL via Prisma
- **Response Format**: `{ status: { returnCode, returnMessage }, data: {...} }`
- **One Tree Per User**: Each user has a maximum of one family tree
- **External IDs**: Frontend generates (F1, S1, P1, etc.)
- **Relationships**: Stored as JSON arrays (parentIds, spouseIds, childrenIds)

## Frontend Integration

Update the submit endpoint from `/api/family-tree` to `/api/v1/family-tree`

```javascript
const response = await fetch('/api/v1/family-tree', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(payload),
});
```

## Payload Structure

### Submitting Tree
```json
{
  "rootId": "F1",
  "memberCount": 3,
  "members": [
    {
      "externalId": "F1",
      "name": "John Smith",
      "gender": "male",
      "birthYear": 1960,
      "birthMonth": 5,
      "deathYear": null,
      "parentIds": [],
      "spouseIds": ["S1"],
      "childrenIds": ["P1"],
      "relationshipToRoot": "Root"
    }
  ]
}
```

## Common Status Codes

| Code | Meaning | When |
|------|---------|------|
| 201 | Created | POST successful |
| 200 | OK | GET/PUT/DELETE successful |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | No token or invalid token |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate externalId |
| 500 | Server Error | Backend error |

## Response Examples

### Success (201)
```json
{
  "status": {
    "returnCode": 201,
    "returnMessage": "Family tree saved successfully!"
  },
  "data": {
    "treeId": "cuid-id",
    "rootId": "F1",
    "memberCount": 3,
    "members": [...]
  }
}
```

### Error (400)
```json
{
  "status": {
    "returnCode": 400,
    "returnMessage": "Members array is required and cannot be empty"
  }
}
```

## Database Tables

### family_trees
```
id (PK)
userId (FK)
rootId (varchar 255)
createdAt
updatedAt
```

### family_tree_members
```
id (PK)
treeId (FK)
externalId (varchar 255)
name (varchar 255)
gender (varchar 10)
birthYear (int, nullable)
birthMonth (int, nullable)
deathYear (int, nullable)
parentIds (json array)
spouseIds (json array)
childrenIds (json array)
relationshipToRoot (varchar 100, nullable)
createdAt
updatedAt
```

## Unique Constraints
- `(treeId, externalId)` - Prevents duplicate members in same tree

## Indexes
- `userId` on family_trees
- `treeId` on family_tree_members
- `gender` on family_tree_members

## Cascade Deletes
- Deleting FamilyTree → deletes all FamilyTreeMembers
- Deleting User → deletes User's FamilyTree and all Members

## Files Overview

| File | Purpose |
|------|---------|
| `src/controllers/familytreeController.js` | 9 handler functions |
| `src/routes/familytreeRoutes.js` | Express router with all 9 routes |
| `prisma/schema.prisma` | Database schema (2 models added) |
| `src/server.js` | Server setup (routes registered) |
| `FAMILY_TREE_API.md` | Complete API documentation |
| `FAMILY_TREE_README.md` | Implementation guide |
| `FRONTEND_INTEGRATION.md` | Frontend integration examples |

## Setup Status
✅ Schema updated
✅ Models added to Prisma
✅ Migration created and applied
✅ Controller implemented
✅ Routes created
✅ Server integrated
✅ Documentation provided

## Next Steps
1. Restart server: `npm run dev`
2. Update frontend endpoint from `/api/family-tree` to `/api/v1/family-tree`
3. Test with provided curl examples
4. See FAMILY_TREE_API.md for full endpoint documentation
