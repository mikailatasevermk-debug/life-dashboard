# Life Dashboard Testing Checklist

## 🧪 Manual Testing Guide

### 1. **Homepage Tests**
- [ ] Visit homepage at http://localhost:3000
- [ ] Verify Level 1 Player status shows with 0 coins initially
- [ ] Click sparkle icon - should add 10 coins with animation
- [ ] Click any life category card - should add 2 coins and navigate to that space
- [ ] Progress bar should update based on XP (100 XP = 1 level)
- [ ] Refresh page - coins and progress should persist (localStorage)

### 2. **Space Dashboard Tests (Click any category)**
- [ ] Back arrow returns to homepage
- [ ] "New Note" button opens modal
- [ ] Creating a note should:
  - [ ] Add 10 coins
  - [ ] Show in notes list
  - [ ] Persist after refresh

### 3. **Love Space Specific Tests**
- [ ] Love counter starts at 0
- [ ] "Add Moment ❤️" button increments counter
- [ ] Counter value persists after refresh
- [ ] Each increment adds 5 coins

### 4. **Goals Manager Tests**
- [ ] Click + to add new goal
- [ ] Fill in goal details and save
- [ ] Update progress with +1 or +10 buttons
- [ ] Progress bar fills as you update
- [ ] Completing a goal (100%) should:
  - [ ] Add 15 coins
  - [ ] Move goal to "Completed Goals" section
- [ ] Goals persist per category after refresh

### 5. **Mood Tracker Tests**
- [ ] Click any mood emoji
- [ ] Should add 3 coins
- [ ] Mood selection saved for the day

### 6. **Schedule Page Tests**
- [ ] Navigate to /schedule
- [ ] See sample events displayed
- [ ] Filter by All/Shared/Private works
- [ ] Filter by space type works

### 7. **Data Persistence Tests**
- [ ] Create notes, goals, update counters
- [ ] Refresh browser - all data should persist
- [ ] Open in new tab - same data should appear

## 🐛 Known Issues to Check

1. **Database Connection**
   - Currently using localStorage (no database yet)
   - API routes exist but need Supabase/PostgreSQL setup

2. **Authentication**
   - Auth pages created but not functional without database
   - Currently in demo mode

3. **Calendar Events**
   - Shows mock data only
   - Need to implement actual event creation

## 🚀 Deployment Testing

1. Visit: https://life-dashboard-five.vercel.app/
2. Run through all tests above on production
3. Check browser console for errors
4. Test on mobile device

## 📝 Testing Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Check for TypeScript errors
npx tsc --noEmit

# Run linter
npm run lint
```

## ✅ Working Features
- ✅ Gamification (coins, XP, levels)
- ✅ Goals tracking per category
- ✅ Love counter
- ✅ Mood tracking
- ✅ Local storage persistence
- ✅ Interactive buttons
- ✅ Navigation between spaces

## ⚠️ Needs Implementation
- ❌ Real database connection
- ❌ User authentication
- ❌ Actual event creation in calendar
- ❌ File/image uploads
- ❌ Note editing/deletion
- ❌ Cloud sync across devices

## 🔄 GitHub Updates

**No, I don't automatically update GitHub.** You need to tell me when to commit and push. Here's the workflow:

```bash
# To save changes to GitHub:
1. Tell me: "commit and push to github"
2. I'll stage, commit, and push changes

# Or manually:
git add .
git commit -m "Your message"
git push origin main
```

## 📱 Mobile Testing
- Test touch interactions
- Check responsive design
- Verify localStorage works on mobile browsers