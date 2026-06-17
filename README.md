# Mini CRM Vendor Directory

A full-stack vendor management system built with Next.js, NestJS, and MongoDB.

## Project Structure

```
.
├── backend/          # NestJS backend
├── frontend/         # Next.js frontend
└── README.md
```

## Prerequisites

- Node.js 20+
- MongoDB (local or replica set for transactions)
- npm or yarn

## Environment Variables

### Backend (backend/.env)

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/vendor-crm
```

### Frontend (frontend/.env)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Installation

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Running the Application

### Backend

First, seed the database with demo data:

```bash
cd backend
npm run seed
```

Then start the server:

```bash
npm run start:dev
```

The backend will be available at http://localhost:3001

### Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:3000

## API Endpoints

### Vendors

- `POST /api/v1/companies/:companyId/vendors` - Create a new vendor
- `GET /api/v1/companies/:companyId/vendors` - List all vendors for a company
- `GET /api/v1/companies/:companyId/vendors/:vendorId` - Get a single vendor
- `PATCH /api/v1/companies/:companyId/vendors/:vendorId` - Update a vendor
- `DELETE /api/v1/companies/:companyId/vendors/:vendorId` - Soft delete a vendor

## Postman Collection

A Postman collection is included in the root of the project: [Vendor_CRM.postman_collection.json](file:///c:/vendor-task/Vendor_CRM.postman_collection.json).

### How to Use:
1. Open Postman and click on **Import**.
2. Select the `Vendor_CRM.postman_collection.json` file.
3. The collection is pre-configured with the following collection variables:
   - `baseUrl`: `http://localhost:3001` (Backend API base URL)
   - `companyId`: `demo-company` (Default company ID)
   - `vendorId`: Temporary vendor ID placeholder
4. **Automated Testing & Variable Extraction**: 
   - When you execute the **Create Vendor** request, a post-request test script automatically extracts the created vendor's `id` from the JSON response and updates the collection's `vendorId` variable.
   - Subsequent requests (Get, Update, and Delete Vendor) will immediately work using the newly created vendor's ID without manual copying.
5. All requests contain pre-configured test assertions verifying successful response structures and statuses (e.g., `200` or `201`).

## Vendor Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | auto | Unique identifier |
| companyId | string | yes | Company this vendor belongs to |
| name | string | yes | Vendor name (2-80 characters) |
| email | string | no | Valid email address |
| phone | string | no | Phone number |
| category | enum | yes | SERVICE_PROVIDER, SOFTWARE, RENT, FINANCE, OTHER |
| status | enum | no | ACTIVE, INACTIVE (default: ACTIVE) |
| notes | string | no | Additional notes (max 500 characters) |
| createdAt | date | auto | Creation timestamp |
| updatedAt | date | auto | Last update timestamp |
| deletedAt | date | auto | Soft deletion timestamp |

## Validation Rules

- Name: 2-80 characters, required
- Email: must be valid if provided
- Notes: max 500 characters
- Category: must be one of the allowed enum values
- Status: must be one of the allowed enum values (if provided)
- Email must be unique per company (for active vendors)

## Business Rules

- Vendors are company-specific - a vendor from one company can't be accessed by another
- Deleting a vendor is a soft delete (sets deletedAt timestamp)
- Soft-deleted vendors are not included in list responses
- Email uniqueness is enforced per company (only for active vendors)

## MongoDB Indexes

- `{ companyId: 1, status: 1, createdAt: -1 }` - For efficient listing with filters
- `{ companyId: 1, deletedAt: 1 }` - For excluding deleted vendors
- `{ companyId: 1, email: 1 }` - Unique index for active vendors with email

## Testing

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

## Linting & Type Checking

### Backend

```bash
cd backend
npm run lint
npm run typecheck
```

### Frontend

```bash
cd frontend
npm run lint
npm run typecheck
```

## Building

### Backend

```bash
cd backend
npm run build
```

### Frontend

```bash
cd frontend
npm run build
```

## Technologies

### Backend
- NestJS
- TypeScript
- Mongoose
- MongoDB
- class-validator
- class-transformer

### Frontend
- Next.js
- TypeScript
- React Query
- React Hook Form
- Zod
- Tailwind CSS
- Lucide Icons

## Assumptions

- Companies are not managed in this system - you just use a companyId
- Authentication is not implemented
- MongoDB replica set is available for transactions (if not, single-node will work but transactions won't be supported)

## License

MIT
