Task: T99: Expo Go TypeScript Fixes — SPEC task

Context:
- Provider: anthropic
- Model: claude-3-5-sonnet-20241022
- Priority: high
- Difficulty: 2/5
- Dependencies: none

SPEC Excerpt:

### T99: Expo Go TypeScript Fixes
- Goal: Fix TypeScript errors in hooks/pet-store.ts to make Expo Go work properly
- Actions: Fix supabase null checks, type mismatches, and missing AI service methods
- Acceptance: Expo Go opens without "opening project" hang, all TypeScript errors resolved

Specific Issues to Fix:
1. Line 205, 210, 287, 348: 'supabase' değerinin 'null' olması olasıdır - add null checks
2. Line 107: Type mismatch in getMockPets() mapping - fix Pet interface compatibility  
3. Line 323, 398: Missing triggerLostPetAutomation and triggerFoundPetAutomation methods in AIServiceManager
4. Line 361: 'ownership' property not in Pet type - remove or add to interface

Rules:
- Fix only the TypeScript errors, don't change functionality
- Keep mock data fallbacks working
- Ensure supabase null safety throughout
- When this task is completed, update status.json to {"state": "completed"}
