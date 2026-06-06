# STREETLIFTING — Design Document
**Full Stack Development · Final Project 2026**  
**Marc Gedeon · Lebanese University, Faculty of Engineering**

---

## 1. Project Overview

### Vision
A gateway website for the sport of streetlifting — built for people who have never heard of it and athletes who are ready to start competing. The site does two things: explains the sport with the honesty and specificity it deserves, and gives visitors practical tools to begin training the same day they land on the page.

### Target Audience
- **Primary:** Athletes with a calisthenics or gym background curious about streetlifting as a competitive sport
- **Secondary:** Complete beginners with no training background who want to start from scratch
- **Not the target:** Federation administrators, coaches looking for professional tools, people looking for general fitness content

### Core Principle
Every page should answer one of two questions: *What is this sport?* or *How do I start?* If content doesn't answer one of those, it doesn't belong on the site.

---

## 2. Site Architecture

### Pages

| Page | File | Purpose |
|---|---|---|
| Home | `index.html` | Introduce the sport, hook the visitor, run a self-assessment |
| The Lifts | `lifts.html` | Deep dive on all four competition movements |
| Start Training | `start.html` | Three interactive tools to build a program |

### Navigation Structure
```
STREETLIFTING (logo → home)
├── HOME
├── THE LIFTS
└── START TRAINING
```

Navigation is fixed/sticky across all pages. On mobile it collapses to a hamburger menu. The active page link is highlighted in accent yellow.

### Routing
Static anchor-based routing (`<a href="page.html">`). No SPA framework — intentional, keeps the project scope clean and deployable as a static site with zero configuration.

---

## 3. Feature Breakdown

### Page 1 — Home (`index.html`)

| Section | Description |
|---|---|
| Hero | Full-viewport intro with large typographic title, sport tagline, two CTAs, stat bar at the bottom |
| What Is It | Two-column layout — copy explaining the sport left, four lift icon cards right |
| Self-Assessment | Four inputs (pull-up reps, dip reps, squat multiplier, muscle-up status) → dynamic result output with level and next-step guidance |
| Competition Format | Four-step grid explaining weigh-in, attempts, judging, totals |
| CTA | Push to Start Training page |

**Interactive feature:** Self-assessment — class `SelfAssessment` in `js/assessment.js`

---

### Page 2 — The Lifts (`lifts.html`)

| Section | Description |
|---|---|
| Page Header | Title + one-line description |
| Lift Tabs | Four tab buttons switch between lift panels without page reload |
| Each Lift Panel | Badge, title, description, competition standard list, common red lights list, training guidance, standards table, accessory exercise API section |

**Interactive features:**
- Tab switching — class `LiftTabs` in `js/lifts.js`
- API accessory exercises with muscle group filter — class `AccessoryLoader` in `js/lifts.js`

**API integration point:** API Ninjas Exercises endpoint. Called when a tab is active, filtered by muscle group (back, biceps, triceps, chest, quadriceps, glutes). Results cached in memory to avoid redundant calls. Graceful fallback renders curated data if the API key is missing or the request fails.

**Lift panels covered:**

| Lift | Focus | Accessory Muscles |
|---|---|---|
| Weighted Pull-up | Pull | Back, Biceps |
| Weighted Dip | Push | Triceps, Chest |
| Barbell Squat | Legs | Quadriceps, Glutes |
| Weighted Muscle-up | Skill | Back, Triceps |

---

### Page 3 — Start Training (`start.html`)

The unique UI requirement: **dashboard layout with cards and dynamic updates.**

Three tools, all client-side, all dynamically updating the DOM without page reload.

#### Tool 1 — Weight Class Finder
- **Input:** bodyweight (kg)
- **Output:** Five dashboard cards update simultaneously — weight class label, competitive pull-up standard, competitive dip standard, competitive squat standard, competitive muscle-up standard
- **Cards animate in** with staggered delay on each update
- **Data source:** Hardcoded weight class standards table in `dashboard.js`

#### Tool 2 — Attempt Calculator
- **Input:** Training max (added kg) for each of the four lifts
- **Output:** Table renders with three attempts per lift — opener (~90%), second (~100%), third (~103%) — all rounded to nearest 2.5kg increment (competition standard)
- **Logic:** Standard strength sport attempt selection, adapted for streetlifting

#### Tool 3 — Program Builder
- **Input:** Current bodyweight reps (pull-ups, dips), squat bodyweight multiple, muscle-up status, training days per week (3/4/5), bodyweight
- **Output:** Session cards rendered dynamically — one card per training day, each card showing session name, focus, exercises, and set/rep targets
- **Logic:** Calculates a starting level (Beginner/Intermediate) from inputs, selects a session schedule (A/B/C/D templates), personalizes rep targets at ~60–70% of current max for Week 1

---

## 4. Technical Architecture

### Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| Markup | HTML5 (semantic) | Project requirement |
| Styling | CSS3 (hand-written) + Bootstrap 5 | Project requirement; Bootstrap used for grid utilities and responsive helpers |
| Scripting | Vanilla JS (ES6 classes) | Project requirement — no jQuery, no frameworks |
| API | API Ninjas (Exercises) | Requires registration and API key — satisfies API requirement |
| Deployment | Vercel | Free, zero-config static deployment |
| Version Control | GitHub | Project requirement |

### JavaScript Class Structure

```
js/nav.js
└── Navigation
    ├── handleScroll()     → sticky nav on scroll
    └── toggleMobile()     → hamburger menu

js/assessment.js
└── SelfAssessment
    ├── getLevelFromPullups()
    ├── getLevelFromDips()
    ├── getLevelFromSquat()
    ├── overallLevel()
    └── assess()           → reads inputs, writes result to DOM

js/lifts.js
├── LiftTabs
│   ├── switchTab()        → show/hide panels, update active tab
└── AccessoryLoader
    ├── fetchExercises()   → API call with in-memory cache
    ├── renderExercises()  → write exercise cards to DOM
    ├── handleFilter()     → muscle group filter button logic
    └── fallbackHTML()     → curated data if API unavailable

js/dashboard.js
├── WeightClassFinder
│   ├── getClass()         → match bodyweight to weight class
│   └── find()             → update five dashboard cards
├── AttemptCalculator
│   ├── round()            → round to 2.5kg increments
│   └── calculate()        → render attempt table
└── ProgramBuilder
    ├── getLevel()         → determine beginner/intermediate
    ├── buildSessions()    → generate session array from templates
    └── build()            → render session cards to DOM
```

### API Integration Details

**Endpoint:** `GET https://api.api-ninjas.com/v1/exercises?muscle={muscle}&limit=4`  
**Auth:** `X-Api-Key` header  
**Called from:** `AccessoryLoader.fetchExercises()`  
**Caching:** Results stored in `this.cache` object keyed by muscle name. Second call to the same muscle group skips the fetch and renders from cache.  
**Error handling:** `try/catch` on every fetch. On failure, `fallbackHTML()` renders curated backup data. Loading state shown while request is in flight. Empty state handled if API returns an empty array.

---

## 5. Design System

### Aesthetic Direction
**Industrial / Athletic.** Dark, dense, high-contrast. Feels like a sport, not a wellness app. Inspired visually by powerlifting federation sites and underground training culture — raw, serious, functional.

### Color Palette

| Variable | Value | Use |
|---|---|---|
| `--bg-black` | `#0a0a0a` | Page background |
| `--bg-dark` | `#111111` | Alternate section background |
| `--bg-card` | `#181818` | Cards, panels, tool blocks |
| `--accent` | `#e8ff00` | Primary accent — CTAs, highlights, numbers |
| `--accent-dim` | `#b8cc00` | Accent hover state |
| `--text-primary` | `#f0f0f0` | Headings, important text |
| `--text-secondary` | `#888888` | Body copy |
| `--text-muted` | `#555555` | Labels, metadata |
| `--border` | `#2a2a2a` | All borders and dividers |
| `--red` | `#ff4444` | Red light / fault indicators |
| `--green` | `#44ff88` | Valid rep / standard indicators |

### Typography

| Role | Font | Usage |
|---|---|---|
| Display | Bebas Neue | Page titles, section titles, large numbers |
| Monospace | DM Mono | Labels, eyebrows, metadata, buttons, tables |
| Body | Inter 300/400 | Paragraphs, descriptions |

**Type scale:**
- Hero title: `clamp(5rem, 15vw, 11rem)`
- Section title: `clamp(2.5rem, 6vw, 5rem)`
- Lift detail title: `clamp(2.5rem, 5vw, 4rem)`
- Body: `1rem` / `0.9rem`
- Labels/eyebrows: `0.65–0.75rem` with `letter-spacing: 0.15–0.25em`

### Layout Principles
- Max content width: `1200px`, centered, `2rem` side padding
- Section vertical rhythm: `6rem` padding (compress to `4rem` on mobile)
- Grid-of-1px-gaps pattern for card grids — background color of the grid container acts as the gap/border, creating a seamless connected panel aesthetic
- No border-radius anywhere — sharp corners reinforce the industrial tone

### Component Patterns

**Buttons — two variants:**
- `.btn-primary-sl` — solid accent yellow, black text, monospace label
- `.btn-ghost-sl` — transparent, white text, thin border, accent on hover

**Cards:**
- Flat, no shadow, `1px` border in `--border`
- Hover: background lightens slightly (`--bg-card-hover`)
- Dashboard cards: value in display font at accent color, label in mono at muted color

**Tables:**
- No outer border on rows — only bottom `1px` border in `--border`
- Last row uses accent color to indicate top tier
- Monospace throughout

### Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `> 1000px` | Full two-column lift detail layout |
| `900px` | Split layout collapses to single column |
| `768px` | Nav collapses to hamburger |
| `600px` | Hero stats wrap to 2×2 grid |
| `< 480px` | Tool inputs stack vertically |

### Animation
- `fadeUp` keyframe: `opacity 0 → 1`, `translateY(16px → 0)`, `0.3–0.4s ease`
- Applied on: assessment result, lift panel switch, dashboard card reveal, program card render
- Staggered delay on dashboard cards: `i × 0.07s`
- Nav scroll transition: padding compress on scroll via `.scrolled` class

---

## 6. Content Architecture

### Strength Standards Data (curated)
Hardcoded in `dashboard.js` as `WEIGHT_CLASSES` array. Seven weight classes from -60kg to 100kg+. Each entry contains competitive-level benchmarks for all four lifts, calibrated from publicly available competition results and community knowledge.

### Competition Standards (curated)
Written per lift in `lifts.html`. Based on general streetlifting judging criteria — not federation-specific since rules vary slightly. Focused on what most federations agree on: dead hang, chin over bar, full lockout, 90° depth on dips, hip crease below knee on squat.

### Program Logic
First-week targets set at 60–70% of stated max to prioritize technique over load and prevent first-week burnout. Four session templates (Pull, Push, Legs, Skill) combined based on days-per-week input. Muscle-up template adapts based on current ability level.

---

## 7. Deployment Plan

### Platform: Vercel (free tier)
1. Push complete project to public GitHub repository
2. Connect repository to Vercel via dashboard
3. No build configuration needed — static site, deploys as-is
4. Custom domain optional (free subdomain: `projectname.vercel.app`)

### Pre-Deployment Checklist
- [ ] API key inserted in `js/lifts.js`
- [ ] All three pages load with no console errors
- [ ] Self-assessment produces output on all edge cases (all zeros, all maxes)
- [ ] Attempt calculator rounds correctly to 2.5kg increments
- [ ] Program builder produces correct session count for 3, 4, and 5 days
- [ ] API fallback renders when API key is absent
- [ ] Navigation works on all three pages
- [ ] Mobile layout tested at 375px
- [ ] Screenshots taken at 375px / 768px / 1280px → saved to `/assets/`
- [ ] README updated with live URL and GitHub link
- [ ] Meaningful commit history (not one bulk commit)

---

## 8. Version Control Strategy

Recommended commit sequence to demonstrate process to the professor:

```
Initial commit — project structure and empty files
Add CSS design system and global styles
Build home page HTML structure
Add hero section and sport introduction content
Implement self-assessment JS class
Add lifts page HTML — pull-up and dip panels
Add lifts page HTML — squat and muscle-up panels
Implement LiftTabs ES6 class
Implement AccessoryLoader with API Ninjas integration
Add API fallback and loading/error states
Build start training page HTML structure
Implement WeightClassFinder dashboard class
Implement AttemptCalculator class
Implement ProgramBuilder class with session templates
Add responsive styles and mobile navigation
Fix attempt rounding to 2.5kg increments
Fix accessory filter targeting correct container
Final polish — animations, hover states, typography
Add README, design doc, and evidence screenshots
```

---

## 9. Known Limitations & Future Improvements

| Limitation | Future Fix |
|---|---|
| No user accounts — program not saved between sessions | Add Supabase auth + database |
| Standards data is hardcoded — not live from a database | Build an admin panel to update records |
| No actual competition data / results | Scrape or manually add real competition results |
| Program builder generates Week 1 only | Build a full 12-week progressive program generator |
| API key exposed client-side | Move API call to a serverless function (Vercel Edge Function) |
| No unit toggle (kg/lbs) | Add toggle and conversion throughout |