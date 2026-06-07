// dashboard.js — Three training tools with dynamic card updates
// ES6 classes as required by project spec

// ---- WEIGHT CLASS DATA ----
// Standards per weight class: [pullup added kg, dip added kg, squat kg, muscleup added kg]
// Values represent "competitive" level for that class

//!!!!!research to make sure of these numbers, muscleup for sure wrong
const WEIGHT_CLASSES = [
  { label: '-60 kg',  max: 60,  pullup: 35, dip: 50,  squat: 100, muscleup: 20 },
  { label: '-67.5 kg',max: 67.5,pullup: 40, dip: 55,  squat: 115, muscleup: 25 },
  { label: '-75 kg',  max: 75,  pullup: 45, dip: 60,  squat: 130, muscleup: 28 },
  { label: '-82.5 kg',max: 82.5,pullup: 48, dip: 65,  squat: 145, muscleup: 30 },
  { label: '-90 kg',  max: 90,  pullup: 50, dip: 70,  squat: 160, muscleup: 32 },
  { label: '-100 kg', max: 100, pullup: 52, dip: 72,  squat: 175, muscleup: 33 },
  { label: '100 kg+', max: 999, pullup: 55, dip: 75,  squat: 195, muscleup: 35 },
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
    if (!bw || bw < 30) {
      alert('Enter a valid bodyweight.');
      return;
    }

    const wc = this.getClass(bw);
    const toCompete = bw - (WEIGHT_CLASSES[WEIGHT_CLASSES.indexOf(wc) - 1]?.max || 0);

    // Update dashboard cards dynamically
    document.getElementById('val-class').textContent     = wc.label;
    document.getElementById('val-classsub').textContent  = `You compete in this class`;
    document.getElementById('val-pullup-std').textContent = `+${wc.pullup}`;
    document.getElementById('val-dip-std').textContent    = `+${wc.dip}`;
    document.getElementById('val-squat-std').textContent  = `${wc.squat}`;
    document.getElementById('val-mu-std').textContent     = `+${wc.muscleup}`;

    // Animate cards in
    this.cards.classList.remove('hidden');
    this.cards.querySelectorAll('.dash-card').forEach((card, i) => {
      card.style.animationDelay = `${i * 0.07}s`;
      card.style.animation = 'none';
      void card.offsetWidth; // reflow
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
    // Round to nearest 2.5kg increment (competition standard)
    return Math.round(val / step) * step;
  }

  calculate() {
    const lifts = [
      { name: 'Weighted Pull-up', id: 'att-pullup', unit: '+kg' },
      { name: 'Weighted Dip',     id: 'att-dip',    unit: '+kg' },
      { name: 'Barbell Squat',    id: 'att-squat',   unit: 'kg'  },
      { name: 'Weighted Muscle-up', id: 'att-mu',   unit: '+kg' },
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
// TOOL 3 — Program Builder
// ============================================
class ProgramBuilder {
  constructor() {
    this.btn = document.getElementById('buildProgramBtn');
    if (!this.btn) return;
    this.btn.addEventListener('click', () => this.build());
  }

  getLevel(pullups, dips, squatBW, muStatus) {
    const puAdv  = pullups >= 15;
    const dipAdv = dips >= 20;
    const sqAdv  = squatBW >= 1.5;
    const muHas  = muStatus !== 'no';
    const score  = [puAdv, dipAdv, sqAdv, muHas].filter(Boolean).length;
    if (score >= 3) return 'INTERMEDIATE';
    return 'BEGINNER';
  }

  buildSessions(level, days, pullups, dips, squatBW, muStatus, bw) {
    // Target reps: ~60-70% of max for first week
    const puTarget  = Math.max(3, Math.floor(pullups * 0.6));
    const dipTarget = Math.max(5, Math.floor(dips * 0.6));
    const sqWeight  = bw ? Math.round(bw * squatBW * 0.7 / 2.5) * 2.5 : null;

    const hasMU = muStatus !== 'no';
    const muText = muStatus === 'weighted'
      ? 'Weighted Muscle-up (light, focus form)'
      : muStatus === 'bw'
      ? 'Bodyweight Muscle-up'
      : 'Muscle-up Progression (jumping MU or negatives)';

    // Session templates
    const allSessions = {
      A: {
        name: 'PULL DAY',
        focus: 'Pull-up Strength',
        exercises: [
          { name: 'Weighted Pull-up (if ready, else BW)', target: `4 × ${puTarget} reps` },
          { name: 'Dead Hang', target: '3 × 20–30 sec' },
          { name: 'Scapular Pull-ups', target: '3 × 10 reps' },
          { name: 'Hammer Curl', target: '3 × 12 reps' },
        ]
      },
      B: {
        name: 'PUSH DAY',
        focus: 'Dip Strength',
        exercises: [
          { name: 'Weighted Dip (if ready, else BW)', target: `4 × ${dipTarget} reps` },
          { name: 'Pike Push-ups', target: '3 × 10 reps' },
          { name: 'Tricep Pushdown', target: '3 × 12 reps' },
          { name: 'Band Pull-Apart', target: '3 × 15 reps' },
        ]
      },
      C: {
        name: 'LEG DAY',
        focus: 'Squat Strength',
        exercises: [
          { name: 'Barbell Squat', target: sqWeight ? `4 × 5 reps @ ${sqWeight}kg` : '4 × 5 reps (build to heavy)' },
          { name: 'Romanian Deadlift', target: '3 × 8 reps' },
          { name: 'Bulgarian Split Squat', target: '3 × 8 reps each leg' },
          { name: 'Core — Hollow Body Hold', target: '3 × 20 sec' },
        ]
      },
      D: {
        name: 'SKILL DAY',
        focus: 'Muscle-up & Volume',
        exercises: [
          { name: muText, target: '5 × 2–3 reps' },
          { name: 'Pull-up Volume', target: `3 × ${puTarget + 2} reps (BW)` },
          { name: 'Dip Volume', target: `3 × ${dipTarget + 3} reps (BW)` },
          { name: 'L-sit Hold', target: '3 × 10 sec' },
        ]
      },
      R: {
        name: 'REST',
        focus: 'Recovery',
        exercises: [
          { name: 'Active recovery, mobility, or full rest', target: '—' },
        ]
      }
    };

    const schedules = {
      3: ['A', 'C', 'B'],
      4: ['A', 'C', 'B', 'D'],
      5: ['A', 'C', 'B', 'D', 'A'],
    };

    return schedules[days].map((key, i) => ({
      day: `DAY ${i + 1}`,
      ...allSessions[key]
    }));
  }

  build() {
    const pullups  = parseFloat(document.getElementById('prog-pullup').value) || 0;
    const dips     = parseFloat(document.getElementById('prog-dip').value) || 0;
    const squatBW  = parseFloat(document.getElementById('prog-squat').value) || 0;
    const muStatus = document.getElementById('prog-mu').value;
    const days     = parseInt(document.getElementById('prog-days').value);
    const bw       = parseFloat(document.getElementById('prog-bw').value) || null;

    if (!pullups && !dips) {
      alert('Enter at least your pull-up and dip numbers.');
      return;
    }

    const level    = this.getLevel(pullups, dips, squatBW, muStatus);
    const sessions = this.buildSessions(level, days, pullups, dips, squatBW, muStatus, bw);

    document.getElementById('progSubtext').textContent =
      `${level} LEVEL · ${days}-DAY SPLIT · Commit to this for 4 weeks before changing anything.`;

    const cardsHTML = sessions.map(s => `
      <div class="session-card">
        <div class="session-day">${s.day}</div>
        <div class="session-name">${s.name}</div>
        <div class="session-exercises">
          ${s.exercises.map(ex => `
            <div class="session-ex">
              <span class="session-ex-name">${ex.name}</span>
              <span class="session-ex-target">${ex.target}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    document.getElementById('sessionCards').innerHTML = cardsHTML;

    const result = document.getElementById('programResult');
    result.classList.remove('hidden');
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ============================================
// Init all tools
// ============================================
const weightFinder    = new WeightClassFinder();
const attemptCalc     = new AttemptCalculator();
const programBuilder  = new ProgramBuilder();