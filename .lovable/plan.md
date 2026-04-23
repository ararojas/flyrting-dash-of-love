## Re-prompt for boarding pass on every login + unread chat badges

Two related fixes.

---

### 1. Always ask for the boarding pass on login

**Current behavior**: When a user signs in, `getActiveSession` restores their most recent active session from the database. This means if you log out and back in (or open the app on a new device), you skip the boarding-pass step and land directly on Flyrting with your old flight.

**Desired behavior**: Every fresh sign-in should require scanning a boarding pass again — flights are short-lived events, not persistent state.

**Approach**:

- On every sign-in event (detected via `supabase.auth.onAuthStateChange` with event `SIGNED_IN`), deactivate the user's existing active sessions in the database (`UPDATE sessions SET is_active = false WHERE user_id = auth.uid() AND is_active = true`).
- Remove the "restore active session" effect from `src/routes/index.tsx`. After login, the routing logic already sends users to `boarding-pass` when there's no `activeSession` in memory — that's exactly what we want.
- Keep the `sessions` table as-is; we still record past sessions for `airport_visits` / coincidence detection, we just don't auto-resume them.

**Note**: While the user is *already signed in* and navigating around the app (matches → chat → matches), the in-memory `activeSession` state stays — they won't be re-prompted mid-session. The re-prompt only happens after a true sign-in.

**Files touched**:
- `src/routes/index.tsx` — remove the session-restore `useEffect`; add a `SIGNED_IN`-event handler that calls a new `deactivateSessions` server function.
- `src/lib/session.functions.ts` — add `deactivateSessions` server function.

---

### 2. Unread chat badges

**Current behavior**: The `ConversationSummary` type has an `unread` field but it's hard-coded to `false`. There's no read tracking in the database.

**Desired behavior**:
- A red badge with the unread message count appears on each conversation row in the Chats list.
- A red dot appears on the Chats icon in the Flyrting header when *any* conversation has unread messages.
- Opening a chat marks it as read.
- New incoming messages (via the existing realtime subscription on the chat screen) update the badge live when the user is on the matches/chats-list screen.

**Approach** — add per-user-per-conversation read tracking:

```text
NEW TABLE: conversation_reads
  user_id          uuid
  conversation_id  uuid
  last_read_at     timestamptz
  PRIMARY KEY (user_id, conversation_id)
```

RLS: each user can read/write only their own rows (`auth.uid() = user_id`).

**Server functions** (`src/lib/social.functions.ts`):
- Update `getConversations` to:
  - Join `conversation_reads` for the current user.
  - Count messages where `created_at > last_read_at AND sender_id != current user`.
  - Return `unreadCount: number` (replacing the unused boolean `unread`).
- New `markConversationRead(conversationId)` — upserts `conversation_reads` with `last_read_at = now()`.
- New `getUnreadTotal()` — returns total unread messages across all conversations (cheap query for the header dot).

**UI changes**:

- **`ChatsListScreen.tsx`** — render a coral pill with the unread count on each row when `unreadCount > 0`; bold the row's name + last message when unread.
- **`ChatScreen.tsx`** — call `markConversationRead` on mount and again whenever a new realtime message arrives while the user is in the chat.
- **`MatchesGrid.tsx`** — fetch `getUnreadTotal` on mount + subscribe to new `messages` rows in realtime to refresh the count; show a small red dot on the existing MessageCircle button when total > 0.

**Files touched**:
- New migration: create `conversation_reads` table + RLS policies.
- `src/lib/social.functions.ts` — extend `ConversationSummary` (`unreadCount: number`), update `getConversations`, add `markConversationRead`, add `getUnreadTotal`.
- `src/components/ChatsListScreen.tsx` — render badges, bold unread rows.
- `src/components/ChatScreen.tsx` — mark-as-read on open + on new message.
- `src/components/MatchesGrid.tsx` — red dot on the chats icon.

---

### Out of scope (ask if you want them next)
- Push/browser notifications for new messages.
- Per-message read receipts ("seen by them at 12:34").
- Re-confirming the boarding pass with a fresh location check (we just clear it on login — the user re-uploads or re-scans normally).
