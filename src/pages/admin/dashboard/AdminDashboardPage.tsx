import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const kpiConfig = [
  {
    id: "users",
    label: "Active Users",
    base: 284712,
    fmt: (v: number) => (v / 1000).toFixed(1) + "K",
    change: +5.2,
    color: "var(--accent)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    id: "balance",
    label: "Total Balance",
    base: 92840500,
    fmt: (v: number) => "$" + (v / 1e6).toFixed(2) + "M",
    change: +2.8,
    color: "var(--accent-3)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  {
    id: "txns",
    label: "Transactions Today",
    base: 18341,
    fmt: (v: number) => v.toLocaleString(),
    change: +12.1,
    color: "var(--accent-2)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>,
  },
  {
    id: "revenue",
    label: "Revenue",
    base: 1284300,
    fmt: (v: number) => "$" + (v / 1000).toFixed(0) + "K",
    change: +8.4,
    color: "#d97706",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  },
  {
    id: "fraud",
    label: "Fraud Alerts",
    base: 37,
    fmt: (v: number) => v.toFixed(0),
    change: -18.3,
    color: "var(--accent-danger)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  },
];

const feedNames = ["Sarah K.", "Omar T.", "Priya M.", "James L.", "Nadia R.", "Chen W.", "Ivan P.", "Aisha B."];
const feedTypes = [
  { label: "Transfer", color: "var(--accent)", sign: "-" },
  { label: "Deposit", color: "var(--accent-3)", sign: "+" },
  { label: "Withdrawal", color: "var(--accent-warn)", sign: "-" },
  { label: "Flagged", color: "var(--accent-danger)", sign: "!" },
];

function genFeedEvent() {
  const type = feedTypes[Math.floor(Math.random() * feedTypes.length)];
  const name = feedNames[Math.floor(Math.random() * feedNames.length)];
  const amt = (Math.random() * 4900 + 100).toFixed(2);
  return { type, name, amt, ts: new Date() };
}

const AdminDashboardPage: React.FC = () => {
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const sparkRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const [kpiValues, setKpiValues] = useState<Record<string, number>>({});
  const [sparkHistory, setSparkHistory] = useState<Record<string, number[]>>({});
  const [feedEvents, setFeedEvents] = useState<any[]>([]);
  const [kpiClasses, setKpiClasses] = useState<Record<string, string>>({});

  const chartInstances = useRef<{ bar: any, line: any }>({ bar: null, line: null });
  const chartData = useRef({
    barData: [120, 85, 65, 140, 920, 1840, 2100, 1950, 2340, 2810, 1780, 980],
    lineData: Array.from({ length: 30 }, (_, i) => 30000 + Math.sin(i * 0.4) * 8000 + Math.random() * 5000 + i * 1200)
  });

  // Init data
  useEffect(() => {
    const initialKpis: Record<string, number> = {};
    const initialSparks: Record<string, number[]> = {};
    kpiConfig.forEach(k => {
      initialKpis[k.id] = k.base;
      initialSparks[k.id] = Array.from({ length: 12 }, () => k.base * (0.85 + Math.random() * 0.3));
    });
    setKpiValues(initialKpis);
    setSparkHistory(initialSparks);

    const events = [];
    for (let i = 0; i < 6; i++) events.push(genFeedEvent());
    setFeedEvents(events);
  }, []);

  // Charts initialization
  useEffect(() => {
    if (!barChartRef.current || !lineChartRef.current) return;

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    const labelColor = isDark ? "#7b8fad" : "#9aabb8";

    // Bar Chart
    const barCtx = barChartRef.current.getContext("2d");
    if (barCtx) {
      const barGrad = barCtx.createLinearGradient(0, 0, 0, 200);
      barGrad.addColorStop(0, isDark ? "rgba(91,200,245,0.75)" : "rgba(37,99,235,0.75)");
      barGrad.addColorStop(1, isDark ? "rgba(157,126,245,0.25)" : "rgba(124,58,237,0.2)");

      if (chartInstances.current.bar) chartInstances.current.bar.destroy();
      chartInstances.current.bar = new Chart(barChartRef.current, {
        type: "bar",
        data: {
          labels: ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"],
          datasets: [{
            label: "Transactions",
            data: chartData.current.barData,
            backgroundColor: barGrad,
            borderRadius: 6,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: labelColor, font: { family: "JetBrains Mono", size: 10 } } },
            y: { grid: { color: gridColor }, ticks: { color: labelColor, font: { family: "JetBrains Mono", size: 10 } } },
          },
          animation: { duration: 350 },
        },
      });
    }

    // Line Chart
    const lineCtx = lineChartRef.current.getContext("2d");
    if (lineCtx) {
      const lineGrad = lineCtx.createLinearGradient(0, 0, 0, 200);
      lineGrad.addColorStop(0, isDark ? "rgba(47,212,160,0.28)" : "rgba(5,150,105,0.2)");
      lineGrad.addColorStop(1, "rgba(5,150,105,0)");

      if (chartInstances.current.line) chartInstances.current.line.destroy();
      chartInstances.current.line = new Chart(lineChartRef.current, {
        type: "line",
        data: {
          labels: Array.from({ length: 30 }, (_, i) => `D${i + 1}`),
          datasets: [{
            label: "Revenue",
            data: chartData.current.lineData,
            borderColor: isDark ? "#2fd4a0" : "#059669",
            backgroundColor: lineGrad,
            borderWidth: 2.5,
            pointRadius: 0,
            tension: 0.45,
            fill: true,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: labelColor, font: { family: "JetBrains Mono", size: 10 }, maxTicksLimit: 8 } },
            y: { grid: { color: gridColor }, ticks: { color: labelColor, font: { family: "JetBrains Mono", size: 10 }, callback: (v: any) => "$" + (v / 1000).toFixed(0) + "K" } },
          },
          animation: { duration: 500 },
        },
      });
    }

    return () => {
      if (chartInstances.current.bar) chartInstances.current.bar.destroy();
      if (chartInstances.current.line) chartInstances.current.line.destroy();
    };
  }, []);

  // Sparklines draw
  useEffect(() => {
    kpiConfig.forEach((k, idx) => {
      const canvas = sparkRefs.current[idx];
      if (!canvas) return;
      const data = sparkHistory[k.id] || [];
      if (data.length === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
      const pts = data.map((v, i) => ({
        x: (i / (data.length - 1)) * W,
        y: H - ((v - min) / range) * (H * 0.8) - H * 0.1,
      }));

      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      let resolved = k.color;
      if (k.color.startsWith("var")) {
        const val = getComputedStyle(document.documentElement).getPropertyValue(k.color.slice(4, -1).trim());
        if (val) resolved = val.trim();
      }

      ctx.beginPath();
      ctx.moveTo(pts[0].x, H);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, H);
      ctx.closePath();
      ctx.fillStyle = resolved + "18";
      ctx.fill();

      ctx.beginPath();
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = resolved;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();
    });
  }, [sparkHistory]);

  // Simulation loop
  useEffect(() => {
    const simInterval = setInterval(() => {
      setKpiValues(prevVals => {
        const nextVals = { ...prevVals };
        const nextClasses: Record<string, string> = {};
        kpiConfig.forEach(k => {
          if (prevVals[k.id] === undefined) return;
          const delta = k.base * (Math.random() * 0.006 - 0.001);
          nextVals[k.id] = Math.max(0, prevVals[k.id] + delta);
          nextClasses[k.id] = delta >= 0 ? 'up' : 'down';
          
          setSparkHistory(prevSpark => {
            const arr = prevSpark[k.id] ? [...prevSpark[k.id]] : [];
            arr.push(nextVals[k.id]);
            if (arr.length > 12) arr.shift();
            return { ...prevSpark, [k.id]: arr };
          });
        });
        
        setKpiClasses(nextClasses);
        setTimeout(() => setKpiClasses({}), 800);
        return nextVals;
      });

      // Update charts data
      const hourIdx = Math.floor(Math.random() * chartData.current.barData.length);
      chartData.current.barData[hourIdx] = Math.max(50, chartData.current.barData[hourIdx] + (Math.random() * 200 - 80));
      
      const lastLine = chartData.current.lineData[chartData.current.lineData.length - 1];
      chartData.current.lineData.push(lastLine * (1 + (Math.random() * 0.06 - 0.02)));
      chartData.current.lineData.shift();

      if (chartInstances.current.bar) {
        chartInstances.current.bar.data.datasets[0].data = [...chartData.current.barData];
        chartInstances.current.bar.update("none");
      }
      if (chartInstances.current.line) {
        chartInstances.current.line.data.datasets[0].data = [...chartData.current.lineData];
        chartInstances.current.line.update("none");
      }

      setFeedEvents(prev => {
        const newEvents = [genFeedEvent(), ...prev];
        if (newEvents.length > 8) newEvents.pop();
        return newEvents;
      });
    }, 4000);

    return () => clearInterval(simInterval);
  }, []);

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Real-time system overview and activity</p>
      </div>

      <div className="grid-5" style={{ marginBottom: '20px' }}>
        {kpiConfig.map((k, idx) => {
          const val = kpiValues[k.id] || k.base;
          const kpiClass = kpiClasses[k.id] || '';
          return (
            <div className="kpi-card" key={k.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${k.color}14`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {k.icon}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>{k.label}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <div id={`kpi-val-${k.id}`} className={`kpi-value ${kpiClass}`} style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {k.fmt(val)}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`trend-badge ${k.change >= 0 ? 'trend-up' : 'trend-down'}`}>
                      {k.change >= 0 ? '↗' : '↘'} {Math.abs(k.change)}%
                    </span>
                  </div>
                </div>
                <canvas 
                  ref={el => sparkRefs.current[idx] = el}
                  id={`spark-${k.id}`} 
                  width="70" 
                  height="35" 
                  style={{ display: 'block', marginRight: '-5px' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-bottom">
        <div className="admin-card" style={{ padding: '20px' }}>
          <div className="section-title">System Pulse</div>
          <div className="pulse-grid">
            <div style={{ background: 'var(--bg-base)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>API HEALTH</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-3)' }}></div>
                <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>99.98%</span>
              </div>
            </div>
            <div style={{ background: 'var(--bg-base)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>SERVER LOAD</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-warn)' }}></div>
                <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>42%</span>
              </div>
            </div>
            <div style={{ background: 'var(--bg-base)', padding: '16px', borderRadius: 'var(--radius-md)', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>DATABASE SYNC</span>
                <span style={{ color: 'var(--accent)' }}>Active</span>
              </div>
              <div className="risk-bar">
                <div className="risk-fill" style={{ width: '100%', background: 'var(--accent)' }}></div>
              </div>
            </div>
          </div>
          
          <div className="section-title" style={{ marginTop: '24px' }}>Live Activity</div>
          <div id="live-feed">
            {feedEvents.slice(0, 6).map((e, i) => (
              <div className="feed-item" style={{ animationDelay: `${i * 0.04}s` }} key={i}>
                <span className="feed-dot" style={{ background: e.type.color }}></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{e.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {e.type.label} · {e.ts.toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', fontWeight: 700, color: e.type.color, flexShrink: 0 }}>
                  {e.type.sign}${e.amt}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <div className="admin-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="section-title" style={{ margin: 0 }}>Revenue Growth</div>
              <div className="admin-badge badge-green">Q3 Target: 85%</div>
            </div>
            <div className="chart-wrap">
              <canvas id="lineChart" ref={lineChartRef}></canvas>
            </div>
          </div>
          <div className="admin-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="section-title" style={{ margin: 0 }}>Hourly Transaction Volume</div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Last 24h</span>
            </div>
            <div className="chart-wrap">
              <canvas id="barChart" ref={barChartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
