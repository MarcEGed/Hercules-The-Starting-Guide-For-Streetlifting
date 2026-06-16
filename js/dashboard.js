// dashboard.js — Five training tools
// ES6 classes as required by project spec

// ---- WEIGHT CLASS DATA ----
const WEIGHT_CLASSES = [
  { label: '-60 kg',   max: 60,  pullup: 35, dip: 50,  squat: 100, muscleup: 20 },
  { label: '-67.5 kg', max: 67.5,pullup: 40, dip: 55,  squat: 115, muscleup: 25 },
  { label: '-75 kg',   max: 75,  pullup: 45, dip: 60,  squat: 130, muscleup: 28 },
  { label: '-82.5 kg', max: 82.5,pullup: 48, dip: 65,  squat: 145, muscleup: 30 },
  { label: '-90 kg',   max: 90,  pullup: 50, dip: 70,  squat: 160, muscleup: 32 },
  { label: '-100 kg',  max: 100, pullup: 52, dip: 72,  squat: 175, muscleup: 33 },
  { label: '100 kg+',  max: 999, pullup: 55, dip: 75,  squat: 195, muscleup: 35 },
];

// ============================================
// TOOL 1 — Weight Class Finder
// ============================================
class WeightClassFinder {
  constructor() {
    this.btn   = document.getElementById('findClassBtn');
    this.cards = document.getElementById('classCards');
    if (!this.btn) return;
    this.btn.addEventListener('click', () => this.find());
  }

  getClass(bw) {
    return WEIGHT_CLASSES.find(wc => bw <= wc.max) || WEIGHT_CLASSES[WEIGHT_CLASSES.length - 1];
  }

  find() {
    const bw = parseFloat(document.getElementById('bwInput').value);
    if (!bw || bw < 30) { alert('Enter a valid bodyweight.'); return; }

    const wc = this.getClass(bw);
    document.getElementById('val-class').textContent      = wc.label;
    document.getElementById('val-classsub').textContent   = `You compete in this class`;
    document.getElementById('val-pullup-std').textContent = `+${wc.pullup}`;
    document.getElementById('val-dip-std').textContent    = `+${wc.dip}`;
    document.getElementById('val-squat-std').textContent  = `${wc.squat}`;
    document.getElementById('val-mu-std').textContent     = `+${wc.muscleup}`;

    this.cards.classList.remove('hidden');
    this.cards.querySelectorAll('.dash-card').forEach((card, i) => {
      card.style.animationDelay = `${i * 0.07}s`;
      card.style.animation = 'none';
      void card.offsetWidth;
      card.style.animation = `fadeUp 0.4s ease ${i * 0.07}s both`;
    });
  }
}

// ============================================
// TOOL 2 — Attempt Calculator
// ============================================
class AttemptCalculator {
  constructor() {
    this.btn = document.getElementById('calcAttemptsBtn');
    if (!this.btn) return;
    this.btn.addEventListener('click', () => this.calculate());
  }

  round(val, step = 2.5) {
    return Math.round(val / step) * step;
  }

  calculate() {
    const lifts = [
      { name: 'Weighted Pull-up',   id: 'att-pullup', unit: '+kg' },
      { name: 'Weighted Dip',       id: 'att-dip',    unit: '+kg' },
      { name: 'Barbell Squat',      id: 'att-squat',  unit: 'kg'  },
      { name: 'Weighted Muscle-up', id: 'att-mu',     unit: '+kg' },
    ];

    let hasData = false;
    const rows = lifts.map(lift => {
      const val = parseFloat(document.getElementById(lift.id).value);
      if (!val || val <= 0) return `<tr><td>${lift.name}</td><td colspan="3" style="color:var(--text-muted)">—</td></tr>`;
      hasData = true;
      const opener = this.round(val * 0.90);
      const second = this.round(val * 1.00);
      const third  = this.round(val * 1.03);
      return `<tr>
        <td>${lift.name}</td>
        <td>${opener} ${lift.unit}</td>
        <td>${second} ${lift.unit}</td>
        <td>${third} ${lift.unit}</td>
      </tr>`;
    });

    if (!hasData) { alert('Enter at least one training max.'); return; }
    document.getElementById('attemptsBody').innerHTML = rows.join('');
    const result = document.getElementById('attemptsResult');
    result.classList.remove('hidden');
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ============================================
// TOOL 3 — Program Builder (upgraded)
// ============================================
class ProgramBuilder {
  constructor() {
    this.btn = document.getElementById('buildProgramBtn');
    if (!this.btn) return;
    this.btn.addEventListener('click', () => this.build());
  }

  getLevel(pullups, dips, squatBW, muStatus) {
    const score = [pullups >= 15, dips >= 20, squatBW >= 1.5, muStatus !== 'no'].filter(Boolean).length;
    return score >= 3 ? 'INTERMEDIATE' : 'BEGINNER';
  }

  // Linear Progression scheme for beginners: add weight each session
  // Double Progression scheme for intermediate: add reps first, then weight
  getProgressionScheme(level, exercise, currentWeight, targetReps, sets) {
    if (level === 'BEGINNER') {
      const increment = exercise === 'squat' ? 5 : 2.5;
      return {
        scheme: 'Linear Progression',
        description: `Add ${increment}kg every session until you stall twice.`,
        weeks: [
          { label: 'Week 1', weight: currentWeight, reps: targetReps, sets },
          { label: 'Week 2', weight: currentWeight + increment, reps: targetReps, sets },
          { label: 'Week 3', weight: currentWeight + increment * 2, reps: targetReps, sets },
          { label: 'Week 4', weight: currentWeight + increment * 3, reps: targetReps, sets },
        ]
      };
    } else {
      // Double progression: push reps from low to high end, then bump weight
      const repFloor = targetReps;
      const repCeil  = targetReps + 3;
      const increment = exercise === 'squat' ? 5 : 2.5;
      return {
        scheme: 'Double Progression',
        description: `Work reps from ${repFloor} up to ${repCeil} across all sets. Once you hit ${repCeil}×${sets}, add ${increment}kg.`,
        weeks: [
          { label: 'Week 1', weight: currentWeight, reps: `${repFloor}–${repCeil}`, sets },
          { label: 'Week 2', weight: currentWeight, reps: `${repFloor}–${repCeil}`, sets },
          { label: 'Week 3', weight: currentWeight, reps: `${repFloor}–${repCeil}`, sets },
          { label: 'Week 4 (if all sets hit ceiling)', weight: currentWeight + increment, reps: repFloor, sets },
        ]
      };
    }
  }

  buildVariants(level, pullups, dips, squatBW, muStatus, bw, days) {
    const puWeight  = bw ? Math.round(bw * 0.1 / 2.5) * 2.5 : 5;   // rough starting added weight
    const dipWeight = bw ? Math.round(bw * 0.15 / 2.5) * 2.5 : 10;
    const sqWeight  = bw ? Math.round(bw * squatBW * 0.7 / 2.5) * 2.5 : 60;

    const puTarget  = Math.max(3, Math.floor(pullups  * 0.6));
    const dipTarget = Math.max(5, Math.floor(dips     * 0.6));

    const muText = muStatus === 'weighted' ? 'Weighted Muscle-up'
                 : muStatus === 'bw'       ? 'Bodyweight Muscle-up'
                 :                          'MU Progression (jumping MU / negatives)';

    const puProg  = this.getProgressionScheme(level, 'pullup', puWeight, puTarget, 4);
    const dipProg = this.getProgressionScheme(level, 'dip',    dipWeight, dipTarget, 4);
    const sqProg  = this.getProgressionScheme(level, 'squat',  sqWeight, 5, 4);

    const progressionHTML = (prog, unit = 'kg') => `
      <div class="prog-scheme">
        <div class="prog-scheme-label">${prog.scheme}</div>
        <div class="prog-scheme-desc">${prog.description}</div>
        <div class="prog-week-row">
          ${prog.weeks.map(w => `
            <div class="prog-week">
              <span class="prog-week-label">${w.label}</span>
              <span class="prog-week-val">${w.weight}${unit} × ${w.reps} reps × ${w.sets} sets</span>
            </div>
          `).join('')}
        </div>
      </div>`;

    // ---- MINIMAL variant (3-day, compound focus only) ----
    const minimal = {
      label: 'MINIMAL — 3 Days',
      tag:   'Essentials only. One main lift per session, low fatigue, high frequency.',
      sessions: [
        {
          day: 'DAY 1', name: 'PULL', focus: 'Pull-up Strength',
          exercises: [
            { name: 'Weighted Pull-up', target: `4 × ${puTarget} reps`, prog: progressionHTML(puProg, '+kg') },
            { name: 'Dead Hang',        target: '3 × 25 sec' },
          ]
        },
        {
          day: 'DAY 2', name: 'LEG', focus: 'Squat Strength',
          exercises: [
            { name: 'Barbell Squat', target: sqWeight ? `4 × 5 reps @ ${sqWeight}kg` : '4 × 5 reps', prog: progressionHTML(sqProg) },
            { name: 'Core — Hollow Body Hold', target: '3 × 20 sec' },
          ]
        },
        {
          day: 'DAY 3', name: 'PUSH', focus: 'Dip Strength',
          exercises: [
            { name: 'Weighted Dip', target: `4 × ${dipTarget} reps`, prog: progressionHTML(dipProg, '+kg') },
            { name: 'Band Pull-Apart', target: '3 × 15 reps' },
          ]
        },
      ]
    };

    // ---- FULL variant (days from selector) ----
    const allSessions = [
      {
        day: 'DAY 1', name: 'PULL DAY', focus: 'Pull-up Strength',
        exercises: [
          { name: 'Weighted Pull-up', target: `4 × ${puTarget} reps`, prog: progressionHTML(puProg, '+kg') },
          { name: 'Dead Hang',         target: '3 × 20–30 sec' },
          { name: 'Scapular Pull-ups', target: '3 × 10 reps' },
          { name: 'Hammer Curl',       target: '3 × 12 reps' },
        ]
      },
      {
        day: 'DAY 2', name: 'LEG DAY', focus: 'Squat Strength',
        exercises: [
          { name: 'Barbell Squat', target: sqWeight ? `4 × 5 reps @ ${sqWeight}kg` : '4 × 5 reps (build to heavy)', prog: progressionHTML(sqProg) },
          { name: 'Romanian Deadlift',     target: '3 × 8 reps' },
          { name: 'Bulgarian Split Squat', target: '3 × 8 reps each' },
          { name: 'Hollow Body Hold',      target: '3 × 20 sec' },
        ]
      },
      {
        day: 'DAY 3', name: 'PUSH DAY', focus: 'Dip Strength',
        exercises: [
          { name: 'Weighted Dip', target: `4 × ${dipTarget} reps`, prog: progressionHTML(dipProg, '+kg') },
          { name: 'Pike Push-ups',     target: '3 × 10 reps' },
          { name: 'Tricep Pushdown',   target: '3 × 12 reps' },
          { name: 'Band Pull-Apart',   target: '3 × 15 reps' },
        ]
      },
      {
        day: 'DAY 4', name: 'SKILL DAY', focus: 'Muscle-up & Volume',
        exercises: [
          { name: muText,           target: '5 × 2–3 reps' },
          { name: 'Pull-up Volume', target: `3 × ${puTarget + 2} reps (BW)` },
          { name: 'Dip Volume',     target: `3 × ${dipTarget + 3} reps (BW)` },
          { name: 'L-sit Hold',     target: '3 × 10 sec' },
        ]
      },
      {
        day: 'DAY 5', name: 'PULL (2)', focus: 'Volume & Accessory',
        exercises: [
          { name: 'Pull-up Volume',    target: `5 × ${puTarget} reps (BW)` },
          { name: 'Face Pull',         target: '4 × 15 reps' },
          { name: 'Scapular Pull-ups', target: '3 × 12 reps' },
          { name: 'Dead Hang',         target: '2 × 30 sec' },
        ]
      },
    ];

    const full = {
      label: `FULL — ${days} Days`,
      tag:   `Complete program with accessories and skill work. All four competition lifts covered.`,
      sessions: allSessions.slice(0, days)
    };

    return { minimal, full };
  }

  renderVariant(variant) {
    const sessionCards = variant.sessions.map(s => `
      <div class="session-card">
        <div class="session-day">${s.day}</div>
        <div class="session-name">${s.name}</div>
        <div class="session-exercises">
          ${s.exercises.map(ex => `
            <div class="session-ex">
              <span class="session-ex-name">${ex.name}</span>
              <span class="session-ex-target">${ex.target}</span>
              ${ex.prog ? `<div class="prog-toggle-wrap">
                <button class="prog-toggle-btn" onclick="this.nextElementSibling.classList.toggle('hidden');this.textContent=this.nextElementSibling.classList.contains('hidden')?'▸ PROGRESSION':'▾ PROGRESSION'">▸ PROGRESSION</button>
                <div class="hidden">${ex.prog}</div>
              </div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    return `
      <div class="variant-block">
        <div class="variant-header">
          <div class="variant-label">${variant.label}</div>
          <div class="variant-tag">${variant.tag}</div>
        </div>
        <div class="session-cards">${sessionCards}</div>
      </div>
    `;
  }

  build() {
    const pullups  = parseFloat(document.getElementById('prog-pullup').value) || 0;
    const dips     = parseFloat(document.getElementById('prog-dip').value) || 0;
    const squatBW  = parseFloat(document.getElementById('prog-squat').value) || 0;
    const muStatus = document.getElementById('prog-mu').value;
    const days     = parseInt(document.getElementById('prog-days').value);
    const bw       = parseFloat(document.getElementById('prog-bw').value) || null;

    if (!pullups && !dips) { alert('Enter at least your pull-up and dip numbers.'); return; }

    const level    = this.getLevel(pullups, dips, squatBW, muStatus);
    const variants = this.buildVariants(level, pullups, dips, squatBW, muStatus, bw, days);

    document.getElementById('progSubtext').textContent =
      `${level} LEVEL · Choose your variant below · Commit for 4 weeks before changing anything.`;

    document.getElementById('sessionCards').innerHTML =
      this.renderVariant(variants.minimal) + this.renderVariant(variants.full);

    const result = document.getElementById('programResult');
    result.classList.remove('hidden');
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ============================================
// TOOL 4 — Dynamic Rest Timer
// ============================================
class RestTimer {
  constructor() {
    this.container = document.getElementById('restTimerSection');
    if (!this.container) return;
    this.timerInterval = null;
    this.remaining = 0;
    this.total = 0;
    this.render();
    this.bindEvents();
  }

  rpeToSeconds(rpe) {
    // RPE 6 = 60s, RPE 7 = 90s, RPE 8 = 120s, RPE 9 = 180s, RPE 10 = 300s
    const map = { 6: 60, 7: 90, 8: 120, 9: 180, 10: 300 };
    if (rpe <= 6) return 60;
    if (rpe >= 10) return 300;
    return map[rpe] || Math.round(60 + (rpe - 6) * 60);
  }

  rpeLabel(rpe) {
    if (rpe <= 6) return 'Light — muscles not challenged much';
    if (rpe === 7) return 'Moderate — 3 reps left in the tank';
    if (rpe === 8) return 'Hard — 2 reps left';
    if (rpe === 9) return 'Very hard — 1 rep left, form holding';
    return 'Max effort — nothing left';
  }

  formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}s`;
  }

  render() {
    this.container.innerHTML = `
      <div class="tool-block">
        <div class="tool-header">
          <div class="tool-num">04</div>
          <div>
            <h2 class="tool-title">REST TIMER</h2>
            <p class="tool-subtitle">Log your RPE after each set. Rest time adjusts automatically.</p>
          </div>
        </div>

        <div class="rpe-input-row">
          <label class="assess-label">HOW HARD WAS THAT SET? (RPE)</label>
          <div class="rpe-slider-wrap">
            <input type="range" class="rpe-slider" id="rpeSlider" min="6" max="10" step="1" value="8" />
            <div class="rpe-ticks">
              <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
            </div>
          </div>
          <div class="rpe-display">
            <span class="rpe-value" id="rpeValue">RPE 8</span>
            <span class="rpe-desc" id="rpeDesc">Hard — 2 reps left</span>
          </div>
        </div>

        <div class="timer-wrap">
          <div class="timer-ring-wrap">
            <svg class="timer-ring" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
              <circle class="timer-ring-bg" cx="60" cy="60" r="52" />
              <circle class="timer-ring-progress" id="timerProgress" cx="60" cy="60" r="52"
                stroke-dasharray="326.7" stroke-dashoffset="0" />
            </svg>
            <div class="timer-inner">
              <div class="timer-countdown" id="timerCountdown">—</div>
              <div class="timer-label" id="timerLabel">READY</div>
            </div>
          </div>

          <div class="timer-controls">
            <button class="btn-primary-sl" id="startRestBtn">START REST</button>
            <button class="btn-secondary-sl" id="skipRestBtn">SKIP</button>
          </div>
        </div>

        <div class="timer-rec" id="timerRec"></div>
      </div>
    `;
  }

  bindEvents() {
    const slider   = document.getElementById('rpeSlider');
    const startBtn = document.getElementById('startRestBtn');
    const skipBtn  = document.getElementById('skipRestBtn');

    slider.addEventListener('input', () => this.onRPEChange());
    startBtn.addEventListener('click', () => this.start());
    skipBtn.addEventListener('click',  () => this.stop());

    this.onRPEChange(); // init display
  }

  onRPEChange() {
    const rpe = parseInt(document.getElementById('rpeSlider').value);
    document.getElementById('rpeValue').textContent = `RPE ${rpe}`;
    document.getElementById('rpeDesc').textContent  = this.rpeLabel(rpe);
    const secs = this.rpeToSeconds(rpe);
    document.getElementById('timerRec').textContent = `Recommended rest: ${this.formatTime(secs)}`;
    // If timer not running, update preview
    if (!this.timerInterval) {
      document.getElementById('timerCountdown').textContent = this.formatTime(secs);
      document.getElementById('timerLabel').textContent = 'READY';
      this.setProgress(1);
    }
  }

  setProgress(fraction) {
    const circumference = 326.7;
    const offset = circumference * (1 - fraction);
    const el = document.getElementById('timerProgress');
    if (el) el.style.strokeDashoffset = offset;
  }

  start() {
    if (this.timerInterval) this.stop();
    const rpe   = parseInt(document.getElementById('rpeSlider').value);
    this.total   = this.rpeToSeconds(rpe);
    this.remaining = this.total;

    document.getElementById('startRestBtn').textContent = 'RESTART';
    document.getElementById('timerLabel').textContent   = 'RESTING';

    this.timerInterval = setInterval(() => {
      this.remaining--;
      document.getElementById('timerCountdown').textContent = this.formatTime(this.remaining);
      this.setProgress(this.remaining / this.total);

      if (this.remaining <= 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        document.getElementById('timerLabel').textContent   = 'GO';
        document.getElementById('timerCountdown').textContent = '0s';
        document.getElementById('startRestBtn').textContent = 'START REST';
        // Flash effect
        document.getElementById('timerProgress').style.stroke = 'var(--accent)';
        setTimeout(() => {
          const el = document.getElementById('timerProgress');
          if (el) el.style.stroke = '';
        }, 800);
      }
    }, 1000);
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    const rpe = parseInt(document.getElementById('rpeSlider').value);
    const secs = this.rpeToSeconds(rpe);
    document.getElementById('timerCountdown').textContent = this.formatTime(secs);
    document.getElementById('timerLabel').textContent     = 'READY';
    document.getElementById('startRestBtn').textContent   = 'START REST';
    this.setProgress(1);
  }
}

// ============================================
// TOOL 5 — Warmup Generator
// ============================================
class WarmupGenerator {
  constructor() {
    this.container = document.getElementById('warmupSection');
    if (!this.container) return;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="tool-block">
        <div class="tool-header">
          <div class="tool-num">05</div>
          <div>
            <h2 class="tool-title">WARMUP GENERATOR</h2>
            <p class="tool-subtitle">Enter your working set. Get a full ramp-up pyramid, no guessing.</p>
          </div>
        </div>

        <div class="tool-inputs-row warmup-inputs-row">
          <div class="tool-input-group">
            <label class="assess-label">EXERCISE</label>
            <input type="text" class="assess-input" id="wu-exercise" placeholder="e.g. Barbell Squat" />
          </div>
          <div class="tool-input-group">
            <label class="assess-label">WORKING WEIGHT (KG)</label>
            <input type="number" class="assess-input" id="wu-weight" placeholder="e.g. 120" min="1" />
          </div>
          <div class="tool-input-group">
            <label class="assess-label">WORKING REPS</label>
            <input type="number" class="assess-input" id="wu-reps" placeholder="e.g. 5" min="1" max="20" />
          </div>
          <div class="tool-input-group">
            <label class="assess-label">WORKING SETS</label>
            <input type="number" class="assess-input" id="wu-sets" placeholder="e.g. 4" min="1" max="10" />
          </div>
        </div>
        <div class="tool-inputs-row" style="margin-top:0.5rem">
          <div class="tool-input-group">
            <label class="assess-label">LIFT TYPE</label>
            <select class="assess-input" id="wu-type">
              <option value="barbell">Barbell (starts at empty bar ~20kg)</option>
              <option value="weighted_bw">Weighted Bodyweight (pull-up / dip)</option>
              <option value="bodyweight">Bodyweight only (muscle-up / squat BW)</option>
            </select>
          </div>
          <div class="tool-input-group" id="wu-bw-group" style="display:none">
            <label class="assess-label">YOUR BODYWEIGHT (KG)</label>
            <input type="number" class="assess-input" id="wu-bw" placeholder="e.g. 80" min="40" />
          </div>
        </div>

        <button class="btn-primary-sl mt-3" id="genWarmupBtn">GENERATE WARMUP</button>

        <div class="warmup-result hidden" id="warmupResult">
          <div class="warmup-title-row">
            <h3 class="program-result-title" id="warmupExName"></h3>
            <p class="program-result-sub">Work up gradually — no set should be a grind before your working sets.</p>
          </div>
          <div class="warmup-pyramid" id="warmupPyramid"></div>
          <p class="attempt-note" style="margin-top:1.2rem">Rest 60–90s between warmup sets. The final warmup set should feel smooth, not maximal.</p>
        </div>
      </div>
    `;
  }

  bindEvents() {
    document.getElementById('genWarmupBtn').addEventListener('click', () => this.generate());
    document.getElementById('wu-type').addEventListener('change', () => {
      const t = document.getElementById('wu-type').value;
      document.getElementById('wu-bw-group').style.display =
        t === 'weighted_bw' ? 'flex' : 'none';
    });
  }

  roundTo(val, step = 2.5) {
    return Math.max(step, Math.round(val / step) * step);
  }

  buildPyramid(type, workingWeight, workingReps, bw) {
    // Percentages of working weight to ramp through
    const steps = [];

    if (type === 'barbell') {
      const barWeight = 20;
      const rampPcts  = [0, 0.40, 0.60, 0.75, 0.875]; // 0 = empty bar
      rampPcts.forEach((pct, i) => {
        const w = i === 0 ? barWeight : this.roundTo(workingWeight * pct);
        if (w >= workingWeight) return; // skip if already at or past working weight
        const reps = i === 0 ? 10 : Math.max(1, Math.round(workingReps * (1 - pct * 0.4)));
        steps.push({ weight: `${w}kg`, reps, note: i === 0 ? 'Empty bar — groove the pattern' : `${Math.round(pct * 100)}% of working weight` });
      });
    } else if (type === 'weighted_bw') {
      // For weighted pull-ups / dips: start with bodyweight-only sets, then add weight
      const addedPcts = [0, 0, 0.40, 0.65, 0.85];
      addedPcts.forEach((pct, i) => {
        const addedKg = pct === 0 ? 0 : this.roundTo(workingWeight * pct);
        if (addedKg >= workingWeight && i > 0) return;
        const reps = i <= 1 ? Math.min(8, workingReps + 3) : Math.max(1, Math.round(workingReps * (1 - pct * 0.35)));
        const note = pct === 0 ? 'Bodyweight only' : `+${addedKg}kg (${Math.round(pct * 100)}% of added load)`;
        steps.push({ weight: pct === 0 ? 'BW' : `+${addedKg}kg`, reps, note });
      });
    } else {
      // Bodyweight: ramp reps only
      const repPcts = [0.4, 0.6, 0.75, 0.9];
      repPcts.forEach(pct => {
        const reps = Math.max(1, Math.round(workingReps * pct));
        steps.push({ weight: 'BW', reps, note: `${Math.round(pct * 100)}% of working reps` });
      });
    }

    // Final potentiation set: 1 rep at or just below working weight
    if (type !== 'bodyweight' && workingWeight > 20) {
      const potWeight = type === 'barbell'
        ? this.roundTo(workingWeight * 0.95)
        : `+${this.roundTo(workingWeight * 0.95)}kg`;
      steps.push({ weight: typeof potWeight === 'number' ? `${potWeight}kg` : potWeight, reps: 1, note: 'Potentiation single — feel the weight, stay fast' });
    }

    return steps;
  }

  generate() {
    const exercise = document.getElementById('wu-exercise').value.trim() || 'Exercise';
    const weight   = parseFloat(document.getElementById('wu-weight').value);
    const reps     = parseInt(document.getElementById('wu-reps').value);
    const sets     = parseInt(document.getElementById('wu-sets').value);
    const type     = document.getElementById('wu-type').value;
    const bw       = parseFloat(document.getElementById('wu-bw').value) || null;

    if (!weight || !reps || !sets) { alert('Enter weight, reps, and sets for your working set.'); return; }

    const pyramid = this.buildPyramid(type, weight, reps, bw);

    document.getElementById('warmupExName').textContent =
      `${exercise.toUpperCase()} — Working: ${type === 'weighted_bw' ? `+${weight}kg` : `${weight}kg`} × ${reps} reps × ${sets} sets`;

    const pyramidHTML = pyramid.map((step, i) => {
      const barFill = Math.round(((i + 1) / (pyramid.length + 1)) * 100);
      return `
        <div class="warmup-step">
          <div class="warmup-step-num">${i + 1}</div>
          <div class="warmup-step-info">
            <div class="warmup-step-main">${step.weight} × ${step.reps} rep${step.reps !== 1 ? 's' : ''}</div>
            <div class="warmup-step-note">${step.note}</div>
            <div class="warmup-bar-wrap">
              <div class="warmup-bar-fill" style="width:${barFill}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('') + `
      <div class="warmup-step warmup-working">
        <div class="warmup-step-num">▶</div>
        <div class="warmup-step-info">
          <div class="warmup-step-main">${type === 'weighted_bw' ? `+${weight}kg` : `${weight}kg`} × ${reps} reps × ${sets} sets</div>
          <div class="warmup-step-note">Working sets — full effort</div>
          <div class="warmup-bar-wrap">
            <div class="warmup-bar-fill" style="width:100%;background:var(--accent)"></div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('warmupPyramid').innerHTML = pyramidHTML;
    const result = document.getElementById('warmupResult');
    result.classList.remove('hidden');
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ============================================
// Inject HTML placeholders for tools 4 & 5
// (they self-render into these containers)
// ============================================
function injectToolContainers() {
  const sectionDark = document.querySelector('.section-dark .container-sl');
  if (!sectionDark) return;

  if (!document.getElementById('restTimerSection')) {
    const div = document.createElement('div');
    div.id = 'restTimerSection';
    sectionDark.appendChild(div);
  }
  if (!document.getElementById('warmupSection')) {
    const div = document.createElement('div');
    div.id = 'warmupSection';
    sectionDark.appendChild(div);
  }
}

// ============================================
// Inject CSS for new components
// ============================================
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* ---- Variant blocks (program builder) ---- */
    .variant-block { margin-bottom: 2.5rem; }
    .variant-header { margin-bottom: 1rem; }
    .variant-label { font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; letter-spacing: 0.1em; color: var(--accent, #e8ff00); }
    .variant-tag { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: var(--text-muted, #888); margin-top: 0.2rem; }

    /* ---- Progression scheme ---- */
    .prog-toggle-wrap { margin-top: 0.5rem; }
    .prog-toggle-btn {
      background: none; border: 1px solid var(--border, #333);
      color: var(--text-muted, #888); font-family: 'DM Mono', monospace;
      font-size: 0.7rem; padding: 0.2rem 0.5rem; cursor: pointer;
      letter-spacing: 0.08em; transition: color 0.2s, border-color 0.2s;
    }
    .prog-toggle-btn:hover { color: var(--accent, #e8ff00); border-color: var(--accent, #e8ff00); }
    .prog-scheme { padding: 0.8rem; background: rgba(255,255,255,0.03); border-left: 2px solid var(--accent, #e8ff00); margin-top: 0.5rem; }
    .prog-scheme-label { font-family: 'Bebas Neue', sans-serif; font-size: 0.9rem; letter-spacing: 0.1em; color: var(--accent, #e8ff00); }
    .prog-scheme-desc { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--text-muted, #888); margin: 0.3rem 0 0.6rem; }
    .prog-week-row { display: flex; flex-direction: column; gap: 0.3rem; }
    .prog-week { display: flex; gap: 1rem; font-family: 'DM Mono', monospace; font-size: 0.72rem; }
    .prog-week-label { color: var(--text-muted, #888); min-width: 5rem; }
    .prog-week-val { color: var(--text, #e8e8e8); }

    /* ---- Rest Timer ---- */
    .rpe-input-row { margin-bottom: 1.5rem; }
    .rpe-slider-wrap { margin: 0.8rem 0 0.4rem; }
    .rpe-slider {
      -webkit-appearance: none; width: 100%; height: 4px;
      background: var(--border, #333); outline: none; border-radius: 2px;
    }
    .rpe-slider::-webkit-slider-thumb {
      -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
      background: var(--accent, #e8ff00); cursor: pointer;
    }
    .rpe-ticks { display: flex; justify-content: space-between; font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--text-muted, #888); margin-top: 0.3rem; }
    .rpe-display { display: flex; align-items: baseline; gap: 1rem; margin-top: 0.5rem; }
    .rpe-value { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 0.08em; color: var(--accent, #e8ff00); }
    .rpe-desc { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: var(--text-muted, #888); }

    .timer-wrap { display: flex; align-items: center; gap: 2.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .timer-ring-wrap { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
    .timer-ring { width: 120px; height: 120px; transform: rotate(-90deg); }
    .timer-ring-bg { fill: none; stroke: var(--border, #222); stroke-width: 6; }
    .timer-ring-progress { fill: none; stroke: var(--accent, #e8ff00); stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
    .timer-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .timer-countdown { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 0.05em; color: var(--text, #e8e8e8); line-height: 1; }
    .timer-label { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.15em; color: var(--text-muted, #888); margin-top: 0.2rem; }
    .timer-controls { display: flex; flex-direction: column; gap: 0.6rem; }
    .btn-secondary-sl {
      display: inline-block; padding: 0.55rem 1.4rem;
      font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 0.12em;
      background: transparent; border: 1px solid var(--border, #444); color: var(--text-muted, #888);
      cursor: pointer; transition: border-color 0.2s, color 0.2s;
    }
    .btn-secondary-sl:hover { border-color: var(--text, #e8e8e8); color: var(--text, #e8e8e8); }
    .timer-rec { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: var(--text-muted, #888); margin-top: 0.5rem; }

    /* ---- Warmup Generator ---- */
    .warmup-inputs-row { flex-wrap: wrap; }
    .warmup-pyramid { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 1rem; }
    .warmup-step { display: flex; align-items: flex-start; gap: 1rem; }
    .warmup-step-num {
      font-family: 'Bebas Neue', sans-serif; font-size: 1rem; color: var(--text-muted, #888);
      min-width: 1.5rem; padding-top: 0.15rem;
    }
    .warmup-step-info { flex: 1; }
    .warmup-step-main { font-family: 'DM Mono', monospace; font-size: 0.9rem; color: var(--text, #e8e8e8); }
    .warmup-step-note { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--text-muted, #888); margin: 0.15rem 0 0.4rem; }
    .warmup-bar-wrap { height: 3px; background: var(--border, #333); border-radius: 2px; overflow: hidden; }
    .warmup-bar-fill { height: 100%; background: var(--text-muted, #666); border-radius: 2px; transition: width 0.4s ease; }
    .warmup-working .warmup-step-main { color: var(--accent, #e8ff00); font-size: 1rem; }
    .warmup-working .warmup-step-num { color: var(--accent, #e8ff00); }
    .warmup-title-row { margin-bottom: 0.5rem; }

    @media (max-width: 600px) {
      .timer-wrap { gap: 1.5rem; }
      .warmup-inputs-row { flex-direction: column; }
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// Init
// ============================================
injectStyles();
injectToolContainers();

const weightFinder   = new WeightClassFinder();
const attemptCalc    = new AttemptCalculator();
const programBuilder = new ProgramBuilder();
const restTimer      = new RestTimer();
const warmupGen      = new WarmupGenerator();