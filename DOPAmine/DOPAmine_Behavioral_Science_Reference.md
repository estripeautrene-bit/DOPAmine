# DOPAmine — Behavioral Science Reference
*Compiled May 24, 2026 · Internal · Confidential*
*Source: Four peer-reviewed and industry research documents reviewed May 24, 2026*

---

## PURPOSE OF THIS DOCUMENT

This document is the behavioral science foundation for every copy, product, and notification decision in DOPAmine. It distills four research sources into actionable frameworks. Every future session should reference this before writing copy or designing new features.

It answers one question: **how do we use the dopamine loop ethically to carry users from unaware → first entry → Day 7 → Day 30 → paid?**

---

## THE FOUR SOURCES

1. **Arushi — "The Dopamine Loop: How UX Designs Hook Our Brains"** (Medium / Design Bootcamp, Dec 2024)
2. **Syed Mohammed Raheem — "The Dopamine Loop: How Digital Marketing Triggers Addictive Behavior"** (Digistrivemedia, Nov 2025)
3. **Sarah Langmead — "4 Key Ways for Card Marketers to Use Dopamine-Driven Design"** (The Financial Brand, May 2026)
4. **Maharshi Patel — "Neuroscience of Consumer Gamification: The Role of Dopamine in Customer Loyalty"** (Gujarat Technological University, Academic Paper)

---

## PART 1 — THE CORE SCIENCE

### What Dopamine Actually Is

Dopamine is not the pleasure chemical. It is the **anticipation chemical**. The brain releases dopamine not when the reward arrives but when the reward is expected. This is the most important fact in this document. It means:

- The *expectation* of tomorrow's DOPA reflection is more powerful than the reflection itself
- Every piece of copy should create anticipation of the next reward, not just acknowledge the current one
- The moment between "I just saved an entry" and "I wonder what DOPA will say tomorrow" is where retention lives

### The Dopamine Loop — Four Stages

| Stage | What Happens | DOPAmine Version |
|-------|-------------|-----------------|
| **Anticipation** | Brain expects reward | User logs entry, knows reflection is building |
| **Reward** | Reward arrives | Yesterday Was Good reflection lands |
| **Craving** | Brain wants more | User wants to know what tomorrow brings |
| **Repetition** | Behavior repeats | User logs again today to build tomorrow's reflection |

**Critical gap identified:** DOPAmine has designed for Anticipation and Reward. The Craving stage — the moment immediately after the reward lands — has no product design. The Yesterday page currently ends with the reflection. Nothing channels the emotional high of receiving a reflection into the action of logging today. Fix: add a pull line at the bottom of every Yesterday reflection pointing toward Today.

### The Two Neurotransmitters DOPAmine Needs

**Dopamine** — drives the loop. Anticipation, reward, craving, repetition. All notification and Today page mechanics serve dopamine.

**Oxytocin** — drives attachment. The bonding chemical. Trust. Feeling known. This is what converts a user who uses the app into a user who cares about it. DOPA the mascot is the oxytocin mechanism. Every time DOPA appears and says something specific to this user's actual words, oxytocin fires. Generic responses destroy the oxytocin effect. Specific responses build it.

**Implication:** The same-session micro-reflection (DOPA responding to each entry with something specific to what was written) is not just a dopamine trigger. It is the primary oxytocin mechanism. It must be built before any other feature.

---

## PART 2 — THE VARIABLE REWARD PRINCIPLE

### B.F. Skinner's Finding (from Patel, 2024)

Behaviors reinforced with **unpredictable rewards** are repeated more frequently than behaviors reinforced with predictable ones. This is intermittent reinforcement — the same mechanism behind slot machines, TikTok's feed algorithm, and Instagram's delayed like display.

For DOPAmine this means:

- The Yesterday Was Good reflection must feel **variable** in quality and style. If every reflection feels similar, the dopamine response weakens as the user learns what to expect
- Three reflection modes should rotate unpredictably: observational (names what happened), pattern (spots a recurring theme), forward (predicts something about today). The user never knows which mode arrives tomorrow
- DOPA occasionally surfaces something unexpected — a connection to an entry from 3 weeks ago, a pattern the user never noticed. These surprise moments are more powerful than any scheduled reward

### Variable Prompt Rotation (Today Page)

The input prompt above the entry field must rotate after each save. Static prompts produce predictable behavior. Variable prompts maintain curiosity.

**Approved prompt pool:**
- "What happened today that your brain almost let go?"
- "What else happened that is worth keeping?"
- "What made today different from yesterday?"
- "What just happened that most people would walk past?"
- "Something good is still out there today. What is it?"
- "What would tomorrow-you be glad you kept?"
- "One more thing. What made today yours?"

### The Daily Open Micro-Reward

From Patel (2024): daily micro-rewards for showing up — even before action — sustain return behavior. For DOPAmine: a rotating DOPA greeting fires on first open of each day when wins_today = 0. Not the static empty state. DOPA is present and alive every morning.

**Approved daily opening pool (15 rotating lines):**
1. "DOPA is ready. What happened this morning?"
2. "New day. DOPA is listening."
3. "Something good is already out there. DOPA is waiting."
4. "Today hasn't started yet. Let's change that."
5. "DOPA showed up. Now you do."
6. "The day just started writing itself. Help DOPA read it."
7. "Something good happened in the last hour. DOPA needs it."
8. "Your brain is already running. Give DOPA the good parts."
9. "Morning. One moment. That's all."
10. "DOPA is here. What did this morning give you?"
11. "The best part of this morning is still fresh. Catch it."
12. "New day. New moments. DOPA is reading."
13. "Whatever happened this morning — DOPA wants to keep it."
14. "Today is unwritten. Let's change that together."
15. "DOPA waited all night for today. Make it worth it."

---

## PART 3 — THE THREE NOTIFICATION TYPES

Every notification belongs to one of three types. The type is determined by the user's current state, not by the time of day.

### Type 1 — Pull Toward Reward
**When to use:** wins_today >= 1. User has already engaged today.
**Purpose:** Build anticipation for the reward coming after more entries or tomorrow morning.
**Tone:** Forward. Something is forming. Come see.

**Examples:**
- "DOPA is building a picture of your day. More moments make it clearer."
- "Your reflection tomorrow morning depends on what you log today."
- "DOPA will read everything you log today. Give it something."
- "Tomorrow morning DOPA has something for you. Build it today."

### Type 2 — Internal Trigger
**When to use:** wins_today = 0, user has opened app in last 48 hours.
**Purpose:** Activate loss aversion. Moments are slipping away right now. This is real, not manufactured.
**Tone:** Urgent but not guilt. Informational. A tap on the shoulder.

**Examples:**
- "Your brain is already discarding something good right now. Beat it."
- "In 12 seconds your brain will file this under forgettable. Save it first."
- "Something just happened. You know which one. Don't let it go."
- "The good things from this morning are already fading. Catch one."
- "Right now your brain is deciding what to keep. Help it choose."

### Type 3 — FOMO Bridge
**When to use:** wins_today = 0 AND user has not opened app today. Most powerful in evening slot.
**Purpose:** Bridge from unaware to engaged. Not shame. Not guilt. Information about something real being lost.
**Tone:** Specific. Direct. Higher urgency than Type 2.
**Rule:** NEVER use after wins_today >= 1. At that point Type 1 takes over.

**Morning FOMO examples:**
- "Three things happened before 9am that were worth keeping. Do you know what they were?"
- "Something happened this morning that you will not remember by tonight. Catch it now."
- "The best part of this morning is fading. You have about an hour before it is gone."

**Evening FOMO examples:**
- "Today had good things in it. Most of them are already gone. Save what is left."
- "In a few hours today will just be another day you do not remember clearly. Unless you do this."
- "Tomorrow you will struggle to remember what made today good. Unless you log it now."
- "The version of today that still has detail in it closes in a few hours."

**Re-engagement FOMO (dormant 48+ hours):**
- "Two days of good moments your brain already deleted. Today still has time."
- "DOPA has been waiting. Good things kept happening. None of them got saved."
- "You had a good day recently. You just do not remember it because nothing caught it. That stops today."

---

## PART 4 — TODAY PAGE COPY SYSTEM

### The Rule For Every Line

Every message on the Today page does one of two things only:
1. **Pulls toward the next interaction** — creates a reason to log again or return tomorrow
2. **Builds anticipation for the reward coming** — DOPA is reading, building, preparing something specific

Nothing on the Today page looks backward or acknowledges past actions without a forward component.

### Full Today Page Copy Spec

**Main headline:**
`"YOUR DAY IS BUILDING."` — active, something is forming

**Saving state (while Supabase insert is in flight):**
- Save 1: `"DOPA is reading this."`
- Save 2: `"DOPA is building a picture of your day."`
- Save 3: `"DOPA is locking in your day."`

**Ghost line (appears 0.5s after save, fades at 2.5s):**
- Save 1: `"DOPA has it. It will not disappear."`
- Save 2: `"Two moments. DOPA can see your day taking shape."`
- Save 3: `"Today is locked. Tomorrow morning it comes back to you."`

**Day Completion State (fires when wins_today = 3):**
- Line 1 (white, 24px): `"Today is locked."`
- Line 2 (amber #FFB020, 24px): `"DOPA read every word."`
- Line 3 (dim white 15px): `"Tomorrow morning it comes back to you. Only you see it."`

**Anticipated Pull — persistent line below entry list:**
- Day 1: `"Tomorrow morning DOPA reflects your day back to you."`
- Day 2: `"DOPA has two days now. Tomorrow it shows you the pattern."`
- Day 3: `"Three days. DOPA is starting to see who you are."`
- Day 7: `"Seven days. Tomorrow DOPA shows you something you did not know about yourself."`

**Counter label:**
`"X moments kept"` — not "saved", not "logged". Kept.

---

## PART 5 — YESTERDAY PAGE CRAVING BRIDGE

**The gap identified:** After the Yesterday Was Good reflection lands, the user is in their highest emotional state of the day — just received a personal, specific AI reflection. Nothing in the product catches this state and channels it forward.

**Fix:** Bottom of every Yesterday reflection, after DOPA's insight and question:

```
[dim line]
"Today is still being written. Give DOPA something to work with."
[tap → Today tab, input auto-focused]
```

This is the craving stage of the loop being caught and redirected. The loop completes and restarts in the same moment.

---

## PART 6 — EMAIL SYSTEM BEHAVIORAL RULES

### Progress Indicator in Every Email
From Langmead (2026): LinkedIn increased profile completions 55% after adding a visible progress indicator. Every email from Day 1 onward includes a small progress line: `"Day X of 30"` or `"Day X of 7"` depending on phase.

### Near-Completion Emails (most powerful trigger)
Near-completion is more powerful than milestone completion. When something feels 80-90% done, abandoning creates psychological discomfort. Add these three emails:

- **Day 6:** *"Tomorrow is Day 7. One day from your first week. DOPA is ready."*
- **Day 29:** *"Tomorrow is Day 30. One day from something most people never reach. DOPA has been building your picture all month."*
- **Day 89:** *"Tomorrow is 90 days. DOPA has read 89 days of your life. Tomorrow it shows you what it found."*

### "Your Reward Is Still Waiting" Framing
For users who logged Day 1 and disappeared: they EARNED the Yesterday Was Good experience but never received it. The re-entry email is not "come back" — it is "something you earned is waiting."

*"You started something. DOPA has your first entry. Your reflection is still waiting to be built. One more moment is all it takes."*

### Backward-Looking Line (Day 7 onward)
Every email from Day 7 onward includes one line acknowledging what already exists — not just pushing forward.
- Day 14: `"14 days of moments DOPA has been keeping for you."`
- Day 30: `"30 days. DOPA has read all of them."`
- Day 90: `"90 days of your life. Kept."`

---

## PART 7 — SURPRISE REWARD LAYER

### The Principle
Variable rewards are more powerful than predictable ones (Skinner, via Patel 2024). DOPAmine's scheduled features (daily reflection, notification timing, milestone emails) are predictable. A surprise layer creates the unpredictability that sustains long-term engagement.

### Approved Surprise Moments

**In-app DOPA pattern observation (fires randomly, not on schedule):**
After a save on Day 4-6, DOPA occasionally adds one unrequested observation beneath the ghost line. Appears 1-2 times per week at most. Never announced. Just appears.

Examples:
- *"DOPA noticed you keep logging in the morning. Your brain is building a new reflex."*
- *"Three days of mornings. DOPA is starting to see your pattern."*
- *"You mentioned something like this last week. DOPA noticed."*

**Variable reflection depth (Yesterday Was Good):**
Three modes rotate unpredictably:
- **Observational mode:** Names what happened in yesterday's entries specifically
- **Pattern mode:** Spots a recurring theme across the full entry archive
- **Forward mode:** Makes one specific prediction about today based on yesterday

The user never knows which mode arrives. That unpredictability is the variable reward.

---

## PART 8 — THE FOMO GUARDRAIL

From Langmead (2026): FOMO messages "should feel supportive rather than urgent or pressuring." From all sources: the difference between ethical FOMO and manipulative FOMO is what the user is afraid of missing.

**Ethical FOMO for DOPAmine:** Missing their own moments. Missing the thing their brain will delete. This is real. The product exists because this is real.

**Manipulative FOMO:** Missing a streak number, a badge, a rank. Missing an artificial construct. Do not use.

**The test:** Ask "is the thing they're missing real?" If yes — use the FOMO. If the thing only exists inside the app — do not.

---

## PART 9 — CUSTOMER LIFETIME VALUE FRAMEWORK

From Patel (2024): dopamine-driven engagement builds CLV by creating habits that increase frequency and value of interactions over time. For DOPAmine:

- **Day 1-7 (The Dare):** Dopamine loop must fire at least once per session. Ghost line, saving state copy, Day Completion State.
- **Day 8-30 (Habit Formation):** Variable prompts and reflection quality sustain the loop. This is where the reflex forms.
- **Day 30 (Conversion Point):** The paywall. User must already believe in the product before hitting it. Every retention mechanism before Day 30 is CLV infrastructure.
- **Day 30+ (Identity Shift):** Attachment, not just engagement. Oxytocin layer via DOPA specificity.

---

## PART 10 — WHAT NOT TO DO

These mechanics work for other products but are wrong for DOPAmine's brand and audience.

| Mechanic | Why It Does Not Fit |
|---------|-------------------|
| Streak punishment ("your streak broke") | Shame-based. Contradicts positivity brand. Audience has left apps that do this. |
| Countdown timers ("3 hours to log today") | Manufactured scarcity. Not real. |
| Social comparison leaderboards | DOPAmine is private. Public rankings would break user trust. |
| Endless feed | DOPAmine is a production tool, not a consumption tool. |
| Cognitive overload | Brand is calm and simple. Competing calls to action destroy the experience. |
| "Earn badges for logging" | Gamification for gamification's sake. The real reward is the reflection, not a badge. |

---

## PART 11 — THE ONE RULE

Before any notification, Today page message, or email ships, test it against this question:

**Does this message make the user feel something is waiting for them — or something is being lost right now?**

If yes to either — it ships.
If no to both — it does not ship.

---

*DOPAmine Behavioral Science Reference · May 24, 2026 · mydopa.app · CONFIDENTIAL*
*Sources: Arushi (Medium 2024) · Raheem (Digistrivemedia 2025) · Langmead (Financial Brand 2026) · Patel (GTU Academic Paper)*
