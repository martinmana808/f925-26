## Relevant Files

- `src/components/ActivityManager.tsx` - Main component for managing activities and their display
- `src/components/ActivityManager.test.tsx` - Unit tests for ActivityManager
- `src/components/Timer.tsx` - Component for handling activity timers
- `src/components/Timer.test.tsx` - Unit tests for Timer
- `src/utils/storage.ts` - Local storage management utilities
- `src/utils/storage.test.ts` - Unit tests for storage utilities
- `src/types/activity.ts` - TypeScript types for activity-related data
- `src/hooks/useTimer.ts` - Custom hook for timer functionality
- `src/hooks/useTimer.test.ts` - Unit tests for timer hook

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use `npx jest [optional/path/to/test/file]` to run tests
- All components should be responsive and follow modern UI/UX practices
- Local storage operations should be wrapped in try-catch blocks for error handling

## Tasks

- [ ] 1.0 Project Setup and Basic Structure
  - [ ] 1.1 Initialize React project with TypeScript
  - [ ] 1.2 Set up testing environment with Jest
  - [ ] 1.3 Configure local storage utilities
  - [ ] 1.4 Create basic component structure

- [ ] 2.0 Activity Management Implementation
  - [ ] 2.1 Create activity data structure and types
  - [ ] 2.2 Implement activity CRUD operations
  - [ ] 2.3 Add time allocation validation
  - [ ] 2.4 Create activity list component

- [ ] 3.0 Timer Functionality
  - [ ] 3.1 Implement timer logic
  - [ ] 3.2 Add timer persistence
  - [ ] 3.3 Create timer UI components
  - [ ] 3.4 Implement activity switching

- [ ] 4.0 UI/UX Implementation
  - [ ] 4.1 Design and implement vertical activity rows
  - [ ] 4.2 Add real-time updates
  - [ ] 4.3 Implement responsive design
  - [ ] 4.4 Add visual feedback for active/inactive states

- [ ] 5.0 Data Persistence and State Management
  - [ ] 5.1 Implement local storage integration
  - [ ] 5.2 Add state management for activities
  - [ ] 5.3 Create data synchronization logic
  - [ ] 5.4 Implement error handling 
