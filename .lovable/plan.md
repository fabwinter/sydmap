
# SYDMAP Enhancement Plan

## Current State Summary

SYDMAP is a Sydney activity discovery app with:
- **Home page**: Search, filter chips, "Surprise Me" wheel, featured activities, recommendations
- **Map view**: Working Mapbox integration with activity markers, popups, search, and geolocation
- **Activity details**: Full activity page with photos, reviews, amenities, and check-in modal
- **Saved page**: Playlists and saved places (static data)
- **Chat page**: AI assistant with starter prompts (mock responses)
- **Profile page**: User stats, badges, check-ins, tabs for playlists/friends

All data is currently static/hardcoded. The app has a polished UI with a teal/coral color scheme.

## Recommended Enhancements

### 1. Enable Lovable Cloud Backend
Set up a persistent backend to store real data for activities, users, and interactions.

**Database tables to create:**
- `profiles` - User profiles with avatar, bio, settings
- `activities` - All activity/location data with coordinates
- `check_ins` - User check-in history with ratings and photos
- `saved_items` - User saved/bookmarked activities
- `playlists` - User-created playlists
- `playlist_items` - Junction table for playlist contents
- `reviews` - User reviews for activities

### 2. Authentication Flow
Add user authentication for personalized features.

**Implementation:**
- Login/signup page with email authentication
- Social login options (Google)
- Protected routes for saved items, profile, and check-ins
- Guest browsing mode for discovery features

### 3. Real Activity Data Integration
Connect the static activity cards to the database.

**Updates needed:**
- `FeaturedSection` and `RecommendedSection` fetch from Supabase
- `ActivityDetails` page loads activity by ID from database
- Map markers pull from database instead of hardcoded array
- Search functionality queries the database

### 4. Functional Check-In System
Make the check-in modal save real data.

**Features:**
- Save check-ins to database with rating, comment, photo
- Update user stats (check-in count) on profile
- Display check-in history on profile page
- Optional photo upload to Supabase Storage

### 5. Save/Bookmark Functionality
Enable users to save and organize activities.

**Implementation:**
- Heart button on activity cards saves to database
- Saved page fetches user's saved items
- Create/manage playlists with activities
- Add/remove activities from playlists

### 6. AI Chat Enhancement
Upgrade the chat assistant with real AI responses.

**Options:**
- Connect Lovable AI for natural language activity recommendations
- Parse user queries and filter activities accordingly
- "Show on map" button navigates to map with filtered results

---

## Technical Details

### Database Schema (Supabase)

```text
profiles
├── id (uuid, FK to auth.users)
├── username (text)
├── avatar_url (text)
├── bio (text)
├── created_at (timestamp)

activities
├── id (uuid, PK)
├── name (text)
├── category (text)
├── description (text)
├── latitude (float8)
├── longitude (float8)
├── address (text)
├── phone (text)
├── website (text)
├── rating (float)
├── review_count (int)
├── is_open (boolean)
├── opens_at (time)
├── closes_at (time)
├── image_url (text)
├── created_at (timestamp)

check_ins
├── id (uuid, PK)
├── user_id (uuid, FK to profiles)
├── activity_id (uuid, FK to activities)
├── rating (int)
├── comment (text)
├── photo_url (text)
├── is_public (boolean)
├── created_at (timestamp)

saved_items
├── id (uuid, PK)
├── user_id (uuid, FK to profiles)
├── activity_id (uuid, FK to activities)
├── created_at (timestamp)

playlists
├── id (uuid, PK)
├── user_id (uuid, FK to profiles)
├── name (text)
├── emoji (text)
├── created_at (timestamp)

playlist_items
├── id (uuid, PK)
├── playlist_id (uuid, FK to playlists)
├── activity_id (uuid, FK to activities)
├── added_at (timestamp)
```

### Implementation Order

1. **Enable Lovable Cloud** - Provision Supabase backend
2. **Create database schema** - Tables, RLS policies, seed data
3. **Add authentication** - Login page, auth context, protected routes
4. **Connect activities** - Fetch from database, update components
5. **Implement save/bookmark** - Heart button, saved page
6. **Enable check-ins** - Modal saves to database, profile updates
7. **Upgrade chat** - Connect Lovable AI for recommendations

### Files to Create/Modify

**New files:**
- `src/integrations/supabase/` - Auto-generated client
- `src/hooks/useActivities.ts` - Activity fetching hook
- `src/hooks/useCheckIn.ts` - Check-in mutation hook
- `src/hooks/useSavedItems.ts` - Saved items hook
- `src/contexts/AuthContext.tsx` - Authentication context

**Files to update:**
- `src/pages/Login.tsx` - Real auth functionality
- `src/pages/Index.tsx` - Fetch activities from DB
- `src/pages/MapView.tsx` - Load markers from DB
- `src/pages/ActivityDetails.tsx` - Load by ID, save check-ins
- `src/pages/Saved.tsx` - Fetch user's saved items
- `src/pages/Profile.tsx` - Real user data and stats
- `src/components/activity/CheckInModal.tsx` - Save to database
- `src/components/home/FeaturedSection.tsx` - Fetch activities
- `src/components/home/RecommendedSection.tsx` - Fetch activities

---

## Suggested Starting Point

**Enable Lovable Cloud first** - This unlocks all the backend features needed for authentication, data persistence, and real-time updates. Once enabled, we can progressively build out each feature.

Would you like me to start by enabling Lovable Cloud and setting up the database schema?
