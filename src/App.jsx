import { useState, useEffect, useRef, useCallback } from "react";

const API_KEY = import.meta.env.VITE_ODDS_API_KEY;
const API_BASE = "https://api.the-odds-api.com/v4";

const ALL_SPORTS = [
{ key: "basketball_nba",                      label: "NBA",              sport: "Baloncesto", active: true  },
{ key: "icehockey_nhl",                       label: "NHL Hockey",       sport: "Hockey",     active: false },
{ key: "soccer_epl",                          label: "Premier League",   sport: "Futbol",     active: false },
{ key: "soccer_spain_la_liga",                label: "La Liga",          sport: "Futbol",     active: false },
{ key: "soccer_germany_bundesliga",           label: "Bundesliga",       sport: "Futbol",     active: false },
{ key: "soccer_italy_serie_a",                label: "Serie A",          sport: "Futbol",     active: false },
{ key: "soccer_uefa_champs_league",           label: "Champions League", sport: "Futbol",     active: false },
{ key: "soccer_uefa_europa_league",           label: "Europa League",    sport: "Futbol",     active: false },
{ key: "soccer_usa_mls",                      label: "MLS",              sport: "Futbol",     active: false },
{ key: "soccer_brazil_campeonato",            label: "Brasil Serie A",   sport: "Futbol",     active: false },
{ key: "soccer_argentina_primera_division",   label: "Argentina",        sport: "Futbol",     active: false },
{ key: "soccer_mexico_ligamx",                label: "Liga MX",          sport: "Futbol",     active: false },
{ key: "soccer_chile_campeonato",             label: "Chile",            sport: "Futbol",     active: false },
{ key: "tennis_atp_indian_wells",             label: "ATP Indian Wells", sport: "Tenis",      active: false },
{ key: "tennis_wta_indian_wells",             label: "WTA Indian Wells", sport: "Tenis",      active: false },
{ key: "mma_mixed_martial_arts",              label: "MMA",              sport: "MMA",        active: false },
];

const BOOKMAKERS_CO = {
Rushbet:     { url: "https://www.rushbet.co",       color: "#e8000d", metodos: ["Nequi","Daviplata","Efecty","PSE"], retiro: "Nequi 2h",    minRetiro: "$20.000", app: true  },
Wplay:       { url: "https://www.wplay.co",         color: "#00a651", metodos: ["Nequi","PSE","Efecty","Bancolombia"], retiro: "24-72h",    minRetiro: "$10.000", app: true  },
Betsson:     { url: "https://www.betsson.com.co",   color: "#f5a623", metodos: ["Nequi","PSE","Daviplata"],          retiro: "Nequi 1-3d",  minRetiro: "$5.000",  app: true  },
Sportium:    { url: "https://www.sportium.com.co",  color: "#0055a5", metodos: ["PSE","Efecty","Nequi"],            retiro: "24-48h",      minRetiro: "$1.000",  app: true  },
Rivalo:      { url: "https://www.rivalo.co",        color: "#c0392b", metodos: ["PSE","Nequi","Efecty"],            retiro: "24-72h",      minRetiro: "$10.000", app: false },
Luckia:      { url: "https://www.luckia.co",        color: "#8e44ad", metodos: ["PSE","Nequi","Efecty"],            retiro: "24-48h",      minRetiro: "$5.000",  app: true  },
williamhill: { url: "https://www.williamhill.es",   color: "#004a9f", metodos: ["PSE","Transferencia"],             retiro: "2-5 dias",    minRetiro: "$10.000", app: true  },
unibet:      { url: "https://www.unibet.es",        color: "#147b45", metodos: ["PSE","Transferencia"],             retiro: "1-3 dias",    minRetiro: "$5.000",  app: true  },
betway:      { url: "https://www.betway.es",        color: "#00a950", metodos: ["PSE","Transferencia"],             retiro: "24-72h",      minRetiro: "$10.000", app: true  },
sport888:    { url: "https://www.888sport.es",      color: "#ff6600", metodos: ["PSE","Transferencia"],             retiro: "1-3 dias",    minRetiro: "$10.000", app: false },
betsson:     { url: "https://www.betsson.com.co",   color: "#f5a623", metodos: ["Nequi","PSE"],                    retiro: "1-3 dias",    minRetiro: "$5.000",  app: true  },
draftkings:  { url: "https://www.draftkings.com",   color: "#53d337", metodos: ["Transferencia"],                  retiro: "1-3 dias",    minRetiro: "$10.000", app: true  },
fanduel:     { url: "https://www.fanduel.com",      color: "#1493ff", metodos: ["Transferencia"],                  retiro: "1-3 dias",    minRetiro: "$10.000", app: true  },
betmgm:      { url: "https://www.betmgm.com",       color: "#c9a84c", metodos: ["Transferencia"],                  retiro: "1-3 dias",    minRetiro: "$10.000", app: true  },
bovada:      { url: "https://www.bovada.lv",        color: "#d4282a", metodos: ["Transferencia"],                  retiro: "1-3 dias",    minRetiro: "$10.000", app: false },
};

function getBM(key) {
return BOOKMAKERS_CO[key] || { url: "#", color: "#070808", metodos: [], retiro: "Variable", minRetiro: "Variable", app: false };
}

function getBestOdds(event) {
var isTwoWay = !Object.values(event.odds)[0].draw;
var outcomes = isTwoWay ? ["home","away"] : ["home","draw","away"];
var result = {};
outcomes.forEach(function(o) {
result[o] = { odd: 0, book: "" };
Object.entries(event.odds).forEach(function(entry) {
var book = entry[0]; var odds = entry[1];
if ((odds[o] || 0) > result[o].odd) result[o] = { odd: odds[o], book: book };
});
});
return result;
}

function calcArbitrage(bestOdds) {
var impliedProbs = Object.values(bestOdds).map(function(o) { return 1 / o.odd; });
var totalImplied = impliedProbs.reduce(function(a, b) { return a + b; }, 0);
var margin = (1 - totalImplied) * 100;
return { totalImplied: totalImplied, margin: margin, isSure: totalImplied < 1 };
}

function calcStakes(bestOdds, totalStake) {
var impliedProbs = Object.values(bestOdds).map(function(o) { return 1 / o.odd; });
var totalImplied = impliedProbs.reduce(function(a, b) { return a + b; }, 0);
var stakes = {};
Object.keys(bestOdds).forEach(function(k, i) {
stakes[k] = Math.round((impliedProbs[i] / totalImplied) * totalStake);
});
return stakes;
}

function playAlert() {
try {
var ctx = new (window.AudioContext || window.webkitAudioContext)();
[[880,0],[1100,0.15],[1320,0.3]].forEach(function(pair) {
var f = pair[0]; var t = pair[1];
var o = ctx.createOscillator(); var g = ctx.createGain();
o.connect(g); g.connect(ctx.destination);
o.frequency.value = f; o.type = "sine";
g.gain.setValueAtTime(0, ctx.currentTime+t);
g.gain.linearRampToValueAtTime(0.4, ctx.currentTime+t+0.01);
g.gain.linearRampToValueAtTime(0, ctx.currentTime+t+0.2);
o.start(ctx.currentTime+t); o.stop(ctx.currentTime+t+0.25);
});
} catch(e) {}
}

function parseApiEvents(apiData, sportInfo) {
var events = [];
if (!apiData || !Array.isArray(apiData)) return events;
apiData.forEach(function(game) {
if (!game.bookmakers || game.bookmakers.length < 2) return;
var odds = {};
game.bookmakers.forEach(function(bm) {
var market = bm.markets && bm.markets.find(function(m) { return m.key === "h2h"; });
if (!market) return;
var homeOdd = null; var awayOdd = null; var drawOdd = null;
market.outcomes.forEach(function(outcome) {
if (outcome.name === game.home_team) homeOdd = outcome.price;
else if (outcome.name === game.away_team) awayOdd = outcome.price;
else drawOdd = outcome.price;
});
if (homeOdd && awayOdd) {
var entry = { home: homeOdd, away: awayOdd };
if (drawOdd) entry.draw = drawOdd;
odds[bm.key] = entry;
}
});
if (Object.keys(odds).length < 2) return;
var d = new Date(game.commence_time);
var now = new Date();
var diffH = (d - now) / 3600000;
var timeStr;
if (diffH < 0) timeStr = "En curso";
else if (diffH < 24) timeStr = "Hoy " + d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
else timeStr = d.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" });
events.push({ id: game.id, sport: sportInfo.sport, league: sportInfo.label, home: game.home_team, away: game.away_team, time: timeStr, odds: odds });
});
return events;
}

function AlertToast(props) {
var alert = props.alert; var onDismiss = props.onDismiss;
var onOpenTabs = props.onOpenTabs; var stake = props.stake;
var [progress, setProgress] = useState(100);
var DURATION = 30000;
useEffect(function() {
var start = Date.now();
var iv = setInterval(function() {
var p = Math.max(0, 100 - ((Date.now()-start)/DURATION)*100);
setProgress(p);
if (p === 0) { clearInterval(iv); onDismiss(alert.id); }
}, 200);
return function() { clearInterval(iv); };
}, []);
var bestOdds = getBestOdds(alert.event);
var stakes = calcStakes(bestOdds, stake);
var labels = { home: alert.event.home, draw: "Empate", away: alert.event.away };
var s = Math.ceil((progress/100)*(DURATION/1000));
var profit = Math.round(stake * Math.abs(alert.margin) / 100);
return (
<div style={{ background: "linear-gradient(135deg,#001a0f,#001530)", border: "1px solid #00e5a060", borderLeft: "4px solid #00e5a0", borderRadius: 14, padding: "14px 16px", marginBottom: 10, boxShadow: "0 8px 40px rgba(0,229,160,.15)", position: "relative", overflow: "hidden" }}>
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
<div style={{ display: "flex", gap: 6, alignItems: "center" }}>
<span style={{ background: "#00e5a0", color: "#001a0f", fontSize: 9, fontWeight: 900, padding: "2px 7px", borderRadius: 5 }}>SUREBET REAL</span>
<span style={{ fontSize: 10, color: "#4aaa80" }}>{alert.event.league}</span>
</div>
<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
<span style={{ fontSize: 11, color: "#2a6a4a", fontFamily: "monospace" }}>{s}s</span>
<button onClick={function() { onDismiss(alert.id); }} style={{ background: "transparent", border: "none", color: "#2a5a3a", cursor: "pointer", fontSize: 15 }}>X</button>
</div>
</div>
<div style={{ fontSize: 15, fontWeight: 700, color: "#e8f4ff", marginBottom: 10 }}>{alert.event.home} vs {alert.event.away}</div>
<div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
{Object.entries(bestOdds).map(function(entry) {
var outcome = entry[0]; var data = entry[1];
return (
<div key={outcome} style={{ background: "rgba(0,229,160,.08)", border: "1px solid #00e5a020", borderRadius: 7, padding: "6px 10px", flex: 1, minWidth: 75 }}>
<div style={{ fontSize: 9, color: "#00a070", textTransform: "uppercase" }}>{labels[outcome]||outcome}</div>
<div style={{ fontSize: 13, fontWeight: 700, color: "#00e5a0", fontFamily: "monospace" }}>${(stakes[outcome]||0).toLocaleString("es-CO")}</div>
<div style={{ fontSize: 9, color: "#005535" }}>{data.odd.toFixed(2)} - {data.book}</div>
</div>
);
})}
<div style={{ background: "rgba(0,229,160,.12)", border: "1px solid #00e5a030", borderRadius: 7, padding: "6px 10px", flex: 1, minWidth: 75 }}>
<div style={{ fontSize: 9, color: "#00a070", textTransform: "uppercase" }}>Ganancia</div>
<div style={{ fontSize: 13, fontWeight: 700, color: "#00e5a0", fontFamily: "monospace" }}>${profit.toLocaleString("es-CO")}</div>
<div style={{ fontSize: 9, color: "#005535" }}>{Math.abs(alert.margin).toFixed(2)}%</div>
</div>
</div>
<button onClick={function() { onOpenTabs(alert.event, bestOdds); }} style={{ width: "100%", background: "#00e5a0", color: "#001a0f", border: "none", borderRadius: 8, padding: "10px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
Abrir casas ahora
</button>
<div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "#001a10" }}>
<div style={{ height: "100%", background: "#00e5a0", width: progress + "%", transition: "width .2s linear" }} />
</div>
</div>
);
}

function OddsTable(props) {
var event = props.event;
var isTwoWay = !Object.values(event.odds)[0].draw;
var outcomes = isTwoWay ? ["home","away"] : ["home","draw","away"];
var labels = { home: event.home, draw: "Empate", away: event.away };
var maxOdds = {};
outcomes.forEach(function(o) { maxOdds[o] = Math.max.apply(null, Object.values(event.odds).map(function(b) { return b[o]||0; })); });
return (
<div style={{ overflowX: "auto", marginTop: 12 }}>
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
<thead>
<tr>
<th style={{ padding: "6px 10px", textAlign: "left", color: "#2a4a6a", fontSize: 10, fontWeight: 700, borderBottom: "1px solid #0a1828" }}>Casa</th>
{outcomes.map(function(o) { return <th key={o} style={{ padding: "6px 10px", textAlign: "left", color: "#2a4a6a", fontSize: 10, fontWeight: 700, borderBottom: "1px solid #0a1828" }}>{labels[o]}</th>; })}
</tr>
</thead>
<tbody>
{Object.entries(event.odds).map(function(entry) {
var book = entry[0]; var odds = entry[1]; var bm = getBM(book);
return (
<tr key={book} style={{ borderBottom: "1px solid #080f18" }}>
<td style={{ padding: "6px 10px" }}>
<a href={bm.url} target="_blank" rel="noreferrer" style={{ color: bm.color, textDecoration: "none", fontWeight: 700, fontSize: 12 }} onClick={function(e) { e.stopPropagation(); }}>{book}</a>
</td>
{outcomes.map(function(o) {
var val = odds[o]; var isMax = val === maxOdds[o];
return <td key={o} style={{ padding: "6px 10px", color: isMax ? "#00e5a0" : "#6a8aaa", fontWeight: isMax ? 700 : 400, background: isMax ? "rgba(0,229,160,.05)" : "transparent" }}>{val ? val.toFixed(2) : "-"}</td>;
})}
</tr>
);
})}
</tbody>
</table>
</div>
);
}

function EventCard(props) {
var event = props.event; var stake = props.stake;
var expanded = props.expanded; var onToggle = props.onToggle; var onOpenTabs = props.onOpenTabs;
var bestOdds = getBestOdds(event);
var arb = calcArbitrage(bestOdds);
var margin = arb.margin; var isSure = arb.isSure;
var stakes = calcStakes(bestOdds, stake);
var labels = { home: event.home, draw: "Empate", away: event.away };
var profit = isSure ? Math.round(stake * Math.abs(margin) / 100) : null;
var uniqueBooks = [];
Object.values(bestOdds).forEach(function(o) { if (uniqueBooks.indexOf(o.book) === -1) uniqueBooks.push(o.book); });
return (
<div onClick={onToggle} style={{ background: isSure ? "linear-gradient(135deg,#071812,#0a1624)" : "#090f1c", border: isSure ? "1px solid #00e5a025" : "1px solid #0c1a28", borderLeft: isSure ? "3px solid #00e5a0" : "3px solid #1a3050", borderRadius: 12, padding: "14px 16px", marginBottom: 8, cursor: "pointer", position: "relative" }}>
{isSure && <div style={{ position: "absolute", top: 0, right: 0, background: "#00e5a0", color: "#001a0f", fontSize: 9, fontWeight: 900, padding: "3px 10px", borderBottomLeftRadius: 8 }}>SUREBET</div>}
<div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
<div>
<div style={{ fontSize: 10, color: "#2a5a7a", marginBottom: 3 }}>{event.sport} - {event.league} - {event.time}</div>
<div style={{ fontSize: 15, fontWeight: 700, color: "#ddeeff" }}>{event.home} vs {event.away}</div>
</div>
<div style={{ textAlign: "right" }}>
<div style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", color: isSure ? "#00e5a0" : margin < -15 ? "#ff6b6b" : "#ffd166" }}>{margin > 0 ? "+" : ""}{margin.toFixed(2)}%</div>
<div style={{ fontSize: 9, color: "#2a4a6a" }}>{isSure ? "ganancia garantizada" : "margen casa"}</div>
</div>
</div>
<div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
{Object.entries(bestOdds).map(function(entry) {
var outcome = entry[0]; var data = entry[1]; var bm = getBM(data.book);
return (
<div key={outcome} style={{ background: "#060e1a", border: "1px solid #0c1a28", borderRadius: 7, padding: "6px 10px", flex: 1, minWidth: 80 }}>
<div style={{ fontSize: 9, color: "#2a5a7a", textTransform: "uppercase", marginBottom: 2 }}>{labels[outcome]||outcome}</div>
<div style={{ fontSize: 16, fontWeight: 700, color: "#7eb8f7", fontFamily: "monospace" }}>{data.odd.toFixed(2)}</div>
<div style={{ fontSize: 9, color: bm.color, fontWeight: 700, marginTop: 2 }}>{data.book}</div>
</div>
);
})}
</div>
{expanded && (
<div style={{ borderTop: "1px solid #0c1a28", paddingTop: 14, marginTop: 12 }}>
{isSure && (
<div>
<div style={{ fontSize: 10, color: "#2a5a7a", textTransform: "uppercase", marginBottom: 8 }}>Apuesta total: ${stake.toLocaleString("es-CO")} COP</div>
<div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
{Object.entries(stakes).map(function(entry) {
var outcome = entry[0]; var s = entry[1];
return (
<div key={outcome} style={{ background: "rgba(0,229,160,.06)", border: "1px solid #00e5a020", borderRadius: 7, padding: "8px 10px", flex: 1, minWidth: 80 }}>
<div style={{ fontSize: 9, color: "#00a070", textTransform: "uppercase" }}>{labels[outcome]||outcome}</div>
<div style={{ fontSize: 14, fontWeight: 700, color: "#00e5a0", fontFamily: "monospace" }}>${s.toLocaleString("es-CO")}</div>
<div style={{ fontSize: 9, color: "#004a30" }}>en {bestOdds[outcome].book}</div>
</div>
);
})}
<div style={{ background: "rgba(0,229,160,.1)", border: "1px solid #00e5a030", borderRadius: 7, padding: "8px 10px", flex: 1, minWidth: 80 }}>
<div style={{ fontSize: 9, color: "#00a070", textTransform: "uppercase" }}>Ganancia</div>
<div style={{ fontSize: 14, fontWeight: 700, color: "#00e5a0", fontFamily: "monospace" }}>${profit.toLocaleString("es-CO")}</div>
<div style={{ fontSize: 9, color: "#004a30" }}>garantizada</div>
</div>
</div>
<button onClick={function(e) { e.stopPropagation(); onOpenTabs(event, bestOdds); }} style={{ width: "100%", background: "#00e5a0", color: "#001a0f", border: "none", borderRadius: 8, padding: "11px", fontWeight: 800, fontSize: 13, cursor: "pointer", marginBottom: 12 }}>
Abrir {uniqueBooks.length} casas de apuesta
</button>
</div>
)}
<div style={{ fontSize: 10, color: "#2a5a7a", textTransform: "uppercase", marginBottom: 6 }}>Comparativa de cuotas</div>
<OddsTable event={event} />
</div>
)}
<div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "#1a3050" }}>{expanded ? "ocultar" : "ver detalle"}</div>
</div>
);
}

function SportToggle(props) {
var sport = props.sport; var active = props.active; var onChange = props.onChange;
return (
<div onClick={function() { onChange(sport.key); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #080f18", cursor: "pointer" }}>
<div>
<span style={{ color: active ? "#e8f4ff" : "#2a4a6a", fontWeight: active ? 600 : 400, fontSize: 13 }}>{sport.label}</span>
<span style={{ color: "#1a3a5a", fontSize: 10, marginLeft: 8 }}>{sport.sport}</span>
</div>
<div style={{ width: 36, height: 20, borderRadius: 10, background: active ? "#00e5a0" : "#0e1e30", position: "relative", transition: "background .2s", flexShrink: 0 }}>
<div style={{ position: "absolute", top: 2, left: active ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: active ? "#001a0f" : "#2a4a6a", transition: "left .2s" }} />
</div>
</div>
);
}

function BookmakerCard(props) {
var name = props.name; var bm = BOOKMAKERS_CO[name];
if (!bm) return null;
return (
<div style={{ background: "#090f1c", border: "1px solid #0c1a28", borderLeft: "3px solid " + bm.color, borderRadius: 10, padding: "12px 14px" }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
<div style={{ fontSize: 15, fontWeight: 700, color: bm.color }}>{name}</div>
<div style={{ display: "flex", gap: 4 }}>
{bm.app && <span style={{ background: "#0a2a1a", color: "#00c887", fontSize: 9, padding: "2px 6px", borderRadius: 4 }}>APP</span>}
<span style={{ background: "#0a1a2a", color: "#4a8aba", fontSize: 9, padding: "2px 6px", borderRadius: 4 }}>Coljuegos</span>
</div>
</div>
<div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
{bm.metodos.map(function(m) { return <span key={m} style={{ background: "#0a1828", border: "1px solid #1a2a3a", borderRadius: 5, padding: "3px 8px", fontSize: 10, color: "#8abaaa" }}>{m}</span>; })}
</div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<div style={{ fontSize: 10, color: "#2a5a7a" }}>Retiro: {bm.retiro} - Min: {bm.minRetiro}</div>
<a href={bm.url} target="_blank" rel="noreferrer" style={{ background: bm.color, color: "#fff", borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>Abrir</a>
</div>
</div>
);
}

export default function SurebetRadarCO() {
var [sports, setSports] = useState(ALL_SPORTS);
var [events, setEvents] = useState([]);
var [loading, setLoading] = useState(true);
var [error, setError] = useState(null);
var [requestsLeft, setRequestsLeft] = useState(null);
var [stake, setStake] = useState(50000);
var [expandedId, setExpandedId] = useState(null);
var [alerts, setAlerts] = useState([]);
var [history, setHistory] = useState([]);
var [tab, setTab] = useState("live");
var [lastScan, setLastScan] = useState(null);
var [scanning, setScanning] = useState(false);
var [soundOn, setSoundOn] = useState(true);
var [filterSport, setFilterSport] = useState("Todos");
var prevSurebets = useRef(new Set());

var activeSports = sports.filter(function(s) { return s.active; });
var peticionesPorScan = activeSports.length;

var toggleSport = function(key) {
setSports(function(prev) {
return prev.map(function(s) { return s.key === key ? Object.assign({}, s, { active: !s.active }) : s; });
});
};

var openBookmakerTabs = useCallback(function(event, bestOdds) {
var books = [];
Object.values(bestOdds).forEach(function(o) { if (books.indexOf(o.book) === -1) books.push(o.book); });
books.forEach(function(book, i) { setTimeout(function() { window.open(getBM(book).url, "*sb*" + book); }, i * 400); });
}, []);

var triggerAlert = useCallback(function(event, margin) {
if (soundOn) playAlert();
setAlerts(function(prev) { return [{ id: Date.now(), event: event, margin: margin }].concat(prev).slice(0, 4); });
setHistory(function(prev) {
return [{ id: Date.now(), time: new Date().toLocaleTimeString(), match: event.home + " vs " + event.away, league: event.league, margin: margin, profit: Math.round(stake * Math.abs(margin) / 100) }].concat(prev).slice(0, 50);
});
}, [soundOn, stake]);

var fetchOdds = useCallback(function(currentSports) {
var active = (currentSports || sports).filter(function(s) { return s.active; });
if (!API_KEY) { setError("Falta VITE_ODDS_API_KEY en Vercel Settings"); setLoading(false); return; }
if (active.length === 0) { setEvents([]); setLoading(false); return; }
setScanning(true);
var allEvents = [];
var pending = active.length;
active.forEach(function(sportInfo) {
var url = API_BASE + "/sports/" + sportInfo.key + "/odds?apiKey=" + API_KEY + "&regions=eu,us&markets=h2h&oddsFormat=decimal";
fetch(url)
.then(function(res) {
var remaining = res.headers.get("x-requests-remaining");
if (remaining) setRequestsLeft(parseInt(remaining));
if (!res.ok) throw new Error("Error " + res.status);
return res.json();
})
.then(function(data) { allEvents = allEvents.concat(parseApiEvents(data, sportInfo)); })
.catch(function(err) { console.warn("Error " + sportInfo.key + ":", err.message); })
.finally(function() {
pending;
if (pending === 0) {
setEvents(function() {
allEvents.forEach(function(e) {
var best = getBestOdds(e);
var result = calcArbitrage(best);
if (result.isSure && !prevSurebets.current.has(e.id)) { prevSurebets.current.add(e.id); triggerAlert(e, result.margin); }
else if (!result.isSure) prevSurebets.current.delete(e.id);
});
return allEvents;
});
setLoading(false); setScanning(false); setLastScan(new Date()); setError(null);
}
});
});
}, [sports, triggerAlert]);

useEffect(function() { fetchOdds(ALL_SPORTS.filter(function(s) { return s.active; })); }, []);

useEffect(function() {
var iv = setInterval(function() { fetchOdds(); }, 60000);
return function() { clearInterval(iv); };
}, [fetchOdds]);

var sportFilters = ["Todos"].concat(Array.from(new Set(activeSports.map(function(s) { return s.sport; }))));
var filtered = events
.filter(function(e) { return filterSport === "Todos" || e.sport === filterSport; })
.sort(function(a, b) { return calcArbitrage(getBestOdds(b)).margin - calcArbitrage(getBestOdds(a)).margin; });

var surebetCount = events.filter(function(e) { return calcArbitrage(getBestOdds(e)).isSure; }).length;
var totalProfit = history.reduce(function(a, h) { return a + h.profit; }, 0);
var horasDisponibles = peticionesPorScan > 0 ? (Math.floor(500 / peticionesPorScan) / 60).toFixed(1) : "-";

return (
<div style={{ minHeight: "100vh", background: "#060c16", fontFamily: "sans-serif", color: "#c8d8e8" }}>
{alerts.length > 0 && (
<div style={{ position: "fixed", top: 12, right: 12, zIndex: 300, width: 330, maxWidth: "calc(100vw - 24px)" }}>
{alerts.map(function(a) {
return <AlertToast key={a.id} alert={a} stake={stake} onDismiss={function(id) { setAlerts(function(p) { return p.filter(function(x) { return x.id !== id; }); }); }} onOpenTabs={openBookmakerTabs} />;
})}
</div>
)}

```
  <div style={{ background: "#060c16", borderBottom: "1px solid #0a1628", padding: "14px 16px", position: "sticky", top: 0, zIndex: 100 }}>
    <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#e8f4ff" }}>SureBet<span style={{ color: "#00e5a0" }}>Radar</span> CO</div>
        <div style={{ fontSize: 9, color: "#1a4060", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: scanning ? "#ffd166" : "#00e5a0", display: "inline-block" }} />
          {scanning ? "actualizando..." : lastScan ? lastScan.toLocaleTimeString() : "cargando..."}
          {requestsLeft !== null && <span style={{ marginLeft: 6 }}>- {requestsLeft} restantes</span>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {surebetCount > 0 && (
          <div style={{ background: "rgba(0,229,160,.1)", border: "1px solid #00e5a030", borderRadius: 7, padding: "6px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#00e5a0", fontFamily: "monospace" }}>{surebetCount}</div>
            <div style={{ fontSize: 8, color: "#006644" }}>surebets</div>
          </div>
        )}
        {totalProfit > 0 && (
          <div style={{ background: "#080f18", border: "1px solid #0a1828", borderRadius: 7, padding: "6px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#ffd166", fontFamily: "monospace" }}>${totalProfit.toLocaleString("es-CO")}</div>
            <div style={{ fontSize: 8, color: "#3a3000" }}>COP detectado</div>
          </div>
        )}
        <button onClick={function() { fetchOdds(); }} style={{ background: "#0e2a4a", border: "1px solid #2a6aaa", borderRadius: 7, padding: "8px 12px", color: "#7eb8f7", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Actualizar</button>
        <button onClick={function() { setSoundOn(function(s) { return !s; }); }} style={{ background: "transparent", border: "1px solid #0a1828", borderRadius: 7, padding: "8px 12px", color: soundOn ? "#00e5a0" : "#2a4a6a", fontSize: 13, cursor: "pointer" }}>{soundOn ? "ON" : "OFF"}</button>
      </div>
    </div>
  </div>

  <div style={{ maxWidth: 860, margin: "0 auto", padding: "14px 12px" }}>
    <div style={{ display: "flex", gap: 2, borderBottom: "1px solid #0a1628", marginBottom: 16 }}>
      {[{ key: "live", label: "En vivo" }, { key: "deportes", label: "Deportes" }, { key: "casas", label: "Casas CO" }, { key: "history", label: "Historial (" + history.length + ")" }].map(function(item) {
        return <button key={item.key} onClick={function() { setTab(item.key); }} style={{ background: "transparent", border: "none", borderBottom: tab === item.key ? "2px solid #00e5a0" : "2px solid transparent", color: tab === item.key ? "#00e5a0" : "#2a5a7a", padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: -1 }}>{item.label}</button>;
      })}
    </div>

    {tab === "live" && (
      <div>
        {error && <div style={{ background: "rgba(255,100,100,.1)", border: "1px solid #ff6b6b40", borderRadius: 8, padding: "12px 16px", marginBottom: 14, color: "#ff8888", fontSize: 12 }}>Error: {error}</div>}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#080f18", border: "1px solid #0a1828", borderRadius: 7, padding: "7px 12px" }}>
            <span style={{ fontSize: 10, color: "#2a5a7a" }}>Stake: $</span>
            <input type="number" value={stake} onChange={function(e) { setStake(Math.max(5000, parseInt(e.target.value)||5000)); }} onClick={function(e) { e.stopPropagation(); }} style={{ background: "transparent", border: "none", outline: "none", color: "#e8f4ff", fontWeight: 700, width: 80, fontSize: 14, fontFamily: "monospace" }} />
            <span style={{ fontSize: 10, color: "#2a5a7a" }}>COP</span>
          </div>
          {sportFilters.map(function(s) {
            return <button key={s} onClick={function() { setFilterSport(s); }} style={{ background: filterSport === s ? "#0e2a4a" : "transparent", border: filterSport === s ? "1px solid #2a6aaa" : "1px solid #0a1828", borderRadius: 7, padding: "7px 11px", color: filterSport === s ? "#7eb8f7" : "#2a4a6a", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>{s}</button>;
          })}
        </div>
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#2a5a7a" }}>
            <div style={{ marginBottom: 12, fontSize: 24 }}>...</div>
            <div>Cargando cuotas reales...</div>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "50px 0", color: "#2a5a7a" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>-</div>
            <div style={{ marginBottom: 6 }}>No hay eventos disponibles ahora</div>
            <div style={{ fontSize: 11, color: "#1a3a5a" }}>Activa mas deportes en la pestana Deportes</div>
            <button onClick={function() { setTab("deportes"); }} style={{ marginTop: 14, background: "#0e2a4a", border: "1px solid #2a6aaa", borderRadius: 7, padding: "8px 16px", color: "#7eb8f7", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Ir a Deportes</button>
          </div>
        )}
        {!loading && filtered.map(function(e) {
          return <EventCard key={e.id} event={e} stake={stake} expanded={expandedId === e.id} onToggle={function() { setExpandedId(function(id) { return id === e.id ? null : e.id; }); }} onOpenTabs={openBookmakerTabs} />;
        })}
      </div>
    )}

    {tab === "deportes" && (
      <div>
        <div style={{ background: "#080f18", border: "1px solid #0a1828", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #0a1828", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, color: "#c8d8e8", fontWeight: 600 }}>Activar deportes</div>
            <div style={{ fontSize: 11, color: peticionesPorScan > 0 ? "#ffd166" : "#2a4a6a" }}>{peticionesPorScan} peticion{peticionesPorScan !== 1 ? "es" : ""}/scan</div>
          </div>
          {sports.map(function(s) { return <SportToggle key={s.key} sport={s} active={s.active} onChange={toggleSport} />; })}
        </div>
        <div style={{ background: "rgba(255,209,102,.05)", border: "1px solid #ffd16620", borderRadius: 10, padding: "12px 14px", fontSize: 11, color: "#8a7a40", lineHeight: 1.7 }}>
          {peticionesPorScan === 0
            ? "Activa al menos un deporte para empezar a detectar surebets."
            : "Con " + peticionesPorScan + " deporte" + (peticionesPorScan !== 1 ? "s" : "") + " activo" + (peticionesPorScan !== 1 ? "s" : "") + " tienes aprox. " + horasDisponibles + " horas de uso con el plan gratuito (500 peticiones/mes)."
          }
        </div>
        <button onClick={function() { fetchOdds(); setTab("live"); }} style={{ marginTop: 12, width: "100%", background: "#00e5a0", color: "#001a0f", border: "none", borderRadius: 8, padding: "12px", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
          Aplicar y ver eventos
        </button>
      </div>
    )}

    {tab === "casas" && (
      <div>
        <div style={{ fontSize: 11, color: "#2a5a7a", marginBottom: 14, lineHeight: 1.6 }}>Todas con licencia Coljuegos - Deposito y retiro en pesos - Registro con cedula colombiana</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {["Rushbet","Wplay","Betsson","Sportium","Rivalo","Luckia"].map(function(name) { return <BookmakerCard key={name} name={name} />; })}
        </div>
      </div>
    )}

    {tab === "history" && (
      <div style={{ background: "#080f18", border: "1px solid #0a1828", borderRadius: 10, overflow: "hidden" }}>
        {history.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#1a3a5a" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>--</div>
            <div>Aun no se han detectado surebets</div>
          </div>
        ) : history.map(function(h) {
          return (
            <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #080f18", flexWrap: "wrap", gap: 6, fontSize: 12 }}>
              <div>
                <span style={{ color: "#2a5a7a", marginRight: 8 }}>{h.time}</span>
                <span style={{ color: "#c8d8e8", fontWeight: 600 }}>{h.match}</span>
                <span style={{ color: "#1a3a5a", marginLeft: 6, fontSize: 10 }}>{h.league}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ color: "#00e5a0", fontFamily: "monospace", fontWeight: 700 }}>+{h.margin.toFixed(2)}%</span>
                <span style={{ color: "#4a7a5a", fontFamily: "monospace" }}>${h.profit.toLocaleString("es-CO")}</span>
              </div>
            </div>
          );
        })}
      </div>
    )}

    <div style={{ textAlign: "center", padding: "20px 0 4px", fontSize: 10, color: "#0e1e2e" }}>
      Cuotas reales via The Odds API - Apuesta responsablemente - +18 - Coljuegos
    </div>
  </div>
</div>

);
}