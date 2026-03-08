

# SYDMAP (Sydney Planner) - Application Documentation

## 1. Overview

SYDMAP is a mobile-first React web application for discovering activities, venues, and events across Sydney, Australia. Built with React, TypeScript, Vite, Tailwind CSS, and a Lovable Cloud (Supabase) backend. It features real-time search, interactive maps, AI-powered chat, check-in gamification, and admin tools for content management.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Mapbox GL, Framer Motion, Zustand, TanStack Query, Supabase (Lovable Cloud)

**URL:** sydmap.com

---

## 2. Application Architecture

### 2.1 Routing Structure

| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Landing (hero slideshow) | No |
| `/home` | Home / Discovery feed | No |
| `/login` | Login / Signup | No |
| `/map` | Interactive map view | No |
| `/timeline` | Check-in timeline | Yes |
| `/chat` | AI chat assistant | No |
| `/profile` | User profile | Yes |
| `/settings` | User settings | Yes |
| `/activity/:id` | Activity detail page | No |
| `/event/:id` | Event detail page | No |
| `/explore` | Category browse (with `?section=` param) | No |
| `/whats-on` | What's On events feed | No |

### 2.2 Layout System

- **AppLayout** wraps all main pages via **ResponsiveShell**
- **ResponsiveShell** provides `min-h-screen` container + **BottomNav**
- **BottomNav** is fixed at bottom with 5 tabs: Home, Map, Timeline, Chat, Profile
- Pages use `max-w-lg` (mobile) or `max-w-7xl` (desktop grid) content widths
- Safe area insets supported via CSS `env(safe-area-inset-bottom)`

---

## 3. Design System

### 3.1 Color Palette

| Token | HSL | Hex (approx) | Usage |
|-------|-----|---------------|-------|
| Primary | 186 72% 38% | #2190A0 | Buttons, links, active states |
| Secondary | 193 58% 59% | #5DB8D4 | Gradients, accents |
| Accent | 20 74% 64% | #E68161 | CTAs, highlights |
| Background | 60 20% 98% | #FCFCF9 | Page background |
| Foreground | 180 4% 13% | #1F2121 | Body text |
| Success | 142 71% 45% | #22C55E | Open status |
| Warning | 32 95% 64% | #FB923C | Ratings, stars |
| Destructive | 0 84% 60% | #EF4444 | Errors, delete |

Dark mode is fully supported with inverted tokens.

### 3.2 Typography

- Font: **Inter** (Google Fonts), system-ui fallback
- Headers: `font-bold tracking-tight`
- Antialiased rendering

### 3.3 Component Styles (CSS Layer)

- `.activity-card` -- Rounded cards with hover scale (1.02x) and shadow transitions
- `.filter-chip` -- Pill-shaped filter buttons with active state
- `.nav-tab` -- Bottom navigation tab styling
- `.surprise-button` -- Gradient CTA with glow animation
- `.premium-card` -- Pricing card with featured scale
- `.search-input` -- Rounded search field with icon offset

### 3.4 Animations

- **Spin Wheel**: 3s cubic-bezier spin (1800deg)
- **Pulse Glow**: Primary color box-shadow pulse (2s loop)
- **Slide Up**: 0.3s translateY entrance
- **Fade In**: 0.2s opacity entrance
- **Celebrate**: Scale bounce for check-in success
- **Framer Motion**: Used for search panel expand/collapse, map transitions

---

## 4. Pages and Features

### 4.1 Landing Page (`/`)

- Full-screen hero slideshow with 4 Sydney images (Unsplash)
- Title: "One app for all your Sydney adventures"
- CTA: "Start Exploring" navigates to `/home`
- Auto-redirects authenticated users to `/home`
- Haptic feedback on CTA tap

### 4.2 Login / Signup Page (`/login`)

- Toggle between Sign In and Create Account modes
- Email + password authentication via Supabase Auth
- Google OAuth via Lovable Cloud auth
- Apple sign-in button (disabled, "coming soon")
- "Continue as guest" option
- Signup includes: Newsletter opt-in checkbox, Marketing opt-in checkbox
- "Forgot password" sends reset email
- "Remember me" checkbox
- Hero gradient banner with branding
- Auto-redirects if already authenticated

### 4.3 Home Page (`/home`)

**ControlPanel** -- Search overlay with:
- Personalized placeholder: "Hi [name], where to today?"
- Predictive search (queries `activities` table as user types)
- Expandable filter panel with animated slide-down:
  - **Distance slider**: 1-20km range
  - **Minimum rating**: Any, 3+, 3.5+, 4+, 4.5+
  - **Experience type**: Outdoors, Indoor, Free, Pet Friendly, Accessible, WiFi, Parking, Outdoor Seating
  - **Kids age groups**: Baby (0-2), Toddler (3-5), Kids (6-12), Teens (13-17)
  - **Family amenities**: Play Area, Pram Accessible, Change Rooms, High Chairs, Educational, Nature/Adventure, Active Play, Arts/Culture
  - **Categories**: 14 categories (Cafes, Beaches, Parks, Restaurants, Museums, Shopping, Bakeries, Playgrounds, Pools, Attractions, Sports/Rec, Childcare, Education, Walks)
  - **Cuisines**: Pizza, Thai, Japanese, Italian, Mexican, Chinese, Indian, Korean, Vietnamese, Seafood, Brunch
  - **Open Now** toggle
  - **Region** selector (populated from DB: e.g. Inner West, Eastern Suburbs)
  - **Sort by**: Distance, Rating, Name A-Z, Name Z-A, Category, Region
- Active filter chips with remove buttons
- Clear All button

**Browse Mode** (no active filters):
- **FeaturedSection**: "What's On Today" -- horizontal carousel of events with `show_in_whats_on=true`. Admin buttons for remove/delete.
- **RecommendedSection**: "Recommended For You" -- horizontal carousel of top activities
- **CuratedSections**: 4 themed carousels:
  - Sydney Walks and Outdoors (parks, beaches)
  - Best of Sydney (rating >= 4)
  - Cafes and Bakeries
  - Nightlife and Dining (bars, restaurants)
- **FoursquareSection** and **GoogleSection**: Admin-only external API results

**Filter Mode** (active filters): Shows `SearchResultsGrid` with matching activities in a grid layout.

**ActivityCard** component:
- Photo with gradient overlay
- Category badge, rating stars, distance
- Heart (save) button
- Sparkle icon for "What's On" toggle (admin only)
- Links to `/activity/:id`

### 4.4 Map View (`/map`)

- Full-screen Mapbox GL map with satellite/street toggle
- **Data sources** (admin can toggle between):
  - Database activities
  - Foursquare Places API results
  - Google Places API results
  - All combined
- Colored pin markers by category
- Click marker to show popup with venue preview
- **Mobile**: Toggle between map and list views
- **List view**: Scrollable venue cards with photo, name, category, rating, distance
- **Search Here** button appears when map is panned
- Map auto-fits bounds to show all pins
- Geolocation control (blue dot for user location)
- Navigation controls (zoom, compass)
- **Admin features**:
  - Bulk select mode for multi-venue operations
  - Bulk import from Foursquare/Google
  - Bulk delete, bulk update (category, amenities, What's On toggle)
  - Source filter tabs (All, DB, Foursquare, Google)
- **MobileVenueCard**: Slide-up card on marker tap with save, check-in, What's On toggle, directions
- Clicking "View Details" auto-imports external venues to DB before navigating

### 4.5 Activity Details (`/activity/:id`)

- **Hero image carousel** with left/right arrows, photo counter
- Admin: image crop position selector (Top/Center/Bottom)
- **Title block**: Name, category, suburb, open/closed status, star rating + review count
- **About section**: Phone (tap to call), website (external link), address, hours
- **Description**: Full text
- **Amenities grid**: Icons for Parking, WiFi, Accessible, Outdoor Seating, Pet Friendly, Family Friendly, High Chairs, Change Rooms, Coffee, Power Outlets, Showers, Bike Parking, Shade
- **Photos section**: Horizontal scroll gallery
- **Location map**: Embedded Mapbox map + "Get Directions" link (opens Google Maps)
- **Reviews section**: User avatar, name, star rating, date, review text
- **Visit tracker**: Shows user's check-in history for this venue with edit/delete
- **Sticky bottom bar**: Save (heart), Share, Check-In button, Add to Playlist
- **AdminPanel** (admin only): Full CRUD panel with:
  - Edit all fields (name, category, description, address, phone, website, hours, region)
  - Toggle all amenity booleans
  - Toggle is_event, show_in_whats_on
  - Upload/paste hero image, add gallery photos
  - Geocode address to coordinates
  - Delete activity
  - Photo gallery management

### 4.6 Event Details (`/event/:id`)

- Separate layout optimized for events
- Photo grid layout (adapts to 1-4+ photos)
- Category badge
- **Info bar**: Location (with directions link), When (event dates), Cost (with ticket link)
- Save to Events button
- Overview/description
- Organizer contact: name, phone, website, Facebook, Instagram
- Location map with directions
- Source URL link to original listing

### 4.7 Check-In Modal

- Star rating selector (1-5, with hover preview)
- Photo upload: Camera capture or file picker (max 5MB)
- Comment text area (max 300 chars with counter)
- Visibility toggles: "Share with friends" (default ON), "Add to public feed" (default OFF)
- Photos uploaded to Supabase storage bucket
- Creates review automatically on check-in
- Success toast on completion
- Invalidates timeline, profile stats, and activity queries

### 4.8 Timeline (`/timeline`)

- Auth-required page showing user's check-in history
- **Two views**: List (default) and Map
- **List view**: Vertical timeline with date group headers, timeline track (vertical line with dots), check-in cards showing:
  - Hero photo
  - Venue name, category, suburb
  - Star rating, time
  - User comment (italic, truncated)
- **Map view**: All check-in locations plotted on Mapbox map
- **Filters**:
  - Text search
  - Category dropdown (11 categories)
  - Date range picker (calendar popover)
- Shows total places visited count

### 4.9 Chat (`/chat`)

- AI-powered assistant using Gemini 2.5 Flash via Lovable AI
- **Starter prompts**: "Best brunch spots nearby", "Family-friendly beaches", "Romantic dinner ideas", "Hidden gems to explore", "Quiet cafes for work", "Nature walks in Sydney"
- Personalized greeting: "G'day [name]!"
- **Streaming responses** via SSE from edge function
- Markdown rendering for assistant messages
- **ChatVenueCards**: Horizontal thumbnail cards extracted from AI response (matches venue names against DB)
- **Quick Replies**: Clickable suggestion buttons parsed from `<!--QUICK_REPLIES:[...]-->` markers in AI stream
- Chat history persisted in Zustand store
- Clear chat button
- **User context sent to AI**: GPS location, user name, saved activities, recent check-ins
- **Edge function** queries 200 activities from DB for grounding

### 4.10 Saved (`/saved` -- accessible via Profile)

- **Playlists section**: Horizontal scroll of user playlists with emoji, name, item count
  - Create new playlist dialog (emoji + name)
  - Delete playlist (hover reveal)
- **All Saved Places**: Vertical list of bookmarked activities
  - Photo thumbnail, name, category, address
  - Heart button to unsave
  - Tap to view details

### 4.11 Profile (`/profile`)

- **Header**: Large avatar, display name, bio
- **Badges row**: Earned badges (Explorer, Foodie, Night Owl, etc.)
- **Coin count**: Total check-ins displayed with coin emoji
- Edit Profile + Premium buttons
- **Stats row**: Check-ins, Friends, Top Category
- **5 Tabs**:
  - **Overview**: Lists (saved + playlists), Achievements (category stickers, per-check-in stickers, earned badges), Recent Check-Ins grid
  - **Check-Ins**: Full chronological list with photos, ratings, comments
  - **Saved**: Saved places list with unsave option
  - **Playlists**: Playlist management with create/delete
  - **Friends**: Friend list (placeholder)
- Sign out option

### 4.12 Settings (`/settings`)

- Profile editing: Display name, bio (150 char limit), avatar
- **Notifications**: Weekly Recommendations toggle, Special Offers toggle
- **Account**: Account info, Change Password (sends reset email), Privacy
- Sign Out button (destructive styling)

### 4.13 What's On (`/whats-on`)

- Full page grid of events (scraped + database)
- Event cards with image, title, date, description, category badge
- "In App" badge for imported events
- Admin buttons: Remove from What's On, Delete event
- Import All button for admin to bulk-import scraped events

### 4.14 Category View (`/explore?section=`)

- Sections: whats-on, recommended, outdoor, best-of, cafes, nightlife
- Full grid of filtered activities sorted by rating
- Back navigation, activity count

### 4.15 Surprise Me Wheel

- Spinning wheel with category segments (colored)
- Radius slider: 1-20km
- Amenity requirement checkboxes
- Animated 3s spin selecting random matching venue
- Result card with photo, name, category, rating
- Actions: View Details, Save, Try Again

---

## 5. Backend Architecture

### 5.1 Database Tables

- **profiles**: user_id, name, email, avatar_url, bio, is_premium, newsletter_opt_in, marketing_opt_in
- **activities**: Full venue data with 25+ fields including coordinates, amenities, event fields, region, show_in_whats_on
- **check_ins**: user_id, activity_id, rating, comment, photo_url, share/public toggles
- **saved_items**: user_id, activity_id bookmarks
- **playlists**: user_id, name, emoji
- **playlist_items**: playlist_id, activity_id
- **reviews**: activity_id, user_id, rating, review_text
- **photos**: activity_id, user_id, photo_url
- **user_badges**: user_id, badge_name, description
- **friends**: user_id, friend_id, status
- **user_roles**: user_id, role (admin system)

### 5.2 Edge Functions

| Function | Purpose |
|----------|---------|
| `chat` | AI assistant (Gemini 2.5 Flash), streams SSE responses, grounded in activity DB |
| `search-foursquare` | Foursquare Places API proxy |
| `search-google-places` | Google Places API proxy |
| `whats-on-today` | Scrapes Sydney event listings |
| `import-whats-on` | Bulk imports scraped events to DB |
| `import-activities` | General activity import |
| `firecrawl-scrape` | Firecrawl web scraping for event pages |

### 5.3 RPC Functions

- `admin_update_activity(uuid, jsonb)` -- Update any activity field (admin only, SECURITY DEFINER)
- `admin_delete_activity(uuid)` -- Delete activity and related data

### 5.4 Authentication

- Email/password signup with email verification
- Google OAuth via Lovable Cloud
- Session persistence with JWT auto-refresh
- Profile auto-created on signup (via trigger)
- Admin role system via `user_roles` table

---

## 6. Admin Capabilities

Admins (determined by `user_roles` table) have access to:

- **AdminPanel** on every activity/event detail page: Edit all fields, manage photos, delete
- **Bulk operations on Map**: Multi-select venues, bulk import/delete/update
- **What's On management**: Toggle `show_in_whats_on` from cards, remove/delete events
- **External data sources**: View and import Foursquare/Google Places results
- **Hero image controls**: Position (top/center/bottom), upload, paste URL

---

## 7. External Integrations

| Service | Usage |
|---------|-------|
| Mapbox GL | Interactive maps, geocoding, markers |
| Foursquare Places API | External venue search |
| Google Places API | External venue search |
| Firecrawl | Web scraping for event imports |
| Lovable AI (Gemini) | Chat assistant |
| Supabase Storage | Photo uploads (check-ins, admin) |

---

## 8. State Management

- **Zustand**: Search filters (`useSearchFilters`), chat messages (`chatStore`)
- **TanStack Query**: All server data (activities, profiles, check-ins, reviews, etc.)
- **Supabase Auth**: Session and user state via `useAuth` hook

---

## 9. Responsive Design

- **Mobile-first** with `max-w-lg` content containers
- **Tablet/Desktop**: `max-w-7xl` with multi-column grids (2-5 columns)
- Bottom nav visible on all screen sizes
- Touch targets minimum 48px
- Horizontal carousels with `scrollbar-hide`
- Safe area padding for notched devices
- `touch-action: pan-y` to prevent zoom (maps override)

