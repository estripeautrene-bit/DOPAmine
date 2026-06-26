#!/usr/bin/env python3
"""Add 'Also From the Lab' section to blog articles that are missing it."""
import os

BLOG_DIR = "blog"

OLDER_LAB_CSS = """
/* ── ALSO FROM THE LAB ── */
.lab-section { padding: 0 0 100px; }
.lab-label { font-size: 11px; font-weight: 600; letter-spacing: 5px; text-transform: uppercase; color: var(--muted); margin-bottom: 32px; }
.lab-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.lab-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(123,47,190,0.15); border-radius: 14px; padding: 28px; text-decoration: none; transition: border-color 0.2s, transform 0.2s; display: block; }
.lab-card:hover { border-color: rgba(123,47,190,0.35); transform: translateY(-3px); }
.lab-card-category { font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--glow); margin-bottom: 12px; }
.lab-card-title { font-family: "Playfair Display", serif; font-size: 19px; font-weight: 700; color: var(--white); line-height: 1.2; margin-bottom: 12px; }
.lab-card-excerpt { font-size: 14px; color: var(--muted); line-height: 1.6; }
.lab-card-link { display: inline-block; margin-top: 16px; font-size: 13px; color: var(--glow); font-weight: 600; }
@media (max-width: 600px) { .lab-grid { grid-template-columns: 1fr; } }"""

NEWER_LAB_CSS = """
/* ── ALSO FROM THE LAB ── */
.lab-section { padding: 0 0 100px; }
.lab-label { font-size: 11px; font-weight: 600; letter-spacing: 5px; text-transform: uppercase; color: var(--gray-muted); margin-bottom: 32px; }
.lab-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.lab-card { background: var(--navy-panel); border: 1px solid rgba(168,85,247,0.1); border-radius: 14px; padding: 28px; text-decoration: none; transition: border-color 0.2s, transform 0.2s; display: block; }
.lab-card:hover { border-color: rgba(168,85,247,0.3); transform: translateY(-3px); }
.lab-card-category { font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--orange-energy); margin-bottom: 12px; }
.lab-card-title { font-family: var(--font-d); font-size: 19px; font-weight: 700; color: var(--white); line-height: 1.2; margin-bottom: 12px; }
.lab-card-excerpt { font-size: 14px; color: var(--gray-muted); line-height: 1.6; }
.lab-card-link { display: inline-block; margin-top: 16px; font-size: 13px; color: var(--purple-bright); font-weight: 600; }
@media (max-width: 600px) { .lab-grid { grid-template-columns: 1fr; } }"""

def make_lab_html(slug1, cat1, title1, excerpt1, slug2, cat2, title2, excerpt2, use_reveal=False):
    reveal = " reveal" if use_reveal else ""
    return f"""
<!-- ALSO FROM THE LAB -->
<div style="max-width:700px;margin:0 auto;padding:0 24px;">
  <div class="lab-section{reveal}">
    <p class="lab-label">Also from the lab</p>
    <div class="lab-grid">
      <a href="https://mydopa.app/blog/{slug1}" class="lab-card">
        <p class="lab-card-category">{cat1}</p>
        <p class="lab-card-title">{title1}</p>
        <p class="lab-card-excerpt">{excerpt1}</p>
        <span class="lab-card-link">Read →</span>
      </a>
      <a href="https://mydopa.app/blog/{slug2}" class="lab-card">
        <p class="lab-card-category">{cat2}</p>
        <p class="lab-card-title">{title2}</p>
        <p class="lab-card-excerpt">{excerpt2}</p>
        <span class="lab-card-link">Read →</span>
      </a>
    </div>
  </div>
</div>
"""

# (slug1, cat1, title1, excerpt1, slug2, cat2, title2, excerpt2)
RELATED = {
    "DOPAmine_Blog_Post2_ES.html": (
        "cinco-a-uno-sesgo-de-negatividad",
        "La Ciencia",
        "La Regla 5:1: Por Qué Un Mal Momento Borra Cinco Buenos",
        "La ciencia detrás del sesgo de negatividad: por qué un momento negativo pesa más que cinco positivos, y cómo cambiarlo.",
        "rick-hanson-negativity-bias",
        "The Science",
        "Rick Hanson's Negativity Bias: The Full Explanation",
        "Rick Hanson calls the brain Velcro for the bad and Teflon for the good. Here is how to make the good stick.",
    ),
    "bj-fogg-founder-story.html": (
        "small-wins-theory",
        "The Science",
        "Karl Weick's Small Wins Theory: Why Small Progress Is the Only Progress That Lasts",
        "In 1984 Karl Weick published the most structurally rigorous explanation for why small daily actions compound into lasting transformation.",
        "implementation-intentions",
        "The Science",
        "Implementation Intentions: The Research That Doubles Goal Achievement",
        "The same goal. The same motivation. The same person. Double the achievement rate. The variable is a specific kind of plan.",
    ),
    "consistency-is-the-compounding-effect.html": (
        "small-wins-theory",
        "The Science",
        "Karl Weick's Small Wins Theory: Why Small Progress Is the Only Progress That Lasts",
        "In 1984 Karl Weick published the most structurally rigorous explanation for why small daily actions compound into lasting transformation.",
        "daily-wins-habit-brain-rewire",
        "The Practice",
        "The Daily Wins Habit: How 3 Things a Day Rewires Your Brain",
        "Capturing three small wins a day isn't positive thinking. It's a brain training practice backed by neuroplasticity research.",
    ),
    "day-90-what-changes.html": (
        "invisible-progress",
        "The Science",
        "Why You Can't See Your Own Progress",
        "You're doing the work. The brain isn't showing you the results. Here's the specific perceptual gap that creates betterment burnout.",
        "daily-wins-habit-brain-rewire",
        "The Practice",
        "The Daily Wins Habit: How 3 Things a Day Rewires Your Brain",
        "Three specific wins per day. Written down. Held for twelve seconds. Here is why this two-minute practice changes what the brain builds.",
    ),
    "founder-story.html": (
        "why-you-do-not-trust-yourself-anymore",
        "Self-Trust",
        "Why You Do Not Trust Yourself Anymore",
        "Every time you don't follow through, your brain records it. Here is how that erodes self-trust — and how to rebuild it.",
        "small-wins-theory",
        "The Science",
        "Karl Weick's Small Wins Theory: Why Small Progress Is the Only Progress That Lasts",
        "In 1984 Karl Weick published the most structurally rigorous explanation for why small daily actions compound into lasting transformation.",
    ),
    "how-to-build-magnetic-confidence.html": (
        "why-you-do-not-trust-yourself-anymore",
        "Self-Trust",
        "Why You Do Not Trust Yourself Anymore",
        "Every time you don't follow through, your brain records it. Here is how that erodes self-trust — and how to rebuild it.",
        "self-improvement-burnout",
        "The Science",
        "What Is Self-Improvement Burnout — And How to Know If You Have It",
        "Self-improvement burnout is not from working too hard. It is from working hard while your brain deletes the evidence it is working.",
    ),
    "how-to-change-limiting-beliefs.html": (
        "why-you-do-not-trust-yourself-anymore",
        "Self-Trust",
        "Why You Do Not Trust Yourself Anymore",
        "Every time you don't follow through, your brain records it. Here is how that erodes self-trust — and how to rebuild it.",
        "invisible-progress",
        "The Science",
        "Why You Can't See Your Own Progress",
        "You're doing the work. The brain isn't showing you the results. Here's the specific perceptual gap that creates betterment burnout.",
    ),
    "how-to-rewire-your-brain-to-be-positive.html": (
        "rick-hanson-negativity-bias",
        "The Science",
        "Rick Hanson's Negativity Bias: The Full Explanation",
        "Velcro for the bad, Teflon for the good. Here is the complete science behind why the brain is built this way — and what Hanson's research says about changing it.",
        "positive-neuroplasticity-how-to-rewire-your-brain",
        "Mental Resilience",
        "Positive Neuroplasticity: How to Rewire Your Brain Deliberately",
        "Neuroplasticity is not a metaphor. Here is how to use it deliberately to build a brain that registers growth instead of filtering it out.",
    ),
    "mental-resilience-vs-emotional-intelligence.html": (
        "how-to-build-mental-resilience",
        "The Science",
        "How to Build Mental Resilience",
        "Mental resilience is not toughness. It is a trainable set of encoded experiences your brain can draw on when difficulty arrives.",
        "positive-neuroplasticity-how-to-rewire-your-brain",
        "Mental Resilience",
        "Positive Neuroplasticity: How to Rewire Your Brain Deliberately",
        "Neuroplasticity is not a metaphor. Here is how to use it deliberately to build a brain that registers growth instead of filtering it out.",
    ),
    "no-hay-mejor-predicador-que-el-pasado.html": (
        "cinco-a-uno-sesgo-de-negatividad",
        "La Ciencia",
        "La Regla 5:1: Por Qué Un Mal Momento Borra Cinco Buenos",
        "La ciencia detrás del sesgo de negatividad: por qué un momento negativo pesa más que cinco positivos, y cómo cambiarlo.",
        "rick-hanson-negativity-bias",
        "The Science",
        "Rick Hanson's Negativity Bias: The Full Explanation",
        "Rick Hanson calls the brain Velcro for the bad and Teflon for the good. Here is how to make the good stick.",
    ),
    "the-belief-ceiling.html": (
        "why-you-do-not-trust-yourself-anymore",
        "Self-Trust",
        "Why You Do Not Trust Yourself Anymore",
        "Every time you don't follow through, your brain records it. Here is how that erodes self-trust — and how to rebuild it.",
        "invisible-progress",
        "The Science",
        "Why You Can't See Your Own Progress",
        "You're doing the work. The brain isn't showing you the results. Here's the specific perceptual gap that creates betterment burnout.",
    ),
    "the-four-pillars.html": (
        "small-wins-theory",
        "The Science",
        "Karl Weick's Small Wins Theory: Why Small Progress Is the Only Progress That Lasts",
        "In 1984 Karl Weick published the most structurally rigorous explanation for why small daily actions compound into lasting transformation.",
        "implementation-intentions",
        "The Science",
        "Implementation Intentions: The Research That Doubles Goal Achievement",
        "The if-then plan that turns a decision into automatic action — and doubles goal achievement rates.",
    ),
    "the-moment-a-habit-stops-being-hard.html": (
        "daily-wins-habit-brain-rewire",
        "The Practice",
        "The Daily Wins Habit: How 3 Things a Day Rewires Your Brain",
        "Capturing three small wins a day isn't positive thinking. It's a brain training practice backed by neuroplasticity research.",
        "small-wins-theory",
        "The Science",
        "Karl Weick's Small Wins Theory: Why Small Progress Is the Only Progress That Lasts",
        "In 1984 Karl Weick published the most structurally rigorous explanation for why small daily actions compound into lasting transformation.",
    ),
    "the-three-hour-drive.html": (
        "why-you-do-not-trust-yourself-anymore",
        "Self-Trust",
        "Why You Do Not Trust Yourself Anymore",
        "Every time you don't follow through, your brain records it. Here is how that erodes self-trust — and how to rebuild it.",
        "small-wins-theory",
        "The Science",
        "Karl Weick's Small Wins Theory: Why Small Progress Is the Only Progress That Lasts",
        "In 1984 Karl Weick published the most structurally rigorous explanation for why small daily actions compound into lasting transformation.",
    ),
    "two-minute-daily-mindset-practice.html": (
        "daily-wins-habit-brain-rewire",
        "The Practice",
        "The Daily Wins Habit: How 3 Things a Day Rewires Your Brain",
        "Capturing three small wins a day isn't positive thinking. It's a brain training practice backed by neuroplasticity research.",
        "rick-hanson-negativity-bias",
        "The Science",
        "Rick Hanson's Negativity Bias: The Full Explanation",
        "Velcro for the bad, Teflon for the good. Here is the complete science behind why the brain is built this way — and what Hanson's research says about changing it.",
    ),
    "wanting-vs-deciding.html": (
        "woop-method-goal-setting",
        "Goals &amp; Commitment",
        "The WOOP Method Explained: Science-Backed Goal Setting",
        "WOOP wraps mental contrasting and implementation intentions into four steps you can run in your head in two minutes.",
        "why-most-people-never-actually-commit-to-a-goal",
        "Goals &amp; Commitment",
        "Why Most People Never Actually Commit to a Goal",
        "You wanted the goal. You did not commit to it. Here is the neurological difference — and the three components of a genuine commitment.",
    ),
    "why-do-i-only-remember-bad-things.html": (
        "rick-hanson-negativity-bias",
        "The Science",
        "Rick Hanson's Negativity Bias: The Full Explanation",
        "Velcro for the bad, Teflon for the good. Here is the complete science behind why the brain is built this way — and what Hanson's research says about changing it.",
        "why-you-remember-criticism-more-than-praise",
        "Negativity Bias",
        "Why You Remember Criticism More Than Praise",
        "The asymmetry is not in your head — it is in your neurobiology. Here is the mechanism, and what the research says about closing the gap.",
    ),
    "why-i-quit-every-journaling-app.html": (
        "invisible-progress",
        "The Science",
        "Why You Can't See Your Own Progress",
        "You're doing the work. The brain isn't showing you the results. Here's the specific perceptual gap that creates betterment burnout.",
        "daily-wins-habit-brain-rewire",
        "The Practice",
        "The Daily Wins Habit: How 3 Things a Day Rewires Your Brain",
        "Capturing three small wins a day isn't positive thinking. It's a brain training practice backed by neuroplasticity research.",
    ),
    "why-your-streak-counter.html": (
        "how-to-track-personal-progress",
        "Small Wins",
        "How to Track Personal Progress Without a Streak Counter",
        "The most effective progress tracking is not metrics or streaks. It is specific, dated evidence of who you are becoming.",
        "small-wins-theory",
        "The Science",
        "Karl Weick's Small Wins Theory: Why Small Progress Is the Only Progress That Lasts",
        "In 1984 Karl Weick published the most structurally rigorous explanation for why small daily actions compound into lasting transformation.",
    ),
    "you-dont-have-a-discipline-problem.html": (
        "invisible-progress",
        "The Science",
        "Why You Can't See Your Own Progress",
        "You're doing the work. The brain isn't showing you the results. Here's the specific perceptual gap that creates betterment burnout.",
        "self-improvement-burnout",
        "The Science",
        "What Is Self-Improvement Burnout — And How to Know If You Have It",
        "Self-improvement burnout is not from working too hard. It is from working hard while your brain deletes the evidence it is working.",
    ),
    "your-brain-is-not-broken.html": (
        "rick-hanson-negativity-bias",
        "The Science",
        "Rick Hanson's Negativity Bias: The Full Explanation",
        "Velcro for the bad, Teflon for the good. Here is the complete science behind why the brain is built this way — and what Hanson's research says about changing it.",
        "positive-neuroplasticity-how-to-rewire-your-brain",
        "Mental Resilience",
        "Positive Neuroplasticity: How to Rewire Your Brain Deliberately",
        "Neuroplasticity is not a metaphor. Here is how to use it deliberately to build a brain that registers growth instead of filtering it out.",
    ),
}

done = []
skipped = []

for filename, args in RELATED.items():
    filepath = os.path.join(BLOG_DIR, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if "lab-section" in content or "lab-grid" in content:
        skipped.append(filename)
        continue

    is_newer = "var(--navy-panel)" in content or "var(--orange-energy)" in content

    # Add lab CSS to <style> block
    lab_css = NEWER_LAB_CSS if is_newer else OLDER_LAB_CSS
    if "</style>" in content:
        content = content.replace("</style>", lab_css + "\n  </style>", 1)

    # Generate HTML (only newer-template files with existing reveal infrastructure get the class)
    has_reveal_infra = "IntersectionObserver" in content or ".reveal" in content
    lab_html = make_lab_html(*args, use_reveal=has_reveal_infra)

    # Insert: before <footer> if present, otherwise before </body>
    if "<footer>" in content:
        content = content.replace("<footer>", lab_html + "\n<footer>", 1)
    else:
        content = content.replace("</body>", lab_html + "\n</body>", 1)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    done.append(filename)

print(f"Added section to {len(done)} files:")
for f in done:
    print(f"  DONE: {f}")
if skipped:
    print(f"\nSkipped {len(skipped)} (already had section):")
    for f in skipped:
        print(f"  SKIP: {f}")
