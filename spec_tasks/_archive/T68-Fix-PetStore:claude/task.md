# T68-Fix-PetStore TypeScript Errors

## Priority: HIGH
## Category: TypeScript Fix
## Component: pet-store.ts

## Description
Fix TypeScript errors in pet-store.ts related to null safety and type mismatches.

## Specific Issues
1. Weight property type mismatches (number vs string)
2. Null safety issues with pet properties
3. Optional chaining for undefined values

## Success Criteria
- [ ] All TypeScript errors in hooks/pet-store.ts resolved
- [ ] Weight type handling fixed
- [ ] Null safety checks implemented
- [ ] No breaking changes to existing functionality

## Files to Modify
- hooks/pet-store.ts

## Test Command
```bash
npx tsc --noEmit
```

## Target: Fix within 10 minutes