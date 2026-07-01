// assessment.js: Self-assessment tool on home page
// ES6 class as required by project spec

class SelfAssessment {
  constructor() {
    this.btn = document.getElementById('assessBtn');
    this.resultDiv = document.getElementById('assessResult');
    if (!this.btn) return;
    this.btn.addEventListener('click', () => this.assess());
  }

  getLevelFromPullups(reps) {
    if (reps >= 20) return { level: 'ADVANCED', msg: 'You\'re ready to start adding weight to pull-ups immediately.' };
    if (reps >= 12) return { level: 'INTERMEDIATE', msg: 'Solid base. Build to 15+ reps before loading.' };
    if (reps >= 5)  return { level: 'DEVELOPING', msg: 'Focus on volume. Get to 12+ clean reps first.' };
    return { level: 'BEGINNER', msg: 'Start with negatives and band-assisted work.' };
  }

  getLevelFromDips(reps) {
    if (reps >= 25) return 'ADVANCED';
    if (reps >= 15) return 'INTERMEDIATE';
    if (reps >= 8)  return 'DEVELOPING';
    return 'BEGINNER';
  }

  getLevelFromSquat(multiplier) {
    if (multiplier >= 2.0) return 'ADVANCED';
    if (multiplier >= 1.5) return 'INTERMEDIATE';
    if (multiplier >= 1.0) return 'DEVELOPING';
    return 'BEGINNER';
  }

  overallLevel(levels) {
    const order = ['BEGINNER', 'DEVELOPING', 'INTERMEDIATE', 'ADVANCED'];
    const avg = levels
      .map(l => order.indexOf(l))
      .reduce((a, b) => a + b, 0) / levels.length;
    return order[Math.round(avg)];
  }

  assess() {
    const pullups  = parseFloat(document.getElementById('pullupReps').value) || 0;
    const dips     = parseFloat(document.getElementById('dipReps').value) || 0;
    const squatBW  = parseFloat(document.getElementById('squatBW').value) || 0;
    const muStatus = parseInt(document.getElementById('muscleupStatus').value);

    const puResult = this.getLevelFromPullups(pullups);
    const dipLevel = this.getLevelFromDips(dips);
    const sqLevel  = this.getLevelFromSquat(squatBW);

    const muText = muStatus === 0
      ? 'No muscle-up yet. That\'s fine; it\'s not where you start.'
      : muStatus === 1
      ? 'You have a bodyweight muscle-up. Build to 3–5 clean reps before loading.'
      : 'You\'re already doing weighted muscle-ups. You\'re ahead of most athletes.';

    const overall = this.overallLevel([puResult.level, dipLevel, sqLevel]);

    const nextStepMap = {
      BEGINNER:     'Focus on building raw bodyweight reps across all four movements. No added weight yet. 3 months of honest volume training first.',
      DEVELOPING:   'You\'re close to loading-ready on some lifts. Prioritize the weakest link.',
      INTERMEDIATE: 'You can start a proper streetlifting program now. Get on a structured plan and start building strength with added weight.',
      ADVANCED:     'You should be competing or planning to. Your numbers are solid, now it\'s about peaking and strategy.',
    };

    this.resultDiv.innerHTML = `
      <div class="assess-result-level">${overall}</div>
      <div class="assess-result-text">
        <strong>Pull-ups:</strong> ${pullups} reps, ${puResult.level}: ${puResult.msg}<br/>
        <strong>Dips:</strong> ${dips} reps, ${dipLevel}<br/>
        <strong>Squat:</strong> ${squatBW}x BW, ${sqLevel}<br/>
        <strong>Muscle-up:</strong> ${muText}<br/><br/>
        <strong>Your next step:</strong> ${nextStepMap[overall]}
      </div>
    `;

    this.resultDiv.classList.remove('hidden');
    this.resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

const assessment = new SelfAssessment();