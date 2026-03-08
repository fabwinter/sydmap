

# SYDMAP Improvement Plan

Based on research into comparable apps (Yelp, Foursquare, AllTrails, Wanderlog, Questo, Duolingo's gamification model), here are high-impact improvements organized by priority.

---

## 1. Streaks and Daily Engagement (inspired by Duolingo)

**Problem**: No incentive for daily return visits beyond content browsing.

**Plan**:
- Add a `streaks` table tracking consecutive days with a check-in
- Show a flame icon + streak count on the Hub page and Profile
- Daily streak notification: "You're on a 7-day streak! Don't break it!"
- Streak milestones unlock exclusive badges (7-day, 30-day, 100-day)
- Hub page shows streak prominently next to the greeting

**DB**: New `user_streaks` table (user_id, current_streak, longest_streak, last_check_in_date)

---

## 2. Leaderboard / Community Rankings

**Problem**: No social competition or visibility into community activity.

**Plan**:
- Add a "Top Explorers" section accessible from Profile or a new Feed/Community tab
- Weekly and all-time leaderboards ranked by check-in count
- Show top 10 users with avatar, name, check-in count, top badge
- User can see their own rank
- Filter by: This Week, This Month, All Time

**DB**: Can be computed from existing `check_ins` table via a view or RPC function.

---

## 3. Enhanced Hub with Context Cards

**Problem**: Hub is static -- same 6 tiles regardless of context.

**Plan**:
- Add dynamic context cards above the grid:
  - **"Continue where you left off"**: Last viewed activity
  - **"Your streak"**: Flame + count + "Keep it going!"
  - **"Nearby right now"**: 1-2 open venues within 1km
  - **Weather-aware suggestion**: "It's sunny -- hit the beach!" (uses existing `useWeather` hook)
- Cards are horizontally scrollable, personalized, and dismissible
- Prioritize based on time of day and user history

---

## 4. Stories / Highlights (inspired by Instagram/AllTrails)

**Problem**: Check-ins exist but there's no way to create curated narratives.

**Plan**:
- Allow users to group check-ins into "Stories" (e.g., "My Best Brunch Spots", "Weekend in Bondi")
- Story creation: Select check-ins, add a title and cover photo
- Stories appear on profile and can be shared via link
- Public stories feed for discovery

**DB**: New `stories` table (id, user_id, title, cover_url, is_public) and `story_items` table (story_id, check_in_id, order)

---

## 5. Smart Notifications / Nudges

**Problem**: No re-engagement mechanism beyond opening the app.

**Plan**:
- In-app notification center (bell icon on Hub)
- Notification types:
  - "You're near [venue] -- check in!" (proximity-based)
  - "Your friend [name] just checked in at [place]"
  - "New event near you this weekend"
  - "Your streak is about to break!"
- Store in `notifications` table, show unread badge count on Hub

**DB**: New `notifications` table (id, user_id, type, title, body, read, data_json, created_at)

---

## 6. Improved Social Features

**Problem**: Friends system exists but is a placeholder with no real interaction.

**Plan**:
- **Friend activity feed**: See friends' recent check-ins on a dedicated Feed tab
- **Reactions**: Heart/emoji react to friends' check-ins
- **Friend suggestions**: "People who visit similar places"
- **Share to friends**: Send an activity directly to a friend via in-app message
- Add friend search by name/email

**DB**: New `check_in_reactions` table (id, check_in_id, user_id, emoji). Enhance existing `friends` table usage.

---

## 7. Collections and Collaborative Playlists

**Problem**: Playlists are solo and basic.

**Plan**:
- Allow playlists to be **collaborative** (invite friends to add venues)
- **Official curated collections** by SYDMAP (e.g., "Best Date Nights", "Kid-Friendly Sundays")
- Playlist covers auto-generated from venue photos
- Playlist sharing with a pretty link preview (OG tags)

**DB**: Add `playlist_collaborators` table (playlist_id, user_id). Add `is_official` flag to playlists.

---

## 8. Venue Tips / Quick Reviews (inspired by Foursquare)

**Problem**: Full reviews feel heavy. Users may want to leave quick tips.

**Plan**:
- Add "Tips" -- short 140-char text blurbs on activity pages
- Tips shown in a scrollable list with upvote/downvote
- "Most helpful tip" pinned at top
- Lower friction than a full check-in + review

**DB**: New `tips` table (id, activity_id, user_id, text, upvotes, created_at)

---

## 9. Onboarding Preference Quiz

**Problem**: New users get generic recommendations with no personalization signal.

**Plan**:
- After signup, show a 3-step preference quiz:
  1. "What are you into?" (pick 3+ categories: Cafes, Beaches, Nightlife, Culture, etc.)
  2. "Who do you explore with?" (Solo, Partner, Family, Friends)
  3. "How far will you go?" (1km, 5km, 10km, 20km+)
- Store preferences in `user_preferences` table
- Use preferences to personalize Home feed, Chat context, and Hub suggestions

**DB**: New `user_preferences` table (user_id, categories jsonb, explore_with text, max_distance int)

---

## 10. Progressive Web App (PWA) Enhancements

**Problem**: No offline capability or install prompt.

**Plan**:
- Add a service worker with cache-first strategy for static assets
- Cache recently viewed activities for offline access
- Add a web app manifest with proper icons for "Add to Home Screen"
- Show an install prompt banner on the Hub after 3rd visit

---

## Priority Order

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 1 | Enhanced Hub with context cards | Medium | High -- immediate UX lift |
| 2 | Streaks + daily engagement | Medium | High -- retention driver |
| 3 | Onboarding preference quiz | Medium | High -- personalization |
| 4 | Improved social (feed, reactions) | Large | High -- stickiness |
| 5 | Leaderboard | Small | Medium -- motivation |
| 6 | Venue tips | Small | Medium -- content volume |
| 7 | Stories/Highlights | Large | Medium -- differentiation |
| 8 | Collaborative playlists | Medium | Medium -- social |
| 9 | Notifications | Medium | Medium -- re-engagement |
| 10 | PWA enhancements | Small | Medium -- mobile experience |

---

## Technical Notes

- Streaks, leaderboard, and tips require new database tables + RLS policies
- Hub context cards reuse existing hooks (`useWeather`, `useUserLocation`, `useLastCheckIn`)
- Preference quiz stores data that feeds into existing `useRecommendedActivities` query
- Social feed leverages existing `check_ins` + `friends` tables with a join query
- PWA requires a `vite-plugin-pwa` addition and manifest config

