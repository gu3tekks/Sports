// --- Constants (customize as desired) ---
const β = [1, 1]; // Context weights
const α = [1, 1, 1, 1]; // Matchup weights
const w = [1, 1, 1, 1]; // Logistic regression weights
const b = 0; // Logistic intercept
const σ_spread_to_margin = 7;
const prop_edge_threshold = 0.07;
const side_edge_threshold = 0.04;
const spread_discrepancy_threshold = 1.0;
const total_discrepancy_threshold = 1.0;

// --- Math helpers ---
function dot(a, b) {
  return a.reduce((sum, ai, i) => sum + ai * (b[i] || 0), 0);
}
function standardize(arr) {
  const mu = arr.reduce((a, b) => a + b, 0) / arr.length;
  const sigma = Math.sqrt(arr.reduce((a, b) => a + (b - mu) ** 2, 0) / arr.length) || 1;
  return arr.map(x => (x - mu) / sigma);
}
function logistic(x) {
  return 1 / (1 + Math.exp(-x));
}
function norm_cdf(x) {
  return (1 + Math.erf(x / Math.sqrt(2))) / 2;
}
Math.erf = Math.erf || function(x) {
  // Approximate error function
  const s = Math.sign(x), a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
  return s * y;
};
function implied_prob(decimal_odds) {
  if (!decimal_odds || decimal_odds === 0) return 0;
  return 1 / decimal_odds;
}

// --- Placeholders for advanced features ---
function OLvDL(a, b) { return 0; }
function WRvCB(a, b) { return 0; }
function RushFit(a, b) { return 0; }
function CoverageFit(a, b) { return 0; }
function scoring_intensities(a, b) { return [23, 21, 0]; }
function simulate_stat_distribution(type, usage, eff) {
  return {
    prob_over: (line) => Math.random() * 0.5 + 0.25 // Placeholder, replace with real sim
  };
}
function eligible(player) { return true; }
function estimate_usage(p, a, b) { return 1; }
function estimate_efficiency(p, a, b) { return 1; }

// --- Main BET_DECISION ---
function BET_DECISION(TeamA, TeamB, Market) {
  // 1. Feature engineering
  const ΔAdjR = (TeamA.Rating + TeamA.HomeAdv + dot(β, TeamA.Context)) - (TeamB.Rating + TeamB.HomeAdv + dot(β, TeamB.Context));
  const ΔEPA = (TeamA.OffEPA - TeamB.DefEPA) - (TeamB.OffEPA - TeamA.DefEPA);
  const ΔMatchup = α[0]*OLvDL(TeamA, TeamB) + α[1