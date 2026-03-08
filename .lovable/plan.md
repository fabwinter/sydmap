

# SYDMAP Full App Audit -- Improvement Plan

---

## A. Bugs and Issues

### A1. Console Warning: forwardRef on ActivityCard sub-components
`FeaturedButton` and `AdminDeleteButton` are plain function components passed as children inside a `Link`. React warns about refs. Fix: wrap both with `React.forwardRef` or restructure so they are not direct children of ref-forwarding components.

### A2. Newsletter/Marketing opt-in defaults violate spec
`Login.tsx` lines 17-18 default both `newsletterOptIn` and `marketingOptIn` to `true`. The custom knowledge spec says "unchecked by default." Fix: change both defaults to `false`.

### A3. Profile `cover_photo_url` uses `as any` cast
Line 268 and 292 in Profile.tsx cast profile fields with `as any` because the types file hasn't been regenerated to include `cover_photo_url`. The types file auto-regenerates, but the code should reference the field safely. Low priority -- will resolve on next type sync.

### A4. Top category stat is hardcoded
Profile stats query (line 123) returns `topCategory: { name: "Activities", count: checkInCount }` instead of computing the actual top category from check-in data. Fix: query check-ins with activity categories and compute the real top category.

### A5. HeartButton touch target too small
`ActivityCard.tsx` line 221: HeartButton is `w-9 h-9` (36px) -- below the 44px accessibility minimum. Fix: increase to `min-w-[44px] min-h-[44px]`.

### A6. WhatsOnButton/FeaturedButton touch targets too small
Line 189: `w-8 h-8` (32px). Fix: increase to 44px minimum.

---

## B. UX and Visual Improvements

### B1. Landing page tagline still uses placeholder
Currently: "One app for all your Sydney adventures". User wanted to change this but the message was cut off. Needs confirmation on new tagline.

### B2. Landing page font modernization
User previously requested a more modern font. Consider switching from Inter to a more expressive display font for headlines (e.g., Plus Jakarta Sans, Outfit, or Sora) while keeping Inter for body.

### B3. Bottom nav height is tight
`h-12` (48px) is functional but feels cramped. Consider increasing to `h-14` (56px) for better thumb targets and breathing room, especially with safe-area padding.

### B4. Search overlay on home hero could clip on short screens
The floating search bar is absolutely positioned at `top-4` over the hero. On short viewports this could overlap with content. Consider making it sticky or scrollable.

### B5. Dark mode completeness
Dark mode tokens exist in CSS but there's no theme toggle anywhere in the UI. Add a light/dark/system toggle to Settings page.

---

## C. Missing Features (from spec)

### C1. Surprise Me wheel not accessible from Home
The spec calls for a prominent "Surprise Me!" button on the home page. Currently the wheel exists as a component but isn't prominently surfaced on the home feed.

### C2. Friends system is placeholder
The Friends tab on Profile shows only an empty state with a non-functional "Find Friends" button. Needs: search users, send/accept/block requests, friend activity feed.

### C3. Paywall / freemium limits not enforced in UI
The spec defines limits (3 check-ins/day, 5 chat messages/day, 3 playlists). The DB has `chat_message_limit_exceeded()` and `playlist_limit_exceeded()` functions in RLS, but there's no client-side UI showing remaining limits, usage counters, or upgrade prompts when limits are hit.

### C4. Ads system not implemented
Free tier should show ads (banner + native). No ad integration exists. Needs AdMob or similar integration, with conditional rendering based on `is_premium`.

### C5. Offline maps for premium
Spec mentions offline map downloads for premium users. Not implemented.

### C6. Partner discounts tab
Spec defines a partners table and premium-only discount codes section. The `partners` table exists in DB but there's no UI to browse discounts.

### C7. Social feed / public activity feed
Spec calls for a public activity feed showing friend check-ins. Not implemented.

### C8. Badge auto-awarding
Achievement progress is calculated client-side in Profile but badges are never actually written to the `user_badges` table. Needs a trigger or edge function to auto-award badges when milestones are reached.

### C9. Newsletter delivery system
Spec calls for weekly Monday 9am newsletter. No email sending infrastructure exists (SendGrid/Mailgun). Needs edge function + cron job.

### C10. Stripe integration for premium payments
Premium modal exists but has no payment flow. Needs Stripe checkout integration.

---

## D. Performance and Code Quality

### D1. Profile.tsx is 1119 lines
This monolith file contains the main page plus `EmptyState`, `StatItem`, `ProfileCheckInCard`, and `ProfileCalendar`. Extract these into separate files under `src/components/profile/`.

### D2. MapView.tsx is 745 lines
Similar issue. Extract map-specific logic into custom hooks and sub-components.

### D3. Duplicate profile fetching
`useAuth` hook fetches profile, and Profile/Settings pages also query profile independently. Consider a shared React Query hook with a consistent key to avoid redundant fetches.

### D4. No error boundaries
No React error boundaries exist. A crash in any component takes down the whole page. Add error boundaries around major route segments.

### D5. No loading skeletons on Home hero
The `HeroFeatured` component shows loading shimmer but the overall home page load can feel jarring. Add skeleton states for the featured and recommended sections.

---

## E. Security

### E1. Admin functions lack client-side guard
Admin buttons (`WhatsOnButton`, `FeaturedButton`, `AdminDeleteButton`) check `useIsAdmin()` for visibility but the RPC functions (`admin_update_activity`, `admin_delete_activity`) are `SECURITY DEFINER`. Verify these RPCs check the caller's role server-side, not just trust the client.

### E2. Cover photo upload path uses user ID directly
The storage path `${user.id}/cover.${ext}` uses the auth user ID. The RLS policy checks `storage.foldername(name))[1] = auth.uid()::text` which is correct. No issue, but worth noting.

---

## F. Recommended Priority Order

**Phase 1 -- Quick Wins (bugs + accessibility)**
1. Fix newsletter opt-in defaults to `false`
2. Fix touch target sizes on ActivityCard buttons
3. Fix forwardRef warnings
4. Compute real top category in profile stats

**Phase 2 -- Core Missing Features**
5. Badge auto-awarding system (DB trigger)
6. Paywall UI with usage counters and upgrade prompts
7. Partner discounts page for premium users
8. Stripe payment integration

**Phase 3 -- Social and Engagement**
9. Friends system (search, request, accept)
10. Social/public activity feed
11. Surprise Me button on home page

**Phase 4 -- Code Quality**
12. Extract Profile.tsx and MapView.tsx into smaller components
13. Add error boundaries
14. Add dark mode toggle to Settings
15. Consolidate profile fetching hooks

**Phase 5 -- Advanced**
16. Newsletter delivery (edge function + email provider)
17. Ad integration for free tier
18. Offline maps for premium

