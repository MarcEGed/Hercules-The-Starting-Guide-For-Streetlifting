// lifts.js — Tab switching + API Ninjas exercise fetch
// ES6 classes as required by project spec

// ---- API CONFIG ----
// Replace with your API Ninjas key after registering at api-ninjas.com
const API_KEY = 'y2yBZTBiUv9PlvZIjVKyk6ILd2uaryCS9909L03o';

class LiftTabs {
  constructor() {
    this.tabs = document.querySelectorAll('.lift-tab');
    this.panels = document.querySelectorAll('.lift-panel');
    this.init();
  }

  init() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.lift));
    });
  }

  switchTab(liftId) {
    this.tabs.forEach(t => t.classList.remove('active'));
    this.panels.forEach(p => p.classList.remove('active'));

    document.querySelector(`[data-lift="${liftId}"]`).classList.add('active');
    document.getElementById(`panel-${liftId}`).classList.add('active');
  }
}

class AccessoryLoader {
  constructor() {
    // Map: which result container to load first for each lift
    this.defaultLoad = {
      pullup:   { container: 'accessory-pullup',   muscle: 'lats' },
      dip:      { container: 'accessory-dip',      muscle: 'triceps' },
      squat:    { container: 'accessory-squat',    muscle: 'quadriceps' },
      muscleup: { container: 'accessory-muscleup', muscle: 'lats' },
    };

    // Cache to avoid redundant API calls
    this.cache = {};

    this.init();
  }

  init() {
    // Load defaults for all panels upfront
    Object.entries(this.defaultLoad).forEach(([lift, config]) => {
      this.fetchExercises(config.muscle, config.container);
    });

    // Wire up filter buttons
    document.querySelectorAll('.accessory-filter').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilter(e.target));
    });
  }

  handleFilter(btn) {
    // Find sibling filters in the same row
    const row = btn.closest('.accessory-filter-row');
    row.querySelectorAll('.accessory-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Find the results container in the same parent block
    const resultsEl = btn.closest('.accessory-wrap').querySelector('.accessory-results');
    this.fetchExercises(btn.dataset.muscle, resultsEl.id);
  }

  async fetchExercises(muscle, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Show loading state
    container.innerHTML = '<div class="api-loading">Loading exercises...</div>';

    const cacheKey = muscle;
    if (this.cache[cacheKey]) {
      this.renderExercises(this.cache[cacheKey], container);
      return;
    }

    try {
      const response = await fetch(
        `https://api.api-ninjas.com/v1/exercises?muscle=${muscle}&limit=4`,
        { headers: { 'X-Api-Key': API_KEY } }
      );

      if (!response.ok) throw new Error('API error');
      const data = await response.json();

      const filteredData = data.filter(ex =>
        !/\bpull[\s-]?ups?\b/i.test(ex.name) &&
        !/\bmuscle[\s-]?ups?\b/i.test(ex.name)
      );

      this.cache[cacheKey] = filteredData;
      this.renderExercises(filteredData, container);

    } catch (err) {
      // Graceful fallback — show curated exercises if API fails
      container.innerHTML = this.fallbackHTML(muscle);
    }
  }

  renderExercises(exercises, container) {
    if (!exercises || exercises.length === 0) {
      container.innerHTML = '<div class="api-loading">No exercises found.</div>';
      return;
    }

    container.innerHTML = exercises.map(ex => `
      <div class="exercise-card">
        <div class="exercise-card-name">${ex.name}</div>
        <div class="exercise-card-meta">${ex.type} · ${ex.difficulty}</div>
      </div>
    `).join('');
  }

  fallbackHTML(muscle) {
    // Curated fallback data if API key isn't set yet
    const fallbacks = {
      back:        ['Lat Pulldown · Compound · Intermediate', 'Straight Arm Pulldown · Isolation · Beginner', 'Dead Hang · Stretch · Beginner'],
      biceps:      ['Hammer Curl · Isolation · Beginner', 'Incline Dumbbell Curl · Isolation · Intermediate'],
      triceps:     ['Tricep Pushdown · Isolation · Beginner', 'Overhead Tricep Extension · Isolation · Intermediate', 'Dips (weighted) · Compound · Advanced'],
      chest:       ['Incline Press · Compound · Intermediate', 'Cable Fly · Isolation · Beginner'],
      quadriceps:  ['Leg Press · Compound · Beginner', 'Bulgarian Split Squat · Compound · Intermediate', 'Front Squat · Compound · Advanced'],
      glutes:      ['Romanian Deadlift · Compound · Intermediate', 'Hip Thrust · Isolation · Beginner'],
    };

    const list = fallbacks[muscle] || ['Add your API key to load live exercises'];
    return list.map(ex => {
      const parts = ex.split(' · ');
      return `<div class="exercise-card">
        <div class="exercise-card-name">${parts[0]}</div>
        <div class="exercise-card-meta">${parts[1] || ''} · ${parts[2] || ''}</div>
      </div>`;
    }).join('');
  }
}

// Init
const tabs = new LiftTabs();
const accessory = new AccessoryLoader();