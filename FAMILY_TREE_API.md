# Family Tree API Documentation

## Overview
The Family Tree API allows users to create, manage, and persist complete family tree structures with full CRUD operations for both the entire tree and individual members.

## Authentication
All endpoints require authentication via Bearer token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Base URL
```
/api/v1/family-tree
```

---

## Endpoints

### 1. Submit/Create Family Tree
**POST** `/api/v1/family-tree`

Submit a complete family tree with all members. This will either create a new tree or update an existing one.

#### Request Body
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
    },
    {
      "externalId": "S1",
      "name": "Jane Smith",
      "gender": "female",
      "birthYear": 1962,
      "birthMonth": 3,
      "deathYear": null,
      "parentIds": [],
      "spouseIds": ["F1"],
      "childrenIds": ["P1"],
      "relationshipToRoot": "Wife"
    },
    {
      "externalId": "P1",
      "name": "Robert Smith",
      "gender": "male",
      "birthYear": 1985,
      "birthMonth": 12,
      "deathYear": null,
      "parentIds": ["F1", "S1"],
      "spouseIds": [],
      "childrenIds": [],
      "relationshipToRoot": "Son"
    }
  ]
}
```

#### Response
```json
{
  "status": {
    "returnCode": 201,
    "returnMessage": "Family tree saved successfully!"
  },
  "data": {
    "treeId": "cuid-tree-id",
    "rootId": "F1",
    "memberCount": 3,
    "members": [
      {
        "id": "cuid-member-id",
        "externalId": "F1",
        "name": "John Smith",
        "gender": "male",
        "birthYear": 1960,
        "birthMonth": 5,
        "deathYear": null,
        "parentIds": [],
        "spouseIds": ["S1"],
        "childrenIds": ["P1"],
        "relationshipToRoot": "Root",
        "createdAt": "2026-06-29T10:00:00Z",
        "updatedAt": "2026-06-29T10:00:00Z"
      }
    ]
  }
}
```

---

### 2. Get Family Tree
**GET** `/api/v1/family-tree`

Retrieve the user's family tree with all members.

#### Response
```json
{
  "status": {
    "returnCode": 200,
    "returnMessage": "Family tree retrieved successfully"
  },
  "data": {
    "treeId": "cuid-tree-id",
    "rootId": "F1",
    "memberCount": 3,
    "members": [
      {
        "id": "cuid-member-id",
        "externalId": "F1",
        "name": "John Smith",
        "gender": "male",
        "birthYear": 1960,
        "birthMonth": 5,
        "deathYear": null,
        "parentIds": [],
        "spouseIds": ["S1"],
        "childrenIds": ["P1"],
        "relationshipToRoot": "Root",
        "createdAt": "2026-06-29T10:00:00Z",
        "updatedAt": "2026-06-29T10:00:00Z"
      }
    ],
    "createdAt": "2026-06-29T10:00:00Z",
    "updatedAt": "2026-06-29T10:00:00Z"
  }
}
```

---

### 3. Get Family Tree Statistics
**GET** `/api/v1/family-tree/stats`

Get statistics about the family tree.

#### Response
```json
{
  "status": {
    "returnCode": 200,
    "returnMessage": "Statistics retrieved successfully"
  },
  "data": {
    "totalMembers": 3,
    "maleCount": 2,
    "femaleCount": 1,
    "membersWithBirthDate": 3,
    "membersWithDeathDate": 0,
    "rootId": "F1",
    "createdAt": "2026-06-29T10:00:00Z",
    "updatedAt": "2026-06-29T10:00:00Z"
  }
}
```

---

### 4. Get All Members
**GET** `/api/v1/family-tree/members`

Get all members of the family tree with optional filtering.

#### Query Parameters
- `gender` (optional): Filter by gender (`male` or `female`)
- `relationshipToRoot` (optional): Filter by relationship to root
- `limit` (optional, default: 100): Number of results to return
- `offset` (optional, default: 0): Number of results to skip

#### Example
```
GET /api/v1/family-tree/members?gender=male&limit=10&offset=0
```

#### Response
```json
{
  "status": {
    "returnCode": 200,
    "returnMessage": "Members retrieved successfully"
  },
  "data": {
    "members": [
      {
        "id": "cuid-member-id",
        "externalId": "F1",
        "name": "John Smith",
        "gender": "male",
        "birthYear": 1960,
        "birthMonth": 5,
        "deathYear": null,
        "parentIds": [],
        "spouseIds": ["S1"],
        "childrenIds": ["P1"],
        "relationshipToRoot": "Root",
        "createdAt": "2026-06-29T10:00:00Z",
        "updatedAt": "2026-06-29T10:00:00Z"
      }
    ],
    "total": 2,
    "limit": 10,
    "offset": 0
  }
}
```

---

### 5. Get Specific Member
**GET** `/api/v1/family-tree/member/:memberId`

Get details of a specific family tree member.

#### Parameters
- `memberId`: The ID of the member to retrieve

#### Response
```json
{
  "status": {
    "returnCode": 200,
    "returnMessage": "Member retrieved successfully"
  },
  "data": {
    "id": "cuid-member-id",
    "externalId": "F1",
    "name": "John Smith",
    "gender": "male",
    "birthYear": 1960,
    "birthMonth": 5,
    "deathYear": null,
    "parentIds": [],
    "spouseIds": ["S1"],
    "childrenIds": ["P1"],
    "relationshipToRoot": "Root",
    "createdAt": "2026-06-29T10:00:00Z",
    "updatedAt": "2026-06-29T10:00:00Z"
  }
}
```

---

### 6. Add Member to Family Tree
**POST** `/api/v1/family-tree/member`

Add a single new member to an existing family tree.

#### Request Body
```json
{
  "externalId": "P2",
  "name": "Emily Smith",
  "gender": "female",
  "birthYear": 1988,
  "birthMonth": 7,
  "deathYear": null,
  "parentIds": ["F1", "S1"],
  "spouseIds": [],
  "childrenIds": [],
  "relationshipToRoot": "Daughter"
}
```

#### Response
```json
{
  "status": {
    "returnCode": 201,
    "returnMessage": "Member added successfully"
  },
  "data": {
    "id": "cuid-member-id",
    "externalId": "P2",
    "name": "Emily Smith",
    "gender": "female",
    "birthYear": 1988,
    "birthMonth": 7,
    "deathYear": null,
    "parentIds": ["F1", "S1"],
    "spouseIds": [],
    "childrenIds": [],
    "relationshipToRoot": "Daughter",
    "createdAt": "2026-06-29T10:00:00Z",
    "updatedAt": "2026-06-29T10:00:00Z"
  }
}
```

---

### 7. Update Member
**PUT** `/api/v1/family-tree/member/:memberId`

Update details of a specific family tree member.

#### Parameters
- `memberId`: The ID of the member to update

#### Request Body (all fields optional)
```json
{
  "name": "Jonathan Smith",
  "gender": "male",
  "birthYear": 1960,
  "birthMonth": 5,
  "deathYear": 2020,
  "parentIds": [],
  "spouseIds": ["S1"],
  "childrenIds": ["P1"],
  "relationshipToRoot": "Root"
}
```

#### Response
```json
{
  "status": {
    "returnCode": 200,
    "returnMessage": "Member updated successfully"
  },
  "data": {
    "id": "cuid-member-id",
    "externalId": "F1",
    "name": "Jonathan Smith",
    "gender": "male",
    "birthYear": 1960,
    "birthMonth": 5,
    "deathYear": 2020,
    "parentIds": [],
    "spouseIds": ["S1"],
    "childrenIds": ["P1"],
    "relationshipToRoot": "Root",
    "createdAt": "2026-06-29T10:00:00Z",
    "updatedAt": "2026-06-29T10:00:00Z"
  }
}
```

---

### 8. Delete Member
**DELETE** `/api/v1/family-tree/member/:memberId`

Delete a specific family tree member.

#### Parameters
- `memberId`: The ID of the member to delete

#### Response
```json
{
  "status": {
    "returnCode": 200,
    "returnMessage": "Member deleted successfully"
  }
}
```

---

### 9. Delete Entire Family Tree
**DELETE** `/api/v1/family-tree`

Delete the user's entire family tree and all associated members.

#### Response
```json
{
  "status": {
    "returnCode": 200,
    "returnMessage": "Family tree deleted successfully"
  }
}
```

---

## Error Responses

### Unauthorized (401)
```json
{
  "status": {
    "returnCode": 401,
    "returnMessage": "Unauthorized: User not found"
  }
}
```

### Not Found (404)
```json
{
  "status": {
    "returnCode": 404,
    "returnMessage": "Family tree not found"
  }
}
```

### Bad Request (400)
```json
{
  "status": {
    "returnCode": 400,
    "returnMessage": "Members array is required and cannot be empty"
  }
}
```

### Conflict (409)
```json
{
  "status": {
    "returnCode": 409,
    "returnMessage": "Member with this external ID already exists"
  }
}
```

### Internal Server Error (500)
```json
{
  "status": {
    "returnCode": 500,
    "returnMessage": "Failed to save family tree"
  }
}
```

---

## Data Models

### Family Tree
```javascript
{
  id: String (cuid),
  userId: String (foreign key to User),
  rootId: String (external ID of root member),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Family Tree Member
```javascript
{
  id: String (cuid),
  treeId: String (foreign key to FamilyTree),
  externalId: String (frontend-generated ID),
  name: String (max 255 chars),
  gender: String ('male' or 'female'),
  birthYear: Integer (nullable),
  birthMonth: Integer 1-12 (nullable),
  deathYear: Integer (nullable),
  parentIds: Array<String> (stored as JSON),
  spouseIds: Array<String> (stored as JSON),
  childrenIds: Array<String> (stored as JSON),
  relationshipToRoot: String (e.g., "Son", "Daughter", "Father", etc.),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

---

## Usage Examples

### Example 1: Create a family tree with 3 members
```bash
curl -X POST http://localhost:4210/api/v1/family-tree \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "rootId": "F1",
    "memberCount": 3,
    "members": [
      {
        "externalId": "F1",
        "name": "John Smith",
        "gender": "male",
        "birthYear": 1960,
        "birthMonth": 5,
        "parentIds": [],
        "spouseIds": ["S1"],
        "childrenIds": ["P1"],
        "relationshipToRoot": "Root"
      },
      {
        "externalId": "S1",
        "name": "Jane Smith",
        "gender": "female",
        "birthYear": 1962,
        "birthMonth": 3,
        "parentIds": [],
        "spouseIds": ["F1"],
        "childrenIds": ["P1"],
        "relationshipToRoot": "Wife"
      },
      {
        "externalId": "P1",
        "name": "Robert Smith",
        "gender": "male",
        "birthYear": 1985,
        "birthMonth": 12,
        "parentIds": ["F1", "S1"],
        "spouseIds": [],
        "childrenIds": [],
        "relationshipToRoot": "Son"
      }
    ]
  }'
```

### Example 2: Get family tree
```bash
curl -X GET http://localhost:4210/api/v1/family-tree \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 3: Get statistics
```bash
curl -X GET http://localhost:4210/api/v1/family-tree/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 4: Filter members by gender
```bash
curl -X GET "http://localhost:4210/api/v1/family-tree/members?gender=female&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

- All `parentIds`, `spouseIds`, and `childrenIds` should reference the `externalId` of members
- The `relationshipToRoot` field describes the relationship of each member to the root member
- Birth dates are stored as separate year and month integers (month is 1-12)
- Death year is optional and stored separately
- The API maintains referential integrity through the external ID system
- Each user can have only one family tree; submitting again will update the existing one
- The `externalId` must be unique within a single family tree
