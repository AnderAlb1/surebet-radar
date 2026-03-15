import { useState, useEffect, useRef, useCallback } from "react";

// ─── CASAS DE APUESTAS COLOMBIANAS (Licencia Coljuegos) ──────────────────────
const BOOKMAKERS_CO = {
"Rushbet": {
url: "https://www.rushbet.co",
color: "#e8000d",
metodos: ["Nequi", "Daviplata", "Efecty", "PSE"],
retiro: "Nequi directo ~2h",
minRetiro: "$20.000",
app: true,
nota: "Mejor retiro con Nequi, aprobación en ~2 horas"
},
"Wplay": {
url: "https://www.wplay.co",
color: "#00a651",
metodos: ["Nequi", "PSE", "Efecty", "Bancolombia"],
retiro: "Transferencia 24-72h",
minRetiro: "$10.000",
app: true,
nota: "Mejor bono bienvenida: $200.000 COP"
},
"Betsson": {
url: "https://www.betsson.com.co",
color: "#f5a623",
metodos: ["Nequi", "PSE", "Daviplata", "Efecty"],
retiro: "Nequi 1-3 días hábiles",
minRetiro: "$5.000",
app: true,
nota: "+30 deportes, streaming en vivo incluido"
},
"Sportium": {
url: "https://www.sportium.com.co",
color: "#0055a5",
metodos: ["PSE", "Efecty", "Nequi", "Puntos físicos"],
retiro: "Transferencia 24-48h",
minRetiro: "$1.000",
app: true,
nota: "Excelente para apuestas en vivo"
},
"Rivalo": {
url: "https://www.rivalo.co",
color: "#c0392b",
metodos: ["PSE", "Nequi", "AstroPay", "Efecty"],
retiro: "Transferencia 24-72h",
minRetiro: "$10.000",
app: false,
nota: "Buenas cuotas en fútbol colombiano"
},
"Luckia": {
url: "https://www.luckia.co",
color: "#8e44ad",
metodos: ["PSE", "Nequi", "Efecty", "DaviPlata"],
retiro: "Transferencia 24-48h",
minRetiro: "$5.000",
app: true,
nota: "Especialista en mercado colombiano"
},
};

// ─── EVENTOS SIMULADOS ────────────────────────────────────────────────────────
const BASE_EVENTS = [
{
id: 1, sport: "⚽ Fútbol", league: "Liga BetPlay Dimayor",
home: "Atlético Nacional", away: "Independiente Medellín", time: "Hoy 20:00",
odds: {
"Rushbet":  { home: 2.10, draw: 3.20, away: 3.40 },
"Wplay":    { home: 2.00, draw: 3.35, away: 3.60 },
"Betsson":  { home: 2.15, draw: 3.10, away: 3.30 },
"Sportium": { home: 1.95, draw: 3.40, away: 3.70 },
"Rivalo":   { home: 2.20, draw: 3.25, away: 3.25 },
"Luckia":   { home: 2.05, draw: 3.50, away: 3.45 },
}
},
{
id: 2, sport: "⚽ Fútbol", league: "Liga BetPlay Dimayor",
home: "Millonarios", away: "Santa Fe", time: "Mañana 18:00",
odds: {
"Rushbet":  { home: 2.30, draw: 3.10, away: 2.90 },
"Wplay":    { home: 2.20, draw: 3.20, away: 3.10 },
"Betsson":  { home: 2.40, draw: 3.00, away: 2.80 },
"Sportium": { home: 2.15, draw: 3.30, away: 3.20 },
"Luckia":   { home: 2.35, draw: 3.05, away: 2.95 },
}
},
{
id: 3, sport: "⚽ Fútbol", league: "Copa Libertadores",
home: "América de Cali", away: "Flamengo", time: "Hoy 21:30",
odds: {
"Rushbet":  { home: 4.00, draw: 3.50, away: 1.80 },
"Wplay":    { home: 4.20, draw: 3.40, away: 1.75 },
"Betsson":  { home: 3.90, draw: 3.60, away: 1.85 },
"Sportium": { home: 4.10, draw: 3.45, away: 1.78 },
"Rivalo":   { home: 3.80, draw: 3.70, away: 1.90 },
}
},
{
id: 4, sport: "🎾 Tenis", league: "ATP Masters",
home: "Galán", away: "Djokovic", time: "Mañana 14:00",
odds: {
"Rushbet":  { home: 3.50, away: 1.30 },
"Wplay":    { home: 3.70, away: 1.25 },
"Betsson":  { home: 3.40, away: 1.35 },
"Sportium": { home: 3.60, away: 1.28 },
"Luckia":   { home: 3.30, away: 1.40 },
}
},
{
id: 5, sport: "⚽ Fútbol", league: "Copa Sudamericana",
home: "Junior", away: "Boca Juniors", time: "Mañana 19:15",
odds: {
"Rushbet":  { home: 3.10, draw: 3.20, away: 2.10 },
"Wplay":    { home: 3.30, draw: 3.10, away: 2.00 },
"Betsson":  { home: 3.00, draw: 3.30, away: 2.20 },
"Rivalo":   { home: 3.20, draw: 3.15, away: 2.05 },
"Luckia":   { home: 3.40, draw: 3.00, away: 1.95 },
}
},
{
id: 6, sport: "🏀 Baloncesto", league: "NBA",
home: "Miami Heat", away: "Toronto Raptors", time: "Hoy 01:00",
odds: {
"Rushbet":  { home: 1.85, away: 2.00 },
"Wplay":    { home: 1.95, away: 1.90 },
"Betsson":  { home: 1.80, away: 2.05 },
"Sportium": { home: 2.00, away: 1.85 },
}
},
{
id: 7, sport: "⚽ Fútbol", league: "Liga BetPlay Dimayor",
home: "Deportivo Cali", away: "Peñarol Bucaramanga", time: "Dom 16:00",
odds: {
"Rushbet":  { home: 1.90, draw: 3.30, away: 3.80 },
"Wplay":    { home: 2.00, draw: 3.20, away: 3.60 },
"Betsson":  { home: 1.85, draw: 3.40, away: 3.90 },
"Sportium": { home: 1.95, draw: 3.25, away: 3.70 },
"Luckia":   { home: 2.05, draw: 3.15, away: 3.55 },
}
},
];

// ─── MOTOR DE CÁLCULO ─────────────────────────────────────────────────────────
function getBestOdds(event) {
const isTwoWay = !Object.values(event.odds)[0].draw;
const outcomes = isTwoWay ? ["home", "away"] : ["home", "draw", "away"];
const result = {};
outcomes.forEach(o => {
result[o] = { odd: 0, book: "" };
for (const [book, odds] of Object.entries(event.odds)) {
if ((odds[o] || 0) > result[o].odd) result[o] = { odd: odds[o], book };
}
});
return result;
}

function calcArbitrage(bestOdds) {
const impliedProbs = Object.values(bestOdds).map(o => 1 / o.odd);
const totalImplied = impliedProbs.reduce((a, b) => a + b, 0);
const margin = (1 - totalImplied) * 100;
return { totalImplied, margin, isSure: totalImplied < 1 };
}

function calcStakes(bestOdds, totalStake) {
const impliedProbs = Object.values(bestOdds).map(o => 1 / o.odd);
const totalImplied = impliedProbs.reduce((a, b) => a + b, 0);
const stakes = {};
Object.keys(bestOdds).forEach((k, i) => {
stakes[k] = +((impliedProbs[i] / totalImplied) * totalStake).toFixed(0);
});
return stakes;
}

function playAlert() {
try {
const ctx = new (window.AudioContext || window.webkitAudioContext)();
[[880,0],[1100,.15],[1320,.3]].forEach(([f,t]) => {
const o = ctx.createOscillator(), g = ctx.createGain();
o.connect(g); g.connect(ctx.destination);
o.frequency.value = f; o.type = "sine";
g.gain.setValueAtTime(0, ctx.currentTime+t);
g.gain.linearRampToValueAtTime(.4, ctx.currentTime+t+.01);
g.gain.linearRampToValueAtTime(0, ctx.currentTime+t+.2);
o.start(ctx.currentTime+t); o.stop(ctx.currentTime+t+.25);
});
} catch(_) {}
}

// ─── COMPONENTES ──────────────────────────────────────────────────────────────

function BookmakerBadge({ name }) {
const bm = BOOKMAKERS_CO[name] || {};
return (
<span style={{
display: "inline-flex", alignItems: "center", gap: 4,
background: `${bm.color || "#2a4a6a"}22`,
border: `1px solid ${bm.color || "#2a4a6a"}55`,
borderRadius: 5, padding: "2px 7px",
fontSize: 10, fontWeight: 700, color: bm.color || "#7eb8f7",
}}>{name}</span>
);
}

function AlertToast({ alert, onDismiss, onOpenTabs, stake }) {
const [progress, setProgress] = useState(100);
const DURATION = 30000;
useEffect(() => {
const start = Date.now();
const iv = setInterval(() => {
const p = Math.max(0, 100 - ((Date.now()-start)/DURATION)*100);
setProgress(p);
if (p === 0) { clearInterval(iv); onDismiss(alert.id); }
}, 100);
return () => clearInterval(iv);
}, []);
const bestOdds = getBestOdds(alert.event);
const stakes = calcStakes(bestOdds, stake);
const labels = { home: alert.event.home, draw: "Empate", away: alert.event.away };
const s = Math.ceil((progress/100)*(DURATION/1000));

return (
<div style={{
background: "linear-gradient(135deg,#001a0f,#001530)",
border: "1px solid #00e5a060", borderLeft: "4px solid #00e5a0",
borderRadius: 14, padding: "14px 16px", marginBottom: 10,
boxShadow: "0 8px 40px rgba(0,229,160,.15)",
animation: "slideIn .3s cubic-bezier(.34,1.56,.64,1)",
position: "relative", overflow: "hidden",
}}>
<div style={{ display:"flex", justifyContent:"space-between", marginBottom: 8 }}>
<div style={{ display:"flex", gap: 6, alignItems:"center" }}>
<span style={{ background:"#00e5a0", color:"#001a0f", fontSize:9, fontWeight:900, padding:"2px 7px", borderRadius:5 }}>
✦ SUREBET
</span>
<span style={{ fontSize:10, color:"#4aaa80" }}>{alert.event.league}</span>
</div>
<div style={{ display:"flex", gap:8, alignItems:"center" }}>
<span style={{ fontSize:11, color:"#2a6a4a", fontFamily:"monospace" }}>⏱{s}s</span>
<button onClick={()=>onDismiss(alert.id)} style={{ background:"transparent", border:"none", color:"#2a5a3a", cursor:"pointer", fontSize:15 }}>✕</button>
</div>
</div>
<div style={{ fontSize:15, fontWeight:700, color:"#e8f4ff", marginBottom:10, fontFamily:"‘DM Serif Display’,serif" }}>
{alert.event.home} vs {alert.event.away}
</div>
<div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
{Object.entries(bestOdds).map(([outcome,{odd,book}]) => (
<div key={outcome} style={{ background:"rgba(0,229,160,.08)", border:"1px solid #00e5a020", borderRadius:7, padding:"6px 10px", flex:1, minWidth:75 }}>
<div style={{ fontSize:9, color:"#00a070", textTransform:"uppercase" }}>{labels[outcome]||outcome}</div>
<div style={{ fontSize:13, fontWeight:700, color:"#00e5a0", fontFamily:"monospace" }}>{stakes[outcome]?.toLocaleString("es-CO")}$</div>
<div style={{ fontSize:9, color:"#005535" }}>{odd.toFixed(2)} · {book}</div>
</div>
))}
<div style={{ background:"rgba(0,229,160,.12)", border:"1px solid #00e5a030", borderRadius:7, padding:"6px 10px", flex:1, minWidth:75 }}>
<div style={{ fontSize:9, color:"#00a070", textTransform:"uppercase" }}>Ganancia</div>
<div style={{ fontSize:13, fontWeight:700, color:"#00e5a0", fontFamily:"monospace" }}>
+{Math.round(stake * Math.abs(alert.margin) / 100).toLocaleString("es-CO")}$
</div>
<div style={{ fontSize:9, color:"#005535" }}>{Math.abs(alert.margin).toFixed(2)}%</div>
</div>
</div>
<button onClick={()=>onOpenTabs(alert.event, bestOdds)}
style={{ width:"100%", background:"#00e5a0", color:"#001a0f", border:"none", borderRadius:8, padding:"10px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
🚀 Abrir {[…new Set(Object.values(bestOdds).map(o=>o.book))].length} casas ahora
</button>
<div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:"#001a10" }}>
<div style={{ height:"100%", background:"#00e5a0", width:`${progress}%`, transition:"width .1s linear" }}/>
</div>
</div>
);
}

function OddsTable({ event }) {
const isTwoWay = !Object.values(event.odds)[0].draw;
const outcomes = isTwoWay ? ["home","away"] : ["home","draw","away"];
const labels = { home: event.home, draw:"Empate", away: event.away };
const maxOdds = {};
outcomes.forEach(o => { maxOdds[o] = Math.max(…Object.values(event.odds).map(b=>b[o]||0)); });
return (
<div style={{ overflowX:"auto", marginTop:12 }}>
<table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
<thead>
<tr>{["Casa",…outcomes.map(o=>labels[o])].map(h=>(
<th key={h} style={{ padding:"6px 10px", textAlign:"left", color:"#2a4a6a", fontSize:10, fontWeight:700, textTransform:"uppercase", borderBottom:"1px solid #0a1828" }}>{h}</th>
))}</tr>
</thead>
<tbody>
{Object.entries(event.odds).map(([book,odds])=>(
<tr key={book} style={{ borderBottom:"1px solid #080f18" }}>
<td style={{ padding:"6px 10px" }}>
<a href={BOOKMAKERS_CO[book]?.url||"#"} target="_blank" rel="noreferrer"
style={{ color: BOOKMAKERS_CO[book]?.color||"#7eb8f7", textDecoration:"none", fontWeight:700, fontSize:12 }}
onClick={e=>e.stopPropagation()}>
{book} ↗
</a>
</td>
{outcomes.map(o=>{
const val = odds[o];
const isMax = val===maxOdds[o];
return <td key={o} style={{ padding:"6px 10px", color:isMax?"#00e5a0":"#6a8aaa", fontWeight:isMax?700:400, background:isMax?"rgba(0,229,160,.05)":"transparent" }}>
{val?val.toFixed(2):"—"}{isMax&&<span style={{fontSize:8,marginLeft:2}}>▲</span>}
</td>;
})}
</tr>
))}
</tbody>
</table>
</div>
);
}

function EventCard({ event, stake, expanded, onToggle, onOpenTabs }) {
const bestOdds = getBestOdds(event);
const { margin, isSure } = calcArbitrage(bestOdds);
const stakes = calcStakes(bestOdds, stake);
const labels = { home: event.home, draw:"Empate", away: event.away };
const profit = isSure ? Math.round(stake * Math.abs(margin) / 100) : null;
const uniqueBooks = […new Set(Object.values(bestOdds).map(o=>o.book))];

return (
<div onClick={onToggle} style={{
background: isSure ? "linear-gradient(135deg,#071812,#0a1624)" : "#090f1c",
border: isSure ? "1px solid #00e5a025" : "1px solid #0c1a28",
borderLeft: isSure ? "3px solid #00e5a0" : "3px solid #1a3050",
borderRadius: 12, padding: "14px 16px", marginBottom: 8,
cursor: "pointer", position: "relative",
}}>
{isSure && (
<div style={{ position:"absolute", top:0, right:0, background:"#00e5a0", color:"#001a0f", fontSize:9, fontWeight:900, padding:"3px 10px", borderBottomLeftRadius:8 }}>
✦ SUREBET
</div>
)}
<div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
<div>
<div style={{ fontSize:10, color:"#2a5a7a", marginBottom:3 }}>{event.sport} · {event.league} · {event.time}</div>
<div style={{ fontSize:16, fontWeight:700, color:"#ddeeff", fontFamily:"‘DM Serif Display’,serif" }}>
{event.home} <span style={{color:"#1a3050"}}>vs</span> {event.away}
</div>
</div>
<div style={{ textAlign:"right" }}>
<div style={{ fontSize:20, fontWeight:800, fontFamily:"monospace", color: isSure?"#00e5a0":margin<-15?"#ff6b6b":"#ffd166" }}>
{margin>0?"+":""}{margin.toFixed(2)}%
</div>
<div style={{ fontSize:9, color:"#2a4a6a" }}>{isSure?"ganancia garantizada":"margen casa"}</div>
</div>
</div>

```
  <div style={{ display:"flex", gap:6, marginTop:12, flexWrap:"wrap" }}>
    {Object.entries(bestOdds).map(([outcome,{odd,book}])=>(
      <div key={outcome} style={{ background:"#060e1a", border:"1px solid #0c1a28", borderRadius:7, padding:"6px 10px", flex:1, minWidth:80 }}>
        <div style={{ fontSize:9, color:"#2a5a7a", textTransform:"uppercase", marginBottom:2 }}>{labels[outcome]||outcome}</div>
        <div style={{ fontSize:16, fontWeight:700, color:"#7eb8f7", fontFamily:"monospace" }}>{odd.toFixed(2)}</div>
        <BookmakerBadge name={book}/>
      </div>
    ))}
  </div>

  {expanded && (
    <div style={{ borderTop:"1px solid #0c1a28", paddingTop:14, marginTop:12 }}>
      {isSure && (
        <>
          <div style={{ fontSize:10, color:"#2a5a7a", textTransform:"uppercase", marginBottom:8 }}>
            Distribución de apuesta — Total: ${stake.toLocaleString("es-CO")} COP
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
            {Object.entries(stakes).map(([outcome,s])=>(
              <div key={outcome} style={{ background:"rgba(0,229,160,.06)", border:"1px solid #00e5a020", borderRadius:7, padding:"8px 10px", flex:1, minWidth:80 }}>
                <div style={{ fontSize:9, color:"#00a070", textTransform:"uppercase" }}>{labels[outcome]||outcome}</div>
                <div style={{ fontSize:14, fontWeight:700, color:"#00e5a0", fontFamily:"monospace" }}>${s.toLocaleString("es-CO")}</div>
                <div style={{ fontSize:9, color:"#004a30" }}>en {bestOdds[outcome].book}</div>
              </div>
            ))}
            <div style={{ background:"rgba(0,229,160,.1)", border:"1px solid #00e5a030", borderRadius:7, padding:"8px 10px", flex:1, minWidth:80 }}>
              <div style={{ fontSize:9, color:"#00a070", textTransform:"uppercase" }}>Ganancia</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#00e5a0", fontFamily:"monospace" }}>+${profit?.toLocaleString("es-CO")}</div>
              <div style={{ fontSize:9, color:"#004a30" }}>garantizada</div>
            </div>
          </div>
          <button onClick={e=>{e.stopPropagation();onOpenTabs(event,bestOdds);}}
            style={{ width:"100%", background:"#00e5a0", color:"#001a0f", border:"none", borderRadius:8, padding:"11px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit", marginBottom:12 }}>
            🚀 Abrir {uniqueBooks.length} casas colombianas simultáneamente
          </button>

          {/* Info de retiro */}
          <div style={{ fontSize:10, color:"#2a5a7a", textTransform:"uppercase", marginBottom:8 }}>
            📲 Cómo retirar en cada casa
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:12 }}>
            {uniqueBooks.map(book=>{
              const bm = BOOKMAKERS_CO[book];
              if (!bm) return null;
              return (
                <div key={book} style={{ background:"#060e1a", border:"1px solid #0c1a28", borderRadius:7, padding:"8px 12px", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
                  <div>
                    <span style={{ color:bm.color, fontWeight:700, fontSize:12 }}>{book}</span>
                    <span style={{ color:"#2a5a7a", fontSize:10, marginLeft:8 }}>{bm.nota}</span>
                  </div>
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                    {bm.metodos.slice(0,3).map(m=>(
                      <span key={m} style={{ background:"#0a1828", border:"1px solid #1a2a3a", borderRadius:4, padding:"2px 6px", fontSize:9, color:"#6a8aaa" }}>{m}</span>
                    ))}
                    <span style={{ fontSize:9, color:"#2a5a7a" }}>Min retiro: {bm.minRetiro}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div style={{ fontSize:10, color:"#2a5a7a", textTransform:"uppercase", marginBottom:6 }}>Comparativa de cuotas</div>
      <OddsTable event={event}/>
    </div>
  )}
  <div style={{ textAlign:"center", marginTop:8, fontSize:10, color:"#1a3050" }}>
    {expanded?"▲ ocultar":"▼ ver detalle y retiros"}
  </div>
</div>
```

);
}

function BookmakerCard({ name }) {
const bm = BOOKMAKERS_CO[name];
return (
<div style={{ background:"#090f1c", border:"1px solid #0c1a28", borderLeft:`3px solid ${bm.color}`, borderRadius:10, padding:"12px 14px" }}>
<div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
<div style={{ fontSize:15, fontWeight:700, color:bm.color }}>{name}</div>
<div style={{ display:"flex", gap:4 }}>
{bm.app && <span style={{ background:"#0a2a1a", color:"#00c887", fontSize:9, padding:"2px 6px", borderRadius:4 }}>APP</span>}
<span style={{ background:"#0a1a2a", color:"#4a8aba", fontSize:9, padding:"2px 6px", borderRadius:4 }}>Coljuegos</span>
</div>
</div>
<div style={{ fontSize:11, color:"#6a8aaa", marginBottom:8 }}>{bm.nota}</div>
<div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:8 }}>
{bm.metodos.map(m=>(
<span key={m} style={{ background:"#0a1828", border:"1px solid #1a2a3a", borderRadius:5, padding:"3px 8px", fontSize:10, color:"#8abaaa" }}>{m}</span>
))}
</div>
<div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
<div style={{ fontSize:10, color:"#2a5a7a" }}>
<span style={{ color:"#4a8a6a" }}>Retiro:</span> {bm.retiro} · Min: {bm.minRetiro}
</div>
<a href={bm.url} target="_blank" rel="noreferrer"
style={{ background:bm.color, color:"#fff", border:"none", borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:700, textDecoration:"none", cursor:"pointer" }}>
Abrir ↗
</a>
</div>
</div>
);
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function SurebetRadarCO() {
const [events, setEvents] = useState(BASE_EVENTS);
const [stake, setStake] = useState(50000);
const [expandedId, setExpandedId] = useState(null);
const [alerts, setAlerts] = useState([]);
const [history, setHistory] = useState([]);
const [tab, setTab] = useState("live");
const [lastScan, setLastScan] = useState(new Date());
const [scanning, setScanning] = useState(false);
const [soundOn, setSoundOn] = useState(true);
const [filterSport, setFilterSport] = useState("Todos");
const [scanInterval, setScanInterval] = useState(5);
const prevSurebets = useRef(new Set());

const openBookmakerTabs = useCallback((event, bestOdds) => {
const books = […new Set(Object.values(bestOdds).map(o=>o.book))];
books.forEach((book,i)=>{
setTimeout(()=>{ window.open(BOOKMAKERS_CO[book]?.url||"#", `_sb_${book}`); }, i*400);
});
}, []);

const triggerAlert = useCallback((event, margin) => {
if (soundOn) playAlert();
const newAlert = { id: Date.now(), event, margin };
setAlerts(prev=>[newAlert,…prev].slice(0,4));
setHistory(prev=>[{
id: Date.now(), time: new Date().toLocaleTimeString(),
match: `${event.home} vs ${event.away}`,
league: event.league, margin,
profit: Math.round(stake * Math.abs(margin) / 100),
},…prev].slice(0,50));
}, [soundOn, stake]);

useEffect(()=>{
const iv = setInterval(()=>{
setScanning(true);
setTimeout(()=>setScanning(false), 500);
setEvents(prev=>{
const updated = prev.map(e=>({
…e,
odds: Object.fromEntries(Object.entries(e.odds).map(([book,odds])=>[
book,
Object.fromEntries(Object.entries(odds).map(([o,v])=>[
o, Math.max(1.05, +(v+(Math.random()-.48)*.1).toFixed(2))
]))
]))
}));
updated.forEach(e=>{
const best = getBestOdds(e);
const { isSure, margin } = calcArbitrage(best);
if (isSure && !prevSurebets.current.has(e.id)) {
prevSurebets.current.add(e.id);
triggerAlert(e, margin);
} else if (!isSure) prevSurebets.current.delete(e.id);
});
return updated;
});
setLastScan(new Date());
}, scanInterval*1000);
return ()=>clearInterval(iv);
}, [scanInterval, triggerAlert]);

const sports = ["Todos",…new Set(BASE_EVENTS.map(e=>e.sport))];
const filtered = events
.filter(e=>filterSport==="Todos"||e.sport===filterSport)
.sort((a,b)=>calcArbitrage(getBestOdds(b)).margin - calcArbitrage(getBestOdds(a)).margin);

const surebetCount = events.filter(e=>calcArbitrage(getBestOdds(e)).isSure).length;
const totalProfit = history.reduce((a,h)=>a+h.profit,0);

return (
<div style={{ minHeight:"100vh", background:"#060c16", fontFamily:"‘DM Sans’,‘Segoe UI’,sans-serif", color:"#c8d8e8" }}>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap" rel="stylesheet"/>

```
  {/* ALERTAS */}
  {alerts.length>0 && (
    <div style={{ position:"fixed", top:12, right:12, zIndex:300, width:330, maxWidth:"calc(100vw - 24px)" }}>
      {alerts.map(a=>(
        <AlertToast key={a.id} alert={a} stake={stake}
          onDismiss={id=>setAlerts(p=>p.filter(x=>x.id!==id))}
          onOpenTabs={openBookmakerTabs}/>
      ))}
    </div>
  )}

  {/* HEADER */}
  <div style={{ background:"#060c16", borderBottom:"1px solid #0a1628", padding:"14px 16px", position:"sticky", top:0, zIndex:100 }}>
    <div style={{ maxWidth:860, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:8, background:"linear-gradient(135deg,#00e5a0,#0066ff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900, color:"#001a0f" }}>◈</div>
        <div>
          <div style={{ fontSize:17, fontWeight:800, color:"#e8f4ff", fontFamily:"'DM Serif Display',serif" }}>
            SureBet<span style={{color:"#00e5a0"}}>Radar</span> <span style={{color:"#ffd166",fontSize:12}}>🇨🇴</span>
          </div>
          <div style={{ fontSize:9, color:"#1a4060", display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background:scanning?"#ffd166":"#00e5a0", display:"inline-block", boxShadow:scanning?"0 0 5px #ffd166":"0 0 5px #00e5a0" }}/>
            {scanning?"escaneando...":lastScan.toLocaleTimeString()} · Coljuegos ✓
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
        {surebetCount>0 && (
          <div style={{ background:"rgba(0,229,160,.1)", border:"1px solid #00e5a030", borderRadius:7, padding:"6px 12px", textAlign:"center" }}>
            <div style={{ fontSize:17, fontWeight:800, color:"#00e5a0", fontFamily:"monospace" }}>{surebetCount}</div>
            <div style={{ fontSize:8, color:"#006644" }}>surebets</div>
          </div>
        )}
        {totalProfit>0 && (
          <div style={{ background:"#080f18", border:"1px solid #0a1828", borderRadius:7, padding:"6px 12px", textAlign:"center" }}>
            <div style={{ fontSize:17, fontWeight:800, color:"#ffd166", fontFamily:"monospace" }}>+${totalProfit.toLocaleString("es-CO")}</div>
            <div style={{ fontSize:8, color:"#3a3000" }}>COP detectado</div>
          </div>
        )}
        <button onClick={()=>setSoundOn(s=>!s)} style={{ background:"transparent", border:"1px solid #0a1828", borderRadius:7, padding:"8px 12px", color:soundOn?"#00e5a0":"#2a4a6a", fontSize:16, cursor:"pointer" }}>
          {soundOn?"🔔":"🔕"}
        </button>
      </div>
    </div>
  </div>

  <div style={{ maxWidth:860, margin:"0 auto", padding:"14px 12px" }}>
    {/* TABS */}
    <div style={{ display:"flex", gap:2, borderBottom:"1px solid #0a1628", marginBottom:16 }}>
      {[
        {key:"live",label:"📡 En vivo"},
        {key:"casas",label:"🏦 Casas CO"},
        {key:"history",label:`📋 Historial (${history.length})`},
      ].map(({key,label})=>(
        <button key={key} onClick={()=>setTab(key)} style={{
          background:"transparent", border:"none",
          borderBottom:tab===key?"2px solid #00e5a0":"2px solid transparent",
          color:tab===key?"#00e5a0":"#2a5a7a",
          padding:"8px 14px", fontSize:12, fontWeight:600, cursor:"pointer",
          fontFamily:"inherit", marginBottom:-1,
        }}>{label}</button>
      ))}
    </div>

    {tab==="live" && (
      <>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14, alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"#080f18", border:"1px solid #0a1828", borderRadius:7, padding:"7px 12px" }}>
            <span style={{ fontSize:10, color:"#2a5a7a" }}>Stake:</span>
            <span style={{ fontSize:10, color:"#4a7a9b" }}>$</span>
            <input type="number" value={stake} onChange={e=>setStake(Math.max(5000,+e.target.value))}
              onClick={e=>e.stopPropagation()}
              style={{ background:"transparent", border:"none", outline:"none", color:"#e8f4ff", fontWeight:700, width:80, fontSize:14, fontFamily:"monospace" }}/>
            <span style={{ fontSize:10, color:"#2a5a7a" }}>COP</span>
          </div>
          {sports.map(s=>(
            <button key={s} onClick={()=>setFilterSport(s)} style={{
              background:filterSport===s?"#0e2a4a":"transparent",
              border:filterSport===s?"1px solid #2a6aaa":"1px solid #0a1828",
              borderRadius:7, padding:"7px 11px",
              color:filterSport===s?"#7eb8f7":"#2a4a6a",
              fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:600,
            }}>{s}</button>
          ))}
          <div style={{ marginLeft:"auto", display:"flex", gap:4, alignItems:"center" }}>
            <span style={{ fontSize:10, color:"#2a4a6a" }}>Scan:</span>
            {[3,5,10].map(s=>(
              <button key={s} onClick={()=>setScanInterval(s)} style={{
                background:scanInterval===s?"#0e2a4a":"transparent",
                border:scanInterval===s?"1px solid #2a6aaa":"1px solid #0a1828",
                borderRadius:6, padding:"5px 9px", color:scanInterval===s?"#7eb8f7":"#2a4a6a",
                fontSize:10, cursor:"pointer", fontFamily:"inherit",
              }}>{s}s</button>
            ))}
          </div>
        </div>
        {filtered.map(e=>(
          <EventCard key={e.id} event={e} stake={stake}
            expanded={expandedId===e.id}
            onToggle={()=>setExpandedId(id=>id===e.id?null:e.id)}
            onOpenTabs={openBookmakerTabs}/>
        ))}
      </>
    )}

    {tab==="casas" && (
      <div>
        <div style={{ fontSize:11, color:"#2a5a7a", marginBottom:14, lineHeight:1.6 }}>
          Todas con licencia <strong style={{color:"#ffd166"}}>Coljuegos</strong> ✓ · Depósito y retiro en pesos colombianos · Registro con cédula colombiana
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {Object.keys(BOOKMAKERS_CO).map(name=>(
            <BookmakerCard key={name} name={name}/>
          ))}
        </div>
        <div style={{ marginTop:16, background:"rgba(255,209,102,.05)", border:"1px solid #ffd16620", borderRadius:10, padding:"12px 14px", fontSize:11, color:"#8a7a40" }}>
          💡 <strong>Tip para surebets en Colombia:</strong> Abre cuentas en mínimo 3-4 casas antes de empezar. Verifica tu identidad (cédula) en todas desde ya. Usa Nequi o Daviplata para los retiros más rápidos.
        </div>
      </div>
    )}

    {tab==="history" && (
      <div style={{ background:"#080f18", border:"1px solid #0a1828", borderRadius:10, overflow:"hidden" }}>
        {history.length===0 ? (
          <div style={{ padding:"40px", textAlign:"center", color:"#1a3a5a" }}>
            <div style={{ fontSize:28, marginBottom:8 }}>⏳</div>
            <div>Aún no se han detectado surebets en esta sesión</div>
          </div>
        ) : history.map(h=>(
          <div key={h.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderBottom:"1px solid #080f18", flexWrap:"wrap", gap:6, fontSize:12 }}>
            <div>
              <span style={{ color:"#2a5a7a", marginRight:8 }}>{h.time}</span>
              <span style={{ color:"#c8d8e8", fontWeight:600 }}>{h.match}</span>
              <span style={{ color:"#1a3a5a", marginLeft:6, fontSize:10 }}>{h.league}</span>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <span style={{ color:"#00e5a0", fontFamily:"monospace", fontWeight:700 }}>+{h.margin.toFixed(2)}%</span>
              <span style={{ color:"#4a7a5a", fontFamily:"monospace" }}>+${h.profit.toLocaleString("es-CO")}</span>
              <span style={{ background:"#0a1e0e", color:"#00a070", fontSize:9, padding:"2px 6px", borderRadius:4 }}>✓</span>
            </div>
          </div>
        ))}
      </div>
    )}

    <div style={{ textAlign:"center", padding:"20px 0 4px", fontSize:10, color:"#0e1e2e" }}>
      Solo fines educativos · Cuotas simuladas · Apuesta responsablemente · +18
    </div>
  </div>

  <style>{`
    @keyframes slideIn { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
    *{box-sizing:border-box}
    input[type=number]::-webkit-inner-spin-button{opacity:.3}
    a:hover{opacity:.8}
  `}</style>
</div>
```

);
}
