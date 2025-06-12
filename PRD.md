# NowWhat - Product Requirements Document (PRD)

## Overview
NowWhat is a web application that helps users visualize and manage their daily activities through time allocation and real-time tracking. The app provides a visual representation of how users spend their 24-hour day, with live countdown timers for active activities.

## Core Features

### 1. Activity Management
- Users can create activities with specific time allocations
- Each activity must have:
  - Name
  - Duration (in hours)
  - Visual representation in a vertical row
- Activities cannot overlap or exceed 24 hours total
- Activities are displayed in vertical rows, with height proportional to their duration
- Activities can be edited or deleted

### 2. Time Visualization
- Activities are displayed as vertical rows
- Row height is proportional to the activity's duration (e.g., 8h work = 1/3 of total height)
- Unallocated time is displayed as a separate row
- Total allocated time is always visible
- Remaining unallocated time is prominently displayed

### 3. Timer Functionality
- Each activity has a countdown timer
- Only one activity can be active at a time
- Timers continue running even after page reload
- Users can switch between activities by clicking on them
- Timers cannot be paused
- Timer state persists across sessions using local storage

### 4. User Interface
- Clean, modern design with vertical activity rows
- Real-time updates for all time-related displays
- Clear visual hierarchy showing active vs. inactive activities
- Prominent display of:
  - Current active activity
  - Remaining time for active activity
  - Total allocated time
  - Unallocated time

### 5. Data Persistence
- All data stored in local storage:
  - Activity definitions
  - Current active activity
  - Timer states
  - Time allocations

## Technical Requirements

### Frontend
- Single-page application (SPA)
- Real-time UI updates
- Responsive design
- Local storage integration
- Timer synchronization across page reloads

### Data Structure
```javascript
{
  activities: [
    {
      id: string,
      name: string,
      duration: number, // in hours
      isActive: boolean,
      remainingTime: number // in seconds
    }
  ],
  unallocatedTime: number, // in hours
  lastUpdated: timestamp
}
```

### Performance Requirements
- Smooth UI updates
- Accurate timer functionality
- Immediate response to user interactions
- Efficient local storage usage

## User Flow

1. Initial Load
   - Load saved activities from local storage
   - Calculate unallocated time
   - Resume active timer if exists
   - Display all activities in vertical rows

2. Adding Activity
   - User enters activity name and duration
   - System validates total time doesn't exceed 24h
   - New activity is added to display
   - Unallocated time is updated

3. Switching Activities
   - User clicks on inactive activity
   - Current active timer is stopped
   - New activity becomes active
   - Timer starts for new activity
   - UI updates to reflect change

4. Editing Activity
   - User modifies activity details
   - System recalculates time allocations
   - UI updates to reflect changes
   - Local storage is updated

## Future Considerations
- Activity categories/tags
- Daily/weekly views
- Activity history
- Export/import functionality
- Custom themes
- Mobile app version

## Success Metrics
- User engagement (time spent in app)
- Number of activities created
- Frequency of activity switches
- User retention
- Time allocation accuracy 
