#!/usr/bin/env python3
"""Remove banned phrases from all blog HTML files."""
import os, re

BLOG_DIR = "blog"

# ── 1. GLOBAL exact-string replacements applied to every file ──────────────
GLOBAL = [
    # CTA headline — strip " · free"
    ('7 days &nbsp;·&nbsp; 3 moments &nbsp;·&nbsp; <em>free</em>',
     '7 days &nbsp;·&nbsp; 3 moments'),

    # CTA eyebrow — strip "· free"
    ('7 days · 3 moments · free', '7 days · 3 moments'),

    # Nav / dare buttons
    ('Try DOPAmine free →',       'Try DOPAmine →'),
    ('Try MyDopa free →',         'Try MyDopa →'),
    ('>Start free →<',            '>Start the dare →<'),
    ('Start your free 14-day dare →', 'Start your 14-day dare →'),
    ('Take the dare — free →',    'Take the dare →'),
    ('Start free — 7 days →',     'Start — 7 days →'),

    # CTA body copy — remove "No card. No commitment." fragment
    ('No card. No commitment. Just the practice.', 'Just the practice.'),
    ('No card. No commitment. Just 7 days.',       'Just 7 days.'),
]

# ── 2. Full-line removals (regex, case-sensitive) ──────────────────────────
LINE_PATTERNS = [
    # "Free for 7 days. No card needed." small-print line
    r'\s*<p[^>]*>Free for 7 days\. No card needed\.</p>\n?',
    # "Free. No card needed." fine-print line
    r'\s*<p[^>]*>Free\. No card needed\.</p>\n?',
    # Negative CTA pills
    r'\s*<span class="cta-pill">No credit card</span>\n?',
    r'\s*<span class="cta-pill">No journaling</span>\n?',
    r'\s*<span class="cta-pill">No wellness speak</span>\n?',
]

# ── 3. File-specific body-text fixes ──────────────────────────────────────
FILE_SPECIFIC = {
    # how-to-build-magnetic-confidence — "journaling practice" in body
    "how-to-build-magnetic-confidence.html": [
        ('not a journaling practice', 'not a writing practice'),
    ],
    # five-to-one-rule — "No journaling" in body prose
    "five-to-one-rule-negativity-bias.html": [
        ('No affirmations. No journaling.', 'No affirmations. No prompts.'),
    ],
    # self-improvement-burnout — "the journaling" in body prose
    "self-improvement-burnout.html": [
        ('the morning routine, the journaling, the practices',
         'the morning routine, the tracking, the practices'),
    ],
    # how-to-build-mental-resilience — "wellness programs" in body prose
    "how-to-build-mental-resilience.html": [
        ('corporate wellness programs', 'corporate wellbeing programs'),
    ],
    # can-you-remember-last-tuesday — "wellness" and "journaling" in body + card
    "can-you-remember-last-tuesday.html": [
        ('watered-down wellness version', 'watered-down self-help version'),
        ("You didn't fail at journaling. The journal failed you. Here's the specific way it did",
         "You didn't fail at the habit. The app failed you. Here is the specific way it did"),
    ],
    # the-four-pillars — "wellness accessories" in body
    "the-four-pillars.html": [
        ('wellness accessories', 'performance accessories'),
    ],
    # index — card excerpt for journaling article
    "index.html": [
        ("You didn't fail at journaling. The journal failed you — by saying nothing back.",
         "You didn't fail at the habit. The app failed you — by saying nothing back."),
    ],
    # how-to-track-personal-progress — JSON-LD keyword
    "how-to-track-personal-progress.html": [
        ('"progress journaling"', '"progress tracking"'),
    ],
    # why-i-quit-every-journaling-app — body text only (NOT urls/title/canonical)
    "why-i-quit-every-journaling-app.html": [
        ('I quit ten journaling apps before I understood',
         'I quit ten habit apps before I understood'),
        ('The apps did exactly what they promised. That was the problem.',
         'The apps did exactly what they promised. That was the problem.'),  # unchanged
        ('That is the story of every journaling app I ever used.',
         'That is the story of every habit app I ever used.'),
        ('Every journaling app I tried broke the loop at the signal.',
         'Every habit app I tried broke the loop at the signal.'),
        ('That is what every journaling app I ever tried failed to provide.',
         'That is what every habit app I ever tried failed to provide.'),
        ('the assumption that the value of journaling lives in the archive',
         'the assumption that the value of tracking lives in the archive'),
        ('You did not fail at journaling. The journal failed to speak back.',
         'You did not fail at the habit. The app failed to speak back.'),
        ('They were one-way streets.',  # unchanged — just a safeguard
         'They were one-way streets.'),
        # meta description
        ('I quit ten journaling apps before I understood what was actually happening.',
         'I quit ten habit apps before I understood what was actually happening.'),
    ],
}

# ── Run ────────────────────────────────────────────────────────────────────
changed = []

for filename in sorted(os.listdir(BLOG_DIR)):
    if not filename.endswith(".html"):
        continue
    filepath = os.path.join(BLOG_DIR, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        original = f.read()
    content = original

    # 1. Global exact replacements
    for old, new in GLOBAL:
        content = content.replace(old, new)

    # 2. Full-line regex removals
    for pattern in LINE_PATTERNS:
        content = re.sub(pattern, '', content)

    # 3. File-specific fixes
    if filename in FILE_SPECIFIC:
        for old, new in FILE_SPECIFIC[filename]:
            content = content.replace(old, new)

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        changed.append(filename)

print(f"Fixed {len(changed)} files:")
for f in changed:
    print(f"  {f}")
