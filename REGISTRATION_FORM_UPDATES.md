# Registration Form Field Removal - Nov 16, 2025

## Changes Made

### Frontend (`plutex-admin-portal`)
Removed the following fields from `/pages/register.tsx`:
- ✅ **Website** - Removed from Basic Information section
- ✅ **State/Province** - Removed from Business Address section
- ✅ **ZIP Code** - Removed from Business Address section
- ✅ **Tax ID (EIN)** - Removed from Business Details section

### Backend (`plutex-backend`)
Updated `prisma/schema.prisma` to make removed fields optional:

#### User Model (lines 76-77)
- `state` changed from `String` to `String?`
- `zipCode` changed from `String` to `String?`

#### Vendor Model (lines 110-111)
- `state` changed from `String` to `String?`
- `zipCode` changed from `String` to `String?`

**Note:** `website` and `taxId` were already optional in the schema.

## Database Migration Required

After these schema changes, you need to run a Prisma migration:

```bash
cd /Users/zamteldeveloper/Documents/Personal\ Projects/plutex-backend

# Generate and apply migration
npx prisma migrate dev --name make_state_zipcode_optional

# Or if already deployed, create migration without applying
npx prisma migrate dev --create-only --name make_state_zipcode_optional
```

## Impact Analysis

### ✅ No Breaking Changes
- Fields are now optional, so existing records with these values will continue to work
- New registrations will simply not include these fields
- Backend API will accept requests without these fields

### 📝 Form Structure After Changes

**Basic Information:**
- Business Name *
- Email Address *
- Phone Number *

**Account Security:**
- Password *
- Confirm Password *

**Business Address:**
- Street Address *
- City *
- Country *

**Business Details:**
- Business Description
- Business Type

## Testing Checklist

- [ ] Test vendor registration with new form
- [ ] Verify backend accepts requests without removed fields
- [ ] Check existing vendors still display correctly
- [ ] Confirm database migration applied successfully
- [ ] Test user creation flow
- [ ] Verify no validation errors on backend

## Deployment Steps

1. **Backend First:**
   ```bash
   cd plutex-backend
   npx prisma migrate deploy  # For production
   npm run build
   # Deploy backend
   ```

2. **Frontend Second:**
   ```bash
   cd plutex-admin-portal
   npm run build
   # Deploy frontend
   ```

## Rollback Plan

If issues occur, the fields can be restored:
1. Revert frontend changes in `register.tsx`
2. Revert schema changes in `schema.prisma`
3. Create new migration to restore required fields
4. Redeploy both applications
