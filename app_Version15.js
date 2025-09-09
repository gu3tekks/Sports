import { BET_DECISION } from "./betlogic.js";

// --- UI glue ---
const form = document.getElementById('bet-form');
const message = document.getElementById('form-message');
const resultsSection = document.getElementById('results');
const decisionDiv = document.getElementById('decision');

form.onsubmit = async function(e) {
  e.preventDefault();
  message.textContent = '';
  resultsSection.hidden = true;

  // Validate required fields
  const requiredIds = ["teamA_name","teamA_rating","teamB_name","teamB_rating","spread","total"];
  let hasError = false;
  requiredIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
      el.style.borderColor = "#f33";
      hasError = true;
    } else {
      el.style.borderColor = "";
    }
  });
  if (hasError) {
    message.textContent = "Please fill out all required fields.";
    return;
  }

  // Team vectors
  const TeamA = {
    Name: form.teamA_name.value,
    Rating: +form.teamA_rating.value,
    HomeAdv: +form.teamA_homeadv.value || 0,
    OffEPA: +form.teamA_offepa.value,
    DefEPA: +form.teamA_defepa.value,
    Context: (form.teamA_context.value || '').split(',').map(Number).filter(x=>!isNaN(x)),
    Players: parsePlayers(form.teamA_players.value)
  };
  const TeamB = {
    Name: form.teamB_name.value,
    Rating: +form.teamB_rating.value,
    HomeAdv: +form.teamB_homeadv.value || 0,
    OffEPA: +form.teamB_offepa.value,
    DefEPA: +form.teamB_defepa.value,
    Context: (form.teamB_context.value || '').split(',').map(Number).filter(x=>!isNaN(x)),
    Players: parsePlayers(form.teamB_players.value)
  };
  // Market
  const Market = {
    Spread: +form.spread.value,
    Total: +form.total.value,
    MoneylineA: +form.mlA.value,
    MoneylineB: +form.mlB.value,
  };

  resultsSection.hidden = false;
  decisionDiv.innerHTML = `<em>Running formula...</em>`;

  await new Promise(r=>setTimeout(r, 180));
  try {
    const bets = BET_DECISION(TeamA, TeamB, Market);
    let html = '';
    if (bets.length) {
      html += `<ul>`;
      bets.forEach(bet => {
        if (bet.Market === "Moneyline") {
          html += `<li><b>Moneyline:</b> Bet ${bet.Team} (Edge: ${bet.Edge})</li>`;
        } else if (bet.Market === "Spread") {
          html += `<li><b>Spread:</b> Bet ${bet.Team} (Edge: ${bet.Edge})</li>`;
        } else if (bet.Market === "Total") {
          html += `<li><b>Total:</b> Bet ${bet.Direction} (Edge: ${bet.Edge})</li>`;
        } else if (bet.Player) {
          html += `<li><b>Prop:</b> ${bet.Player} ${bet.Stat} ${bet.Direction} ${bet.Line} (Edge: ${bet.Edge}%, Prob: ${bet.Prob})</li>`;
        }
      });
      html += `</ul>`;
    } else {
      html = `<b>No recommendations above thresholds.</b>`;
    }
    decisionDiv.innerHTML = html;
  } catch (err) {
    decisionDiv.innerHTML = `<span style="color:#e88">Error: ${err.message}</span>`;
  }
};

function parsePlayers(text) {
  if (!text.trim()) return [];
  return text.split('\n').map(line => {
    const [Name, Type, Line, Odds] = line.split(',').map(x => x.trim());
    return { Name, Type, Line: +Line, Odds: +Odds };
  });
}