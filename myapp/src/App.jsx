import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS & HELPERS ────────────────────────────────────────────────────
const COLORS = {
  bg: "#050a14",
  surface: "#0b1424",
  surfaceAlt: "#0f1e35",
  border: "#1a2d4a",
  accent: "#00d4ff",
  accentGlow: "#00d4ff44",
  gold: "#ffc857",
  red: "#ff4466",
  green: "#00ff9f",
  purple: "#9d4edd",
  text: "#e8f4fd",
  textMuted: "#7a9ab5",
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rad = (deg) => (deg * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// ─── SHARED STYLES ──────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Nunito:wght@300;400;500;600&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    background: ${COLORS.bg};
    color: ${COLORS.text};
    font-family: 'Nunito', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }
  
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: ${COLORS.accent}; }
  
  .glow-text { 
    color: ${COLORS.accent}; 
    text-shadow: 0 0 20px ${COLORS.accent}88; 
  }
  
  .card {
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 12px;
    padding: 20px;
  }
  
  .card-alt {
    background: ${COLORS.surfaceAlt};
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    padding: 16px;
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 8px;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0.5px;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  
  .btn-primary {
    background: ${COLORS.accent};
    color: #000;
  }
  .btn-primary:hover { 
    background: #33ddff; 
    box-shadow: 0 0 20px ${COLORS.accent}88;
    transform: translateY(-1px);
  }
  
  .btn-secondary {
    background: transparent;
    border: 1px solid ${COLORS.border};
    color: ${COLORS.text};
  }
  .btn-secondary:hover { 
    border-color: ${COLORS.accent}; 
    color: ${COLORS.accent};
  }
  
  .btn-ghost {
    background: transparent;
    color: ${COLORS.textMuted};
    padding: 6px 12px;
  }
  .btn-ghost:hover { color: ${COLORS.text}; background: ${COLORS.border}22; }
  
  .slider-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .slider-label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
  }
  .slider-name { color: ${COLORS.textMuted}; }
  .slider-val { color: ${COLORS.accent}; font-weight: 500; }
  
  input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: ${COLORS.border};
    outline: none;
    cursor: pointer;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${COLORS.accent};
    box-shadow: 0 0 8px ${COLORS.accent}88;
    cursor: pointer;
    transition: transform 0.15s;
  }
  input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
  
  .stat-box {
    background: ${COLORS.bg};
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    padding: 10px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
  }
  .stat-label { color: ${COLORS.textMuted}; margin-bottom: 2px; }
  .stat-value { color: ${COLORS.accent}; font-size: 16px; font-weight: 500; }
  
  .formula-box {
    background: #0a1520;
    border-left: 3px solid ${COLORS.accent};
    border-radius: 0 8px 8px 0;
    padding: 12px 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: ${COLORS.gold};
    margin: 8px 0;
  }
  
  .step-item {
    display: flex;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid ${COLORS.border}44;
    font-size: 13px;
  }
  .step-num {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${COLORS.accent}22;
    border: 1px solid ${COLORS.accent}66;
    color: ${COLORS.accent};
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-family: 'JetBrains Mono', monospace;
  }
  
  .tab-bar {
    display: flex;
    gap: 4px;
    background: ${COLORS.bg};
    border-radius: 10px;
    padding: 4px;
    border: 1px solid ${COLORS.border};
  }
  .tab {
    flex: 1;
    text-align: center;
    padding: 8px 12px;
    border-radius: 8px;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.2s;
    color: ${COLORS.textMuted};
    border: none;
    background: transparent;
  }
  .tab.active {
    background: ${COLORS.accent}22;
    color: ${COLORS.accent};
    border: 1px solid ${COLORS.accent}44;
  }
  .tab:hover:not(.active) { color: ${COLORS.text}; background: ${COLORS.border}33; }
  
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  
  .section-title {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: ${COLORS.textMuted};
    margin-bottom: 12px;
  }
  
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes glow { 0%, 100% { box-shadow: 0 0 10px ${COLORS.accent}44; } 50% { box-shadow: 0 0 25px ${COLORS.accent}88; } }
  
  .animate-in { animation: fadeIn 0.35s ease both; }
  .pulse { animation: pulse 2s infinite; }
  
  canvas { display: block; }
  
  .ai-msg {
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 13.5px;
    line-height: 1.7;
    margin: 8px 0;
  }
  .ai-msg.user {
    background: ${COLORS.accent}18;
    border: 1px solid ${COLORS.accent}33;
    margin-left: 20px;
    color: ${COLORS.text};
  }
  .ai-msg.assistant {
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    margin-right: 20px;
  }
  .ai-msg.assistant .tag {
    font-family: 'Rajdhani', sans-serif;
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: ${COLORS.accent};
    margin-bottom: 6px;
    display: block;
  }
  
  .thinking { 
    display: flex; gap: 4px; align-items: center; padding: 8px 0; 
  }
  .thinking span {
    width: 6px; height: 6px; border-radius: 50%; background: ${COLORS.accent};
    animation: pulse 1.2s infinite;
  }
  .thinking span:nth-child(2) { animation-delay: 0.2s; }
  .thinking span:nth-child(3) { animation-delay: 0.4s; }
`;

// ─── SLIDER COMPONENT ────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step = 0.1, unit = "", onChange }) {
  return (
    <div className="slider-wrap">
      <div className="slider-label">
        <span className="slider-name">{label}</span>
        <span className="slider-val">{round(value, 2)}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))} />
    </div>
  );
}

// ─── PROJECTILE MOTION MODULE ────────────────────────────────────────────────
function ProjectileModule() {
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(30);
  const [gravity, setGravity] = useState(9.81);
  const [height, setHeight] = useState(0);
  const [airRes, setAirRes] = useState(0);
  const [running, setRunning] = useState(false);
  const [showSteps, setShowSteps] = useState(true);
  const [ghostPath, setGhostPath] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({ t: 0, path: [], running: false });

  const calcMetrics = useCallback(() => {
    const a = rad(angle), v0 = velocity, g = gravity, h0 = height;
    const vx = v0 * Math.cos(a), vy = v0 * Math.sin(a);
    const disc = vy * vy + 2 * g * h0;
    const T = disc >= 0 ? (vy + Math.sqrt(disc)) / g : 0;
    const R = vx * T;
    const H = h0 + (vy * vy) / (2 * g);
    return { T: round(T), R: round(R), H: round(H), vx: round(vx), vy: round(vy) };
  }, [angle, velocity, gravity, height]);

  const metrics = calcMetrics();

  const computePosition = (t) => {
    const a = rad(angle), v0 = velocity, g = gravity, h0 = height;
    const vx = v0 * Math.cos(a), vy0 = v0 * Math.sin(a);
    const k = airRes * 0.01;
    let x, y;
    if (k < 0.001) {
      x = vx * t;
      y = h0 + vy0 * t - 0.5 * g * t * t;
    } else {
      x = (vx / k) * (1 - Math.exp(-k * t));
      y = h0 + ((vy0 + g / k) / k) * (1 - Math.exp(-k * t)) - (g * t) / k;
    }
    return { x, y };
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const pad = 50, groundY = H - 50;
    const maxR = Math.max(metrics.R * 1.15, 50);
    const maxHt = Math.max(metrics.H * 1.2 + height, 30);
    const scaleX = (W - pad * 2) / maxR;
    const scaleY = (groundY - pad) / maxHt;

    const toCanvas = (x, y) => ({
      cx: pad + x * scaleX,
      cy: groundY - (y) * scaleY,
    });

    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.strokeStyle = "#1a2d4a44";
    ctx.lineWidth = 1;
    for (let gx = pad; gx <= W - pad; gx += 50) {
      ctx.beginPath(); ctx.moveTo(gx, pad); ctx.lineTo(gx, groundY); ctx.stroke();
    }
    for (let gy = pad; gy <= groundY; gy += 50) {
      ctx.beginPath(); ctx.moveTo(pad, gy); ctx.lineTo(W - pad, gy); ctx.stroke();
    }

    // Ground
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, groundY + (height > 0 ? height * scaleY : 0));
    ctx.lineTo(W - pad, groundY + (height > 0 ? height * scaleY : 0));
    ctx.stroke();
    ctx.strokeStyle = COLORS.accent + "33";
    ctx.beginPath(); ctx.moveTo(pad, groundY); ctx.lineTo(W - pad, groundY); ctx.stroke();

    // Axis labels
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = "11px 'JetBrains Mono'";
    ctx.fillText("x (m)", W - 45, groundY + 18);
    ctx.fillText("y", pad - 15, pad + 10);

    // Ghost path
    if (ghostPath) {
      ctx.strokeStyle = COLORS.purple + "66";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ghostPath.forEach((p, i) => {
        const c = toCanvas(p.x, p.y);
        i === 0 ? ctx.moveTo(c.cx, c.cy) : ctx.lineTo(c.cx, c.cy);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Full ideal path (faded)
    ctx.strokeStyle = COLORS.accent + "22";
    ctx.lineWidth = 1;
    ctx.beginPath();
    const T = metrics.T;
    for (let t = 0; t <= T; t += T / 100) {
      const p = computePosition(t);
      if (p.y < -5) break;
      const c = toCanvas(p.x, p.y);
      t === 0 ? ctx.moveTo(c.cx, c.cy) : ctx.lineTo(c.cx, c.cy);
    }
    ctx.stroke();

    // Drawn trail
    const path = stateRef.current.path;
    if (path.length > 1) {
      const grad = ctx.createLinearGradient(
        toCanvas(path[0].x, path[0].y).cx, 0,
        toCanvas(path[path.length - 1].x, path[path.length - 1].y).cx, 0
      );
      grad.addColorStop(0, COLORS.accent + "88");
      grad.addColorStop(1, COLORS.accent);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      path.forEach((p, i) => {
        const c = toCanvas(p.x, p.y);
        i === 0 ? ctx.moveTo(c.cx, c.cy) : ctx.lineTo(c.cx, c.cy);
      });
      ctx.stroke();
    }

    // Current ball
    const curT = stateRef.current.t;
    if (curT > 0 || !running) {
      const cp = path.length > 0 ? path[path.length - 1] : computePosition(0);
      const c = toCanvas(cp.x, cp.y);
      // Glow
      const radGrad = ctx.createRadialGradient(c.cx, c.cy, 0, c.cx, c.cy, 18);
      radGrad.addColorStop(0, COLORS.accent + "88");
      radGrad.addColorStop(1, "transparent");
      ctx.fillStyle = radGrad;
      ctx.beginPath(); ctx.arc(c.cx, c.cy, 18, 0, Math.PI * 2); ctx.fill();
      // Ball
      ctx.fillStyle = COLORS.accent;
      ctx.beginPath(); ctx.arc(c.cx, c.cy, 7, 0, Math.PI * 2); ctx.fill();
      // Velocity vectors
      if (path.length > 0) {
        const vxC = velocity * Math.cos(rad(angle));
        const vyC = velocity * Math.sin(rad(angle)) - gravity * curT;
        const scale2 = 3;
        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c.cx, c.cy);
        ctx.lineTo(c.cx + vxC * scale2, c.cy - vyC * scale2);
        ctx.stroke();
        // Arrowhead
        const len = Math.sqrt(vxC * vxC + vyC * vyC);
        if (len > 0.5) {
          const nx = vxC / len, ny = -vyC / len;
          const ax = c.cx + vxC * scale2, ay = c.cy - vyC * scale2;
          ctx.fillStyle = COLORS.gold;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax - nx * 10 + ny * 4, ay - ny * 10 - nx * 4);
          ctx.lineTo(ax - nx * 10 - ny * 4, ay - ny * 10 + nx * 4);
          ctx.closePath(); ctx.fill();
        }
      }
    }

    // Range marker
    if (metrics.R > 0) {
      const rc = toCanvas(metrics.R, 0);
      ctx.fillStyle = COLORS.green;
      ctx.font = "11px 'JetBrains Mono'";
      ctx.fillText(`R=${metrics.R}m`, rc.cx - 30, groundY + 18);
      ctx.strokeStyle = COLORS.green + "66";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(rc.cx, groundY); ctx.lineTo(rc.cx, groundY - 8); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Max height marker
    const T_peak = (velocity * Math.sin(rad(angle))) / gravity;
    const peak = computePosition(T_peak);
    if (peak.y > 1) {
      const pc = toCanvas(peak.x, peak.y);
      ctx.strokeStyle = COLORS.red + "66";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(pad, pc.cy); ctx.lineTo(pc.cx, pc.cy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = COLORS.red;
      ctx.font = "11px 'JetBrains Mono'";
      ctx.fillText(`H=${metrics.H}m`, pad + 4, pc.cy - 5);
    }

    // Cannon
    const cannon = toCanvas(0, height);
    ctx.save();
    ctx.translate(cannon.cx, cannon.cy);
    ctx.rotate(-rad(angle));
    ctx.fillStyle = COLORS.textMuted;
    ctx.beginPath();
    ctx.roundRect(-6, -5, 40, 10, 3);
    ctx.fill();
    ctx.fillStyle = COLORS.border;
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

  }, [angle, velocity, gravity, height, airRes, metrics, ghostPath, running]);

  useEffect(() => { draw(); }, [draw]);

  const startAnimation = () => {
    if (running) {
      cancelAnimationFrame(animRef.current);
      setGhostPath([...stateRef.current.path]);
      stateRef.current = { t: 0, path: [], running: false };
      setRunning(false);
      setCurrentTime(0);
      draw();
      return;
    }
    stateRef.current = { t: 0, path: [], running: true };
    setRunning(true);
    const T = metrics.T;
    const step = 0.016;
    const animate = () => {
      const s = stateRef.current;
      if (!s.running) return;
      s.t += step;
      const p = computePosition(s.t);
      if (p.y >= -0.1 && s.t <= T + 0.5) {
        s.path.push({ x: Math.max(0, p.x), y: Math.max(0, p.y) });
        setCurrentTime(round(s.t, 2));
        draw();
        animRef.current = requestAnimationFrame(animate);
      } else {
        s.running = false;
        setRunning(false);
      }
    };
    animRef.current = requestAnimationFrame(animate);
  };

  const reset = () => {
    cancelAnimationFrame(animRef.current);
    stateRef.current = { t: 0, path: [], running: false };
    setRunning(false);
    setCurrentTime(0);
    setGhostPath(null);
    draw();
  };

  return (
    <div className="animate-in" style={{ display: "flex", gap: 16, height: "100%" }}>
      {/* Controls */}
      <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p className="section-title">Launch Parameters</p>
          <Slider label="Angle" value={angle} min={1} max={89} step={1} unit="°" onChange={setAngle} />
          <Slider label="Initial Speed" value={velocity} min={1} max={100} step={1} unit=" m/s" onChange={setVelocity} />
          <Slider label="Gravity" value={gravity} min={1} max={25} step={0.1} unit=" m/s²" onChange={setGravity} />
          <Slider label="Launch Height" value={height} min={0} max={50} step={1} unit=" m" onChange={setHeight} />
          <Slider label="Air Resistance" value={airRes} min={0} max={5} step={0.1} unit="" onChange={setAirRes} />
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`btn ${running ? "btn-secondary" : "btn-primary"}`} style={{ flex: 1 }} onClick={startAnimation}>
              {running ? "⏹ Stop" : "▶ Launch"}
            </button>
            <button className="btn btn-secondary" onClick={reset}>↺</button>
          </div>
        </div>

        {/* Stats */}
        <div className="card">
          <p className="section-title">Results</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["Range", metrics.R, "m"],
              ["Max Height", metrics.H, "m"],
              ["Time of Flight", metrics.T, "s"],
              ["Current Time", currentTime, "s"],
              ["Vx", metrics.vx, "m/s"],
              ["Vy₀", metrics.vy, "m/s"],
            ].map(([label, val, unit]) => (
              <div className="stat-box" key={label}>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{val}<span style={{ fontSize: 10, color: COLORS.textMuted }}> {unit}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="card" style={{ flex: 1, padding: 12 }}>
          <canvas
            ref={canvasRef}
            width={700} height={360}
            style={{ width: "100%", height: "100%", borderRadius: 8 }}
          />
        </div>

        {/* Step-by-step */}
        {showSteps && (
          <div className="card animate-in">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <p className="section-title" style={{ margin: 0 }}>Step-by-Step Solution</p>
              <button className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => setShowSteps(false)}>Hide</button>
            </div>
            <div className="formula-box">x(t) = v₀·cos(θ)·t &nbsp;|&nbsp; y(t) = h₀ + v₀·sin(θ)·t − ½g·t²</div>
            {[
              [`Decompose velocity`, `Vx = ${velocity}·cos(${angle}°) = ${metrics.vx} m/s`, `Vy₀ = ${velocity}·sin(${angle}°) = ${metrics.vy} m/s`],
              [`Time of flight`, `Solving y(T) = 0: T = (Vy₀ + √(Vy₀² + 2g·h₀)) / g = ${metrics.T} s`],
              [`Maximum height`, `H = h₀ + Vy₀²/(2g) = ${height} + ${round(metrics.vy * metrics.vy / (2 * gravity), 2)} = ${metrics.H} m`],
              [`Range`, `R = Vx · T = ${metrics.vx} × ${metrics.T} = ${metrics.R} m`],
            ].map(([title, ...lines], i) => (
              <div className="step-item" key={i}>
                <div className="step-num">{i + 1}</div>
                <div>
                  <div style={{ color: COLORS.gold, fontWeight: 600, marginBottom: 3, fontSize: 12, fontFamily: "'Rajdhani', sans-serif" }}>{title}</div>
                  {lines.map((l, j) => <div key={j} style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: COLORS.textMuted }}>{l}</div>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WAVE MODULE ─────────────────────────────────────────────────────────────
function WaveModule() {
  const [freq1, setFreq1] = useState(2);
  const [freq2, setFreq2] = useState(3);
  const [amp1, setAmp1] = useState(1);
  const [amp2, setAmp2] = useState(0.8);
  const [phase, setPhase] = useState(0);
  const [running, setRunning] = useState(true);
  const [mode, setMode] = useState("interference");
  const canvasRef = useRef(null);
  const tRef = useRef(0);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const draw = (t) => {
      const W = canvas.width, H = canvas.height;
      const midY = H / 2;
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = "#1a2d4a44";
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 40) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }
      ctx.strokeStyle = COLORS.border + "88";
      ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();

      const drawWave = (color, fn, yOffset = 0) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < W; x++) {
          const xNorm = x / W;
          const y = fn(xNorm, t);
          const canvasY = midY + yOffset - y * 60;
          x === 0 ? ctx.moveTo(x, canvasY) : ctx.lineTo(x, canvasY);
        }
        ctx.stroke();
      };

      if (mode === "interference") {
        drawWave(COLORS.accent + "88", (x, t) => amp1 * Math.sin(2 * Math.PI * (freq1 * x - t)));
        drawWave(COLORS.red + "88", (x, t) => amp2 * Math.sin(2 * Math.PI * (freq2 * x - t) + phase));
        drawWave(COLORS.gold, (x, t) =>
          amp1 * Math.sin(2 * Math.PI * (freq1 * x - t)) +
          amp2 * Math.sin(2 * Math.PI * (freq2 * x - t) + phase)
        );
      } else if (mode === "standing") {
        drawWave(COLORS.accent + "66", (x, t) => amp1 * Math.sin(2 * Math.PI * freq1 * x - 2 * Math.PI * t));
        drawWave(COLORS.red + "66", (x, t) => amp1 * Math.sin(2 * Math.PI * freq1 * x + 2 * Math.PI * t));
        drawWave(COLORS.gold, (x, t) => 2 * amp1 * Math.sin(2 * Math.PI * freq1 * x) * Math.cos(2 * Math.PI * t));
      } else {
        drawWave(COLORS.accent, (x, t) => {
          const srcX = 0.3, fObs = 3, v = 1, vs = 0.3 * Math.sin(t * 0.5);
          const fDoppler = fObs * (v / (v - vs));
          return amp1 * Math.sin(2 * Math.PI * fDoppler * (x - t / 3));
        });
      }

      ctx.font = "11px 'JetBrains Mono'";
      if (mode === "interference") {
        [["Wave 1", COLORS.accent], ["Wave 2", COLORS.red], ["Resultant", COLORS.gold]].forEach(([label, color], i) => {
          ctx.fillStyle = color;
          ctx.fillText(`— ${label}`, 10, 18 + i * 16);
        });
      }
    };

    const loop = () => {
      tRef.current += 0.02;
      draw(tRef.current);
      if (running) animRef.current = requestAnimationFrame(loop);
    };

    if (running) {
      animRef.current = requestAnimationFrame(loop);
    } else {
      draw(tRef.current);
    }

    return () => cancelAnimationFrame(animRef.current);
  }, [freq1, freq2, amp1, amp2, phase, running, mode]);

  return (
    <div className="animate-in" style={{ display: "flex", gap: 16 }}>
      <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="card">
          <p className="section-title">Wave Mode</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[["interference", "Interference"], ["standing", "Standing Wave"], ["doppler", "Doppler Effect"]].map(([v, l]) => (
              <button key={v} className={`btn ${mode === v ? "btn-primary" : "btn-secondary"}`}
                style={{ justifyContent: "flex-start", fontSize: 12 }} onClick={() => setMode(v)}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p className="section-title">Parameters</p>
          <Slider label="Frequency 1" value={freq1} min={0.5} max={8} step={0.1} unit=" Hz" onChange={setFreq1} />
          <Slider label="Amplitude 1" value={amp1} min={0.1} max={2} step={0.1} onChange={setAmp1} />
          {mode === "interference" && <>
            <Slider label="Frequency 2" value={freq2} min={0.5} max={8} step={0.1} unit=" Hz" onChange={setFreq2} />
            <Slider label="Amplitude 2" value={amp2} min={0.1} max={2} step={0.1} onChange={setAmp2} />
            <Slider label="Phase Shift" value={phase} min={0} max={6.28} step={0.1} unit=" rad" onChange={setPhase} />
          </>}
          <button className={`btn ${running ? "btn-secondary" : "btn-primary"}`} onClick={() => setRunning(!running)}>
            {running ? "⏸ Pause" : "▶ Play"}
          </button>
        </div>
        <div className="card">
          <p className="section-title">Key Info</p>
          {mode === "interference" && (
            <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.7 }}>
              <div className="formula-box" style={{ fontSize: 11 }}>Δf = {round(Math.abs(freq1 - freq2), 1)} Hz (Beat frequency)</div>
              When two waves superpose, the resultant displacement is the <span style={{ color: COLORS.gold }}>algebraic sum</span> of individual displacements.
            </div>
          )}
          {mode === "standing" && (
            <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.7 }}>
              <div className="formula-box" style={{ fontSize: 11 }}>y = 2A·sin(kx)·cos(ωt)</div>
              Standing waves form <span style={{ color: COLORS.gold }}>nodes</span> (no displacement) and <span style={{ color: COLORS.accent }}>antinodes</span> (max displacement).
            </div>
          )}
          {mode === "doppler" && (
            <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.7 }}>
              <div className="formula-box" style={{ fontSize: 11 }}>f' = f·(v±vₒ)/(v∓vₛ)</div>
              The observed frequency changes as source/observer moves relative to the wave medium.
            </div>
          )}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div className="card" style={{ padding: 12 }}>
          <canvas ref={canvasRef} width={700} height={420} style={{ width: "100%", height: 420, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}

// ─── THERMODYNAMICS MODULE ────────────────────────────────────────────────────
function ThermoModule() {
  const [temp, setTemp] = useState(300);
  const [pressure, setPressure] = useState(101325);
  const [moles, setMoles] = useState(1);
  const R_gas = 8.314;
  const volume = round((moles * R_gas * temp) / pressure * 1000, 2);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const N = Math.min(50, Math.round(moles * 30));
    const speed = Math.sqrt(temp / 300) * 2;

    if (particlesRef.current.length !== N) {
      particlesRef.current = Array.from({ length: N }, () => ({
        x: 40 + Math.random() * (W - 80),
        y: 40 + Math.random() * (H - 80),
        vx: (Math.random() - 0.5) * speed * 2,
        vy: (Math.random() - 0.5) * speed * 2,
      }));
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, W - 60, H - 60);

      const heatColor = temp < 200 ? "#00d4ff" : temp < 500 ? "#ffc857" : "#ff4466";
      ctx.fillStyle = heatColor + "08";
      ctx.fillRect(30, 30, W - 60, H - 60);

      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 35 || p.x > W - 35) p.vx *= -1;
        if (p.y < 35 || p.y > H - 35) p.vy *= -1;
        const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
        radGrad.addColorStop(0, heatColor + "cc");
        radGrad.addColorStop(1, "transparent");
        ctx.fillStyle = radGrad;
        ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = heatColor;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      });

      ctx.fillStyle = COLORS.textMuted;
      ctx.font = "12px 'JetBrains Mono'";
      ctx.fillText(`T = ${temp} K`, 40, H - 10);
      ctx.fillText(`P = ${round(pressure / 1000, 1)} kPa`, W / 2 - 50, H - 10);
      ctx.fillText(`V = ${volume} L`, W - 120, H - 10);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [temp, pressure, moles, volume]);

  return (
    <div className="animate-in" style={{ display: "flex", gap: 16 }}>
      <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p className="section-title">Ideal Gas Parameters</p>
          <Slider label="Temperature" value={temp} min={50} max={1000} step={10} unit=" K" onChange={setTemp} />
          <Slider label="Pressure" value={pressure / 1000} min={10} max={500} step={5} unit=" kPa" onChange={v => setPressure(v * 1000)} />
          <Slider label="Moles (n)" value={moles} min={0.1} max={5} step={0.1} unit=" mol" onChange={setMoles} />
        </div>
        <div className="card">
          <p className="section-title">Results — PV = nRT</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[["Volume", volume, "L"], ["KE avg", round(1.5 * R_gas * temp, 1), "J/mol"], ["Pressure", round(pressure / 1000, 2), "kPa"]].map(([l, v, u]) => (
              <div className="stat-box" key={l}>
                <div className="stat-label">{l}</div>
                <div className="stat-value">{v}<span style={{ fontSize: 10, color: COLORS.textMuted }}> {u}</span></div>
              </div>
            ))}
          </div>
          <div className="formula-box" style={{ marginTop: 12, fontSize: 11 }}>
            PV = nRT<br />
            V = nRT/P = {moles}×8.314×{temp}/{round(pressure / 1000, 1)}×1000
          </div>
        </div>
        <div className="card">
          <p className="section-title">Temperature Scale</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontFamily: "'JetBrains Mono'" }}>
            {[["Kelvin", temp, "K"], ["Celsius", round(temp - 273.15, 1), "°C"], ["Fahrenheit", round((temp - 273.15) * 9 / 5 + 32, 1), "°F"]].map(([l, v, u]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", color: COLORS.textMuted }}>
                <span>{l}</span><span style={{ color: COLORS.accent }}>{v} {u}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <p className="section-title" style={{ padding: "0 8px" }}>Particle Simulation — Gas Container</p>
          <canvas ref={canvasRef} width={640} height={320} style={{ width: "100%", height: 320, borderRadius: 8 }} />
        </div>
        <div className="card">
          <p className="section-title">PV Diagram (Isothermal Processes)</p>
          <svg width="100%" height="120" viewBox="0 0 600 120">
            <defs>
              <linearGradient id="pvGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={COLORS.accent} />
                <stop offset="100%" stopColor={COLORS.purple} />
              </linearGradient>
            </defs>
            {[300, 600, 1000].map((T, i) => {
              const pts = Array.from({ length: 50 }, (_, j) => {
                const V = 0.2 + j * 0.04;
                const P = (moles * R_gas * T) / (V * 1000);
                return { V, P: clamp(P, 0, 5) };
              });
              const color = [COLORS.accent, COLORS.gold, COLORS.red][i];
              const d = pts.map((p, j) => `${j === 0 ? "M" : "L"} ${p.V * 100} ${110 - p.P * 20}`).join(" ");
              return <g key={T}>
                <path d={d} fill="none" stroke={color + "99"} strokeWidth={1.5} />
                <text x={pts[49].V * 100 + 2} y={110 - pts[49].P * 20} fill={color} fontSize="9" fontFamily="JetBrains Mono">{T}K</text>
              </g>;
            })}
            {/* current point */}
            <circle cx={volume * 10} cy={110 - clamp((moles * R_gas * temp) / (volume / 1000) / 1000, 0, 5) * 20}
              r="5" fill={COLORS.accent} opacity="0.9" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── UNIT CONVERTER ───────────────────────────────────────────────────────────
function UnitConverter() {
  const conversions = {
    Length: { m: 1, km: 0.001, cm: 100, mm: 1000, ft: 3.281, inch: 39.37, mile: 0.000621, ly: 1.057e-16 },
    Mass: { kg: 1, g: 1000, mg: 1e6, lb: 2.205, oz: 35.27, ton: 0.001 },
    Time: { s: 1, ms: 1000, min: 1 / 60, h: 1 / 3600, day: 1 / 86400 },
    Force: { N: 1, kN: 0.001, dyn: 1e5, lbf: 0.2248 },
    Energy: { J: 1, kJ: 0.001, cal: 0.2388, kcal: 0.000239, eV: 6.242e18, kWh: 2.778e-7 },
    Velocity: { "m/s": 1, "km/h": 3.6, "mph": 2.237, "ft/s": 3.281, knot: 1.944 },
  };

  const [category, setCategory] = useState("Length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("km");
  const [value, setValue] = useState("1");

  const cats = Object.keys(conversions);
  const units = Object.keys(conversions[category]);
  const factor = conversions[category][fromUnit] || 1;
  const toFactor = conversions[category][toUnit] || 1;
  const result = round((parseFloat(value) || 0) / toFactor * factor, 6);

  return (
    <div className="animate-in" style={{ maxWidth: 600, margin: "0 auto" }}>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p className="section-title">Unit Converter</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {cats.map(c => (
            <button key={c} className={`btn ${category === c ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: 12 }} onClick={() => { setCategory(c); setFromUnit(Object.keys(conversions[c])[0]); setToUnit(Object.keys(conversions[c])[1]); }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center" }}>
          <div>
            <div className="section-title">From</div>
            <input type="number" value={value} onChange={e => setValue(e.target.value)}
              style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "10px 12px", fontFamily: "'JetBrains Mono'", fontSize: 18, outline: "none" }} />
            <select value={fromUnit} onChange={e => setFromUnit(e.target.value)}
              style={{ width: "100%", marginTop: 8, background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "8px", fontFamily: "'JetBrains Mono'", cursor: "pointer" }}>
              {units.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div style={{ fontSize: 24, color: COLORS.accent, fontWeight: 700, paddingTop: 24 }}>⇄</div>
          <div>
            <div className="section-title">To</div>
            <div style={{ width: "100%", background: COLORS.accent + "15", border: `1px solid ${COLORS.accent}44`, color: COLORS.accent, borderRadius: 8, padding: "10px 12px", fontFamily: "'JetBrains Mono'", fontSize: 18, minHeight: 44 }}>
              {result}
            </div>
            <select value={toUnit} onChange={e => setToUnit(e.target.value)}
              style={{ width: "100%", marginTop: 8, background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "8px", fontFamily: "'JetBrains Mono'", cursor: "pointer" }}>
              {units.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="formula-box">
          {value || 0} {fromUnit} = {result} {toUnit}
        </div>
        <div>
          <p className="section-title">Quick Reference — {category}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {units.map(u => (
              <div key={u} className="card-alt" style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", padding: "6px 10px" }}>
                <span style={{ color: COLORS.textMuted }}>1 {units[0]} = </span>
                <span style={{ color: COLORS.accent }}>{round(conversions[category][units[0]] / conversions[category][u], 4)} {u}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NEWTON'S LAWS MODULE ─────────────────────────────────────────────────────
function NewtonModule() {
  const [mass, setMass] = useState(5);
  const [force, setForce] = useState(20);
  const [friction, setFriction] = useState(0.2);
  const [law, setLaw] = useState(2);
  const [m1, setM1] = useState(3);
  const [m2, setM2] = useState(2);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const tRef = useRef(0);

  const g = 9.81;
  const netForce = force - friction * mass * g;
  const acc = round(netForce / mass, 3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "#1a2d4a44";
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 50) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (let gy = 0; gy < H; gy += 50) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

      if (law === 1) {
        // Inertia — object at rest or constant motion
        ctx.fillStyle = COLORS.textMuted;
        ctx.font = "14px 'Nunito'";
        ctx.fillText("Law of Inertia — Object at rest stays at rest unless acted on", 20, 30);
        const bx = 100 + posRef.current;
        const by = H / 2 - 20;
        ctx.fillStyle = COLORS.accent + "33";
        ctx.strokeStyle = COLORS.accent;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(bx, by, 60, 40, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = COLORS.accent;
        ctx.font = "bold 14px 'Rajdhani'";
        ctx.fillText(`${mass} kg`, bx + 14, by + 25);
        ctx.fillStyle = COLORS.textMuted;
        ctx.font = "12px 'JetBrains Mono'";
        ctx.fillText("No net force → constant velocity", 20, H - 20);
        posRef.current = (posRef.current + 0.8) % (W - 200);

      } else if (law === 2) {
        // F=ma
        const bx = 80 + posRef.current;
        const by = H / 2 - 25;
        // Ground
        ctx.strokeStyle = COLORS.border;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, by + 50); ctx.lineTo(W, by + 50); ctx.stroke();
        // Block
        ctx.fillStyle = COLORS.surfaceAlt;
        ctx.strokeStyle = COLORS.accent;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(bx, by, 70, 50, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = COLORS.text;
        ctx.font = "bold 14px 'Rajdhani'";
        ctx.fillText(`${mass} kg`, bx + 18, by + 30);
        // Force arrow
        const arrowLen = clamp(force * 3, 20, 150);
        ctx.strokeStyle = COLORS.gold;
        ctx.fillStyle = COLORS.gold;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(bx + 70, by + 25); ctx.lineTo(bx + 70 + arrowLen, by + 25); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx + 70 + arrowLen, by + 25);
        ctx.lineTo(bx + 70 + arrowLen - 10, by + 18);
        ctx.lineTo(bx + 70 + arrowLen - 10, by + 32);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = COLORS.gold;
        ctx.font = "12px 'JetBrains Mono'";
        ctx.fillText(`F=${force}N`, bx + 75, by + 16);
        // Friction arrow
        if (friction > 0) {
          ctx.strokeStyle = COLORS.red;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(bx, by + 25); ctx.lineTo(bx - 40, by + 25); ctx.stroke();
          ctx.fillStyle = COLORS.red;
          ctx.font = "11px 'JetBrains Mono'";
          ctx.fillText(`f=${round(friction * mass * g, 1)}N`, bx - 80, by + 22);
        }
        // Gravity arrow
        ctx.strokeStyle = COLORS.purple;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(bx + 35, by + 50); ctx.lineTo(bx + 35, by + 80); ctx.stroke();
        ctx.fillStyle = COLORS.purple;
        ctx.font = "11px 'JetBrains Mono'";
        ctx.fillText(`mg=${round(mass * g, 1)}N`, bx - 5, by + 92);
        // Normal arrow
        ctx.strokeStyle = COLORS.green;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(bx + 35, by); ctx.lineTo(bx + 35, by - 30); ctx.stroke();
        ctx.fillStyle = COLORS.green;
        ctx.font = "11px 'JetBrains Mono'";
        ctx.fillText(`N=${round(mass * g, 1)}N`, bx - 5, by - 35);
        // Acceleration label
        ctx.fillStyle = COLORS.text;
        ctx.font = "bold 13px 'JetBrains Mono'";
        ctx.fillText(`a = F_net/m = ${acc} m/s²`, 20, H - 20);

        if (netForce > 0) posRef.current = (posRef.current + Math.max(0, acc) * 0.15) % (W - 250);

      } else {
        // Newton's 3rd - Atwood machine
        const cx = W / 2;
        const pulleyY = 50;
        const ropeLen = H - 120;
        const maxDisp = ropeLen / 2 - 40;
        const aAtwood = round(((m1 - m2) * g) / (m1 + m2), 3);
        const t2 = tRef.current;
        const disp = clamp(0.5 * aAtwood * t2 * t2, -maxDisp, maxDisp);
        // Pulley
        ctx.strokeStyle = COLORS.border;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, pulleyY, 20, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = COLORS.surfaceAlt;
        ctx.fill();
        ctx.beginPath(); ctx.arc(cx, pulleyY, 6, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.accent; ctx.fill();
        // Ropes
        const y1 = pulleyY + 20 + maxDisp + disp;
        const y2 = pulleyY + 20 + maxDisp - disp;
        ctx.strokeStyle = COLORS.textMuted;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx - 10, pulleyY + 10); ctx.lineTo(cx - 10, y1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 10, pulleyY + 10); ctx.lineTo(cx + 10, y2); ctx.stroke();
        // Masses
        [[cx - 45, y1, m1, COLORS.accent], [cx - 25, y2, m2, COLORS.gold]].forEach(([x, y, m, c]) => {
          ctx.fillStyle = c + "33"; ctx.strokeStyle = c; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.roundRect(x, y, 50, 35, 6); ctx.fill(); ctx.stroke();
          ctx.fillStyle = c; ctx.font = "bold 13px 'Rajdhani'";
          ctx.fillText(`${m} kg`, x + 10, y + 22);
        });
        ctx.fillStyle = COLORS.text; ctx.font = "13px 'JetBrains Mono'";
        ctx.fillText(`a = (m₁-m₂)g/(m₁+m₂) = ${aAtwood} m/s²`, 20, H - 20);
        tRef.current += 0.05;
        if (Math.abs(disp) >= maxDisp - 1) tRef.current = 0;
      }
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [law, mass, force, friction, acc, netForce, m1, m2]);

  return (
    <div className="animate-in" style={{ display: "flex", gap: 16 }}>
      <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="card">
          <p className="section-title">Newton's Laws</p>
          {[
            [1, "1st Law — Inertia"],
            [2, "2nd Law — F = ma"],
            [3, "3rd Law — Action/Reaction"],
          ].map(([v, l]) => (
            <button key={v} className={`btn ${law === v ? "btn-primary" : "btn-secondary"}`}
              style={{ width: "100%", justifyContent: "flex-start", marginBottom: 6, fontSize: 12 }}
              onClick={() => { setLaw(v); posRef.current = 0; tRef.current = 0; }}>
              {l}
            </button>
          ))}
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p className="section-title">Parameters</p>
          {law === 2 && <>
            <Slider label="Mass" value={mass} min={1} max={20} step={1} unit=" kg" onChange={setMass} />
            <Slider label="Applied Force" value={force} min={0} max={100} step={1} unit=" N" onChange={setForce} />
            <Slider label="Friction Coeff." value={friction} min={0} max={1} step={0.05} onChange={setFriction} />
          </>}
          {law === 1 && <Slider label="Mass" value={mass} min={1} max={20} step={1} unit=" kg" onChange={setMass} />}
          {law === 3 && <>
            <Slider label="Mass 1" value={m1} min={1} max={10} step={0.5} unit=" kg" onChange={setM1} />
            <Slider label="Mass 2" value={m2} min={1} max={10} step={0.5} unit=" kg" onChange={setM2} />
          </>}
        </div>
        {law === 2 && (
          <div className="card">
            <p className="section-title">Force Breakdown</p>
            {[["Applied", force, "N", COLORS.gold], ["Friction", round(friction * mass * g, 2), "N", COLORS.red], ["Net Force", round(netForce, 2), "N", COLORS.accent], ["Acceleration", acc, "m/s²", COLORS.green]].map(([l, v, u, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono'", fontSize: 12, padding: "4px 0", borderBottom: `1px solid ${COLORS.border}44` }}>
                <span style={{ color: COLORS.textMuted }}>{l}</span>
                <span style={{ color: c }}>{v} {u}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div className="card" style={{ padding: 12 }}>
          <canvas ref={canvasRef} width={680} height={400} style={{ width: "100%", height: 400, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}

// ─── AI PHYSICS ASSISTANT ─────────────────────────────────────────────────────
function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI Physics Assistant. Ask me anything about classical physics — from Newton's laws to thermodynamics. I can explain concepts, solve equations step-by-step, and give you physical intuition behind the math." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const SYSTEM = `You are an expert physics professor and tutor specializing in classical physics. 
You help students understand physics through clear explanations, step-by-step solutions, and physical intuition.
When solving problems:
1. State the relevant formula(s)
2. Show substitution with actual numbers
3. Show intermediate steps
4. Give the final answer with units
5. Explain the physical meaning

Use LaTeX-like notation where helpful (e.g., F = ma, v² = u² + 2as).
Keep answers concise but thorough. Use "→" for steps. Be encouraging and enthusiastic about physics!`;

  const suggestions = [
    "Explain projectile motion with an example",
    "What is the difference between speed and velocity?",
    "A 5 kg ball is thrown at 20 m/s at 45°. Find range and max height.",
    "Explain Newton's 3rd law with a real example",
    "How does air resistance affect terminal velocity?",
    "Derive the kinematic equation v² = u² + 2as",
  ];

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const newMsgs = [...messages, { role: "user", content: msg }];
    setMessages(newMsgs);
    setLoading(true);
    endRef.current?.scrollIntoView({ behavior: "smooth" });

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM,
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't generate a response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div className="animate-in" style={{ display: "flex", gap: 16, height: "100%", minHeight: 500 }}>
      <div style={{ width: 220, flexShrink: 0 }}>
        <div className="card" style={{ position: "sticky", top: 0 }}>
          <p className="section-title">Quick Questions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {suggestions.map((s, i) => (
              <button key={i} className="btn btn-secondary"
                style={{ textAlign: "left", fontSize: 11, padding: "8px 12px", lineHeight: 1.4, whiteSpace: "normal", height: "auto", justifyContent: "flex-start" }}
                onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 480, paddingRight: 4 }}>
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role}`}>
                {m.role === "assistant" && <span className="tag">⚛ Physics AI</span>}
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="ai-msg assistant">
                <span className="tag">⚛ Physics AI</span>
                <div className="thinking"><span /><span /><span /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask a physics question..."
              style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "10px 14px", fontFamily: "'Nunito', sans-serif", fontSize: 14, outline: "none" }}
            />
            <button className="btn btn-primary" onClick={() => send()} disabled={loading}>
              {loading ? "..." : "Ask →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FORMULA REFERENCE ────────────────────────────────────────────────────────
function FormulaReference() {
  const [search, setSearch] = useState("");
  const formulas = [
    { cat: "Kinematics", name: "Velocity", eq: "v = u + at", vars: "v=final vel, u=initial vel, a=accel, t=time" },
    { cat: "Kinematics", name: "Displacement", eq: "s = ut + ½at²", vars: "s=displacement, u=initial vel, a=accel, t=time" },
    { cat: "Kinematics", name: "Velocity²", eq: "v² = u² + 2as", vars: "v=final, u=initial, a=accel, s=displacement" },
    { cat: "Kinematics", name: "Average velocity", eq: "v_avg = (u+v)/2", vars: "u=initial, v=final velocity" },
    { cat: "Projectile", name: "Range", eq: "R = v₀²·sin(2θ)/g", vars: "v₀=launch speed, θ=angle, g=gravity" },
    { cat: "Projectile", name: "Max Height", eq: "H = v₀²·sin²(θ)/(2g)", vars: "v₀=speed, θ=angle, g=9.81" },
    { cat: "Projectile", name: "Time of Flight", eq: "T = 2v₀·sin(θ)/g", vars: "v₀=speed, θ=angle, g=gravity" },
    { cat: "Forces", name: "Newton's 2nd Law", eq: "F = ma", vars: "F=force(N), m=mass(kg), a=acceleration(m/s²)" },
    { cat: "Forces", name: "Friction", eq: "f = μN", vars: "μ=coefficient of friction, N=normal force" },
    { cat: "Forces", name: "Gravitational Force", eq: "F = Gm₁m₂/r²", vars: "G=6.67×10⁻¹¹, m=masses, r=distance" },
    { cat: "Energy", name: "Kinetic Energy", eq: "KE = ½mv²", vars: "m=mass(kg), v=velocity(m/s)" },
    { cat: "Energy", name: "Potential Energy", eq: "PE = mgh", vars: "m=mass, g=9.81, h=height" },
    { cat: "Energy", name: "Work", eq: "W = F·d·cos(θ)", vars: "F=force, d=displacement, θ=angle between" },
    { cat: "Energy", name: "Power", eq: "P = W/t = Fv", vars: "W=work, t=time, F=force, v=velocity" },
    { cat: "Waves", name: "Wave Speed", eq: "v = fλ", vars: "f=frequency(Hz), λ=wavelength(m)" },
    { cat: "Waves", name: "Period", eq: "T = 1/f", vars: "T=period(s), f=frequency(Hz)" },
    { cat: "Waves", name: "Doppler Effect", eq: "f' = f(v±vₒ)/(v∓vₛ)", vars: "v=wave speed, vₒ=observer, vₛ=source speed" },
    { cat: "Thermodynamics", name: "Ideal Gas Law", eq: "PV = nRT", vars: "P=pressure, V=volume, n=moles, R=8.314, T=Kelvin" },
    { cat: "Thermodynamics", name: "Thermal Expansion", eq: "ΔL = αL₀ΔT", vars: "α=coeff, L₀=initial length, ΔT=temp change" },
    { cat: "Thermodynamics", name: "Heat Transfer", eq: "Q = mcΔT", vars: "m=mass, c=specific heat, ΔT=temperature change" },
    { cat: "Circular Motion", name: "Centripetal Force", eq: "F = mv²/r", vars: "m=mass, v=velocity, r=radius" },
    { cat: "Circular Motion", name: "Angular Velocity", eq: "ω = 2πf = v/r", vars: "f=frequency, v=speed, r=radius" },
    { cat: "Electromagnetism", name: "Coulomb's Law", eq: "F = kq₁q₂/r²", vars: "k=9×10⁹, q=charges, r=distance" },
    { cat: "Electromagnetism", name: "Ohm's Law", eq: "V = IR", vars: "V=voltage(V), I=current(A), R=resistance(Ω)" },
  ];

  const cats = [...new Set(formulas.map(f => f.cat))];
  const filtered = formulas.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.eq.toLowerCase().includes(search.toLowerCase()) ||
    f.cat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search formulas, topics, equations..."
          style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "12px 16px", fontFamily: "'Nunito', sans-serif", fontSize: 14, outline: "none" }} />
      </div>
      {(search ? [""] : cats).map(cat => {
        const items = search ? filtered : filtered.filter(f => f.cat === cat);
        if (!items.length) return null;
        return (
          <div key={cat} style={{ marginBottom: 20 }}>
            {!search && <p className="section-title">{cat}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
              {items.map((f, i) => (
                <div key={i} className="card-alt" style={{ cursor: "default" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Rajdhani'", fontWeight: 700, fontSize: 14 }}>{f.name}</span>
                    <span style={{ fontSize: 10, background: COLORS.accent + "22", color: COLORS.accent, padding: "2px 6px", borderRadius: 4, fontFamily: "'Rajdhani'" }}>{f.cat}</span>
                  </div>
                  <div className="formula-box" style={{ margin: "6px 0", padding: "8px 12px", fontSize: 14 }}>{f.eq}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.5 }}>{f.vars}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
const MODULES = [
  { id: "projectile", label: "Projectile", icon: "🎯" },
  { id: "newton", label: "Newton's Laws", icon: "⚖️" },
  { id: "waves", label: "Waves", icon: "〰️" },
  { id: "thermo", label: "Thermo", icon: "🌡️" },
  { id: "units", label: "Unit Converter", icon: "⇄" },
  { id: "formulas", label: "Formulas", icon: "📐" },
  { id: "ai", label: "AI Assistant", icon: "⚛" },
];

export default function App() {
  const [active, setActive] = useState("projectile");

  const renderModule = () => {
    switch (active) {
      case "projectile": return <ProjectileModule />;
      case "newton": return <NewtonModule />;
      case "waves": return <WaveModule />;
      case "thermo": return <ThermoModule />;
      case "units": return <UnitConverter />;
      case "formulas": return <FormulaReference />;
      case "ai": return <AIAssistant />;
      default: return null;
    }
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{
          background: COLORS.surface,
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          height: 60,
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: `0 4px 20px #00000066`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 15px ${COLORS.accent}55`,
              fontSize: 16,
            }}>⚛</div>
            <div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: 1, color: COLORS.text }}>
                PHYSICA
              </div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: COLORS.textMuted, fontFamily: "'JetBrains Mono'", marginTop: -2 }}>
                INTERACTIVE PHYSICS LAB
              </div>
            </div>
          </div>

          <nav style={{ display: "flex", gap: 2, marginLeft: 16 }}>
            {MODULES.map(m => (
              <button key={m.id} onClick={() => setActive(m.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 8,
                  background: active === m.id ? `${COLORS.accent}22` : "transparent",
                  border: active === m.id ? `1px solid ${COLORS.accent}55` : "1px solid transparent",
                  color: active === m.id ? COLORS.accent : COLORS.textMuted,
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 600, fontSize: 13, letterSpacing: 0.5,
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                <span style={{ fontSize: 14 }}>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green, boxShadow: `0 0 8px ${COLORS.green}` }} className="pulse" />
            <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "'JetBrains Mono'" }}>LIVE</span>
          </div>
        </header>

        {/* Module title bar */}
        <div style={{ background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}33`, padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{MODULES.find(m => m.id === active)?.icon}</span>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: 1 }}>
            {active === "projectile" && "Projectile Motion Simulator"}
            {active === "newton" && "Newton's Laws of Motion"}
            {active === "waves" && "Wave Mechanics & Interference"}
            {active === "thermo" && "Thermodynamics — Ideal Gas"}
            {active === "units" && "Unit Conversion System"}
            {active === "formulas" && "Physics Formula Reference"}
            {active === "ai" && "AI Physics Assistant"}
          </h1>
          <span style={{ marginLeft: 8, fontSize: 11, color: COLORS.textMuted, fontFamily: "'JetBrains Mono'", background: COLORS.surface, padding: "3px 10px", borderRadius: 20, border: `1px solid ${COLORS.border}` }}>
            {active === "projectile" && "Kinematics · Mechanics"}
            {active === "newton" && "Dynamics · Forces"}
            {active === "waves" && "Oscillations · Wave Optics"}
            {active === "thermo" && "Heat · Entropy · Gas Laws"}
            {active === "units" && "SI · Imperial · Scientific"}
            {active === "formulas" && "Quick Reference · All Topics"}
            {active === "ai" && "Powered by Claude AI"}
          </span>
        </div>

        {/* Main content */}
        <main style={{ flex: 1, padding: 20, overflowY: "auto" }}>
          {renderModule()}
        </main>

        {/* Footer */}
        <footer style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "'JetBrains Mono'" }}>
            PHYSICA — Interactive Physics Lab
          </span>
          <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "'JetBrains Mono'" }}>
            {new Date().getFullYear()} · All simulations run at 60 FPS
          </span>
        </footer>
      </div>
    </>
  );
}
