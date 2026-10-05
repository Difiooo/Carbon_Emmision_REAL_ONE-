import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Leaf,
  Car,
  Utensils,
  Zap,
  Plus,
  LayoutGrid,
  Layers,
  Target,
  History,
  Trash2,
  Activity,
  ArrowRight,
  Truck,
  Server,
  Laptop,
  Users,
  Building2,
  Lightbulb,
  FileText,
  TrendingUp,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  HelpCircle,
  Moon,
  Sun,
  Home,
  ChevronRight,
  MoreVertical,
  Info,
  Link2,
  Database,
  Sparkles,
  AlertTriangle,
  FlaskConical,
  X,
} from "lucide-react";
import "./Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip);

const API_BASE_URL = "https://carbon-emmision-real-one.onrender.com";
const API_URL = `${API_BASE_URL}/api/activities`;

/* ------------------------------------------------------------------ */
/* Static config                                                       */
/* ------------------------------------------------------------------ */

const activityOptions = {
  transport: [
    { value: "car", label: "Car", unit: "kilometres" },
    { value: "bus", label: "Bus", unit: "kilometres" },
    { value: "motorcycle", label: "Motorcycle", unit: "kilometres" },
  ],
  food: [
    { value: "vegetarian", label: "Vegetarian meal", unit: "servings" },
    { value: "meat", label: "Meat meal", unit: "servings" },
  ],
  energy: [{ value: "electricity", label: "Electricity", unit: "kWh" }],
};

const categories = [
  { value: "transport", label: "Transportation", short: "Transport", note: "(Cars, buses, bikes)", Icon: Car, color: "#ea6a6a" },
  { value: "food", label: "Food", short: "Food", note: "(Meals, groceries)", Icon: Utensils, color: "#f4a37c" },
  { value: "energy", label: "Energy", short: "Energy", note: "(Electricity)", Icon: Zap, color: "#efcfae" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Sidebar structure. Only items with a `page` are wired up – the rest are
// visual placeholders until you build those pages.
const sidebarGroups = [
  {
    title: "Dashboard",
    items: [
      { label: "Overview", Icon: LayoutGrid, page: "dashboard" },
      { label: "Carbon by Source", Icon: Layers },
      { label: "Activity History", Icon: History, page: "history" },
    ],
  },
  {
    title: "Sources",
    items: [
      { label: "Energy", Icon: Zap },
      { label: "Transportation", Icon: Car },
      { label: "Supply Chain", Icon: Truck },
      { label: "Digital Infrastructure", Icon: Server },
      { label: "Remote Work", Icon: Laptop },
    ],
  },
  {
    title: "Goals & Reduction Plan",
    items: [
      { label: "Company Goals", Icon: Building2 },
      { label: "Department Goals", Icon: Users },
      { label: "Suggestions", Icon: Lightbulb },
    ],
  },
];

const sidebarFooter = [
  { label: "Reports & Exports", Icon: FileText },
  { label: "Insights & Forecasting", Icon: TrendingUp },
  { label: "Team & Settings", Icon: Settings },
];

// Demo data – replace with a /api/goals call when your backend has one.
const goals = [
  { title: "Cut energy use by 20%", status: "On Track", tone: "good", due: "Sep 2026", progress: 40 },
  { title: "Reduce transport CO₂", status: "Needs Review", tone: "warn", due: "Jan 2027", progress: 60 },
  { title: "Offset via X project", status: "Behind", tone: "bad", due: "Ongoing", progress: 30 },
];

const insightTabs = [
  { id: "predictive", label: "Predictive Insights" },
  { id: "recommend", label: "AI Recommendations" },
  { id: "anomaly", label: "Anomaly Alerts" },
  { id: "whatif", label: "What-if Simulator" },
];

const defaultTypes = {
  transport: "car",
  food: "vegetarian",
  energy: "electricity",
};

const fmt = (n) => Number(n || 0).toFixed(2);

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

function Dashboard() {
  const [activities, setActivities] = useState([]);
  const [activePage, setActivePage] = useState("dashboard");
  const [activeSection, setActiveSection] = useState("Overview");
  const [sourceFilter, setSourceFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("light");
  const [collapsed, setCollapsed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [insightTab, setInsightTab] = useState("predictive");
  const [selectedPeriod, setSelectedPeriod] = useState("6 M");
  const [reduction, setReduction] = useState(20);
  const [form, setForm] = useState({
    category: "transport",
    type: "car",
    quantity: "",
  });

  /* ---------- load from backend ---------- */
  useEffect(() => {
    async function loadActivities() {
      try {
        setError("");
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Could not load activities from the backend.");
        }
        const data = await response.json();
        setActivities(
          data.map((a) => ({
            ...a,
            id: Number(a.id),
            quantity: Number(a.quantity),
            emission: Number(a.emission),
          }))
        );
      } catch (err) {
        console.error("Loading activities failed:", err);
        setError(
          "Could not connect to the backend. Make sure the server is running at localhost:5000."
        );
      } finally {
        setLoading(false);
      }
    }
    loadActivities();
  }, []);

  /* ---------- derived data ---------- */
  const total = useMemo(
    () => activities.reduce((s, a) => s + Number(a.emission || 0), 0),
    [activities]
  );

  const categoryTotals = useMemo(() => {
    const t = { transport: 0, food: 0, energy: 0 };
    activities.forEach((a) => {
      if (Object.hasOwn(t, a.category)) t[a.category] += Number(a.emission || 0);
    });
    return t;
  }, [activities]);

  const weekdayTotals = useMemo(
    () =>
      weekDays.map((day) =>
        activities
          .filter((a) => a.day === day)
          .reduce((s, a) => s + Number(a.emission || 0), 0)
      ),
    [activities]
  );

  const topCategory = useMemo(() => {
    const sorted = [...categories].sort(
      (a, b) => categoryTotals[b.value] - categoryTotals[a.value]
    );
    return categoryTotals[sorted[0].value] > 0 ? sorted[0] : null;
  }, [categoryTotals]);

  const avgPerActivity = activities.length ? total / activities.length : 0;
  const visibleActivities = sourceFilter ? activities.filter((a) => a.category === sourceFilter) : activities;

  function openSection(label) {
    setActiveSection(label);
    const source = { Energy: "energy", Transportation: "transport", Food: "food" }[label];
    if (label === "Overview") { setSourceFilter(""); setActivePage("dashboard"); return; }
    if (label === "Activity History" || label === "Reports & Exports" || source || ["Supply Chain", "Digital Infrastructure", "Remote Work"].includes(label)) {
      setSourceFilter(source || (label === "Activity History" || label === "Reports & Exports" ? "" : "__unavailable__"));
      setActivePage("history"); return;
    }
    setActivePage("dashboard");
    if (label === "Suggestions" || label === "Insights & Forecasting") setInsightTab(label === "Suggestions" ? "recommend" : "predictive");
    const target = label.includes("Goal") ? "goals-card" : label === "Suggestions" || label === "Insights & Forecasting" ? "forecast-card" : label === "Carbon by Source" ? "breakdown-card" : "";
    if (target) requestAnimationFrame(() => document.querySelector(`.${target}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    if (label === "Team & Settings") setTheme((value) => value === "light" ? "dark" : "light");
  }
  const anomalies = activities.filter(
    (a) => avgPerActivity > 0 && Number(a.emission) > avgPerActivity * 2
  );

  const nonZeroDays = weekdayTotals.filter((v) => v > 0);
  const weekdayAverage = nonZeroDays.length
    ? nonZeroDays.reduce((s, v) => s + v, 0) / nonZeroDays.length
    : 0;

  const selectedOption = activityOptions[form.category].find(
    (o) => o.value === form.type
  );

  /* ---------- chart config ---------- */
  const barData = {
    labels: weekDays,
    datasets: [
      {
        data: weekdayTotals,
        // One vertical gradient spanning the whole plot area (green → amber → red)
        backgroundColor: (context) => {
          const { chart } = context;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "#8bd43a";
          const g = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          g.addColorStop(0, "#7fd33b");
          g.addColorStop(0.5, "#f5c04a");
          g.addColorStop(1, "#ea6a6a");
          return g;
        },
        borderRadius: 7,
        borderSkipped: false,
        maxBarThickness: 22,
      },
    ],
  };

  // Draws the dashed "Average" line + pill, like the "Target" line in the design
  const averageLinePlugin = {
    id: "averageLine",
    afterDatasetsDraw(chart) {
      if (!weekdayAverage) return;
      const { ctx, chartArea, scales } = chart;
      const y = scales.y.getPixelForValue(weekdayAverage);
      if (y < chartArea.top || y > chartArea.bottom) return;
      ctx.save();
      ctx.strokeStyle = "#6b6b6b";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartArea.left, y);
      ctx.lineTo(chartArea.right, y);
      ctx.stroke();
      const label = "Average";
      ctx.font = "600 10px 'Plus Jakarta Sans', sans-serif";
      const w = ctx.measureText(label).width + 14;
      ctx.fillStyle = "#1c1c1c";
      ctx.beginPath();
      ctx.roundRect(chartArea.right - w, y - 9, w, 18, 9);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "middle";
      ctx.fillText(label, chartArea.right - w + 7, y + 0.5);
      ctx.restore();
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1c1c1c",
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: (c) => `${fmt(c.parsed.y)} kg CO₂e`,
        },
      },
    },
    scales: {
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: { color: "#8a8a8a", font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: "rgba(128,128,128,0.15)", drawTicks: false },
        ticks: { color: "#8a8a8a", padding: 8, font: { size: 10 } },
      },
    },
  };

  const hasBreakdown = total > 0;
  const doughnutData = {
    labels: categories.map((c) => c.short),
    datasets: [
      {
        data: hasBreakdown ? categories.map((c) => categoryTotals[c.value]) : [1],
        backgroundColor: hasBreakdown
          ? categories.map((c) => c.color)
          : ["rgba(128,128,128,0.18)"],
        borderWidth: 3,
        borderColor: theme === "dark" ? "#1b1d1b" : "#ffffff",
        borderRadius: 6,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "58%",
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: hasBreakdown,
        callbacks: { label: (c) => ` ${fmt(c.parsed)} kg CO₂e` },
      },
    },
  };

  /* ---------- actions ---------- */
  function changeCategory(category) {
    setForm((p) => ({ ...p, category, type: defaultTypes[category] }));
  }

  async function addActivity(event) {
    event.preventDefault();
    const quantity = Number(form.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Please enter a quantity greater than zero.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: form.category, type: form.type, quantity }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save this activity.");

      setActivities((p) => [
        {
          ...data,
          id: Number(data.id),
          quantity: Number(data.quantity),
          emission: Number(data.emission),
        },
        ...p,
      ]);
      setForm((p) => ({ ...p, quantity: "" }));
      setModalOpen(false);
    } catch (err) {
      console.error("Adding activity failed:", err);
      setError(err.message || "Could not save activity. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteActivity(id) {
    try {
      setDeletingId(id);
      setError("");
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete this activity.");
      setActivities((p) => p.filter((a) => a.id !== Number(id)));
    } catch (err) {
      console.error("Deleting activity failed:", err);
      setError(err.message || "Could not delete activity. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  /* ---------- small render helpers ---------- */
  function renderActivityList(items) {
    if (loading) {
      return (
        <div className="empty-state">
          <Activity size={26} />
          <p>Loading your activities...</p>
        </div>
      );
    }
    if (items.length === 0) {
      return (
        <div className="empty-state">
          <Leaf size={26} />
          <p>No activities yet</p>
          <span>Add your first activity to start tracking your footprint.</span>
        </div>
      );
    }
    return (
      <div className="activity-list">
        {items.map((a) => {
          const cat = categories.find((c) => c.value === a.category);
          const Icon = cat?.Icon || Leaf;
          const typeLabel =
            activityOptions[a.category]?.find((o) => o.value === a.type)?.label || a.type;
          return (
            <article className="activity-item" key={a.id}>
              <div className="activity-icon" style={{ background: cat?.color }}>
                <Icon size={18} />
              </div>
              <div className="activity-info">
                <strong>{typeLabel}</strong>
                <span>
                  {a.quantity} units{a.date ? ` · ${a.date}` : ""}
                </span>
              </div>
              <strong className="activity-emission">
                {fmt(a.emission)} <span>kg CO₂e</span>
              </strong>
              <button
                type="button"
                className="icon-btn danger"
                onClick={() => deleteActivity(a.id)}
                disabled={deletingId === a.id}
                aria-label={`Delete ${typeLabel} activity`}
                title="Delete activity"
              >
                <Trash2 size={16} />
              </button>
            </article>
          );
        })}
      </div>
    );
  }

  function renderInsights() {
    if (insightTab === "whatif") {
      const target = topCategory ? topCategory.short : "your top source";
      const saved = topCategory ? (categoryTotals[topCategory.value] * reduction) / 100 : 0;
      return (
        <div className="whatif">
          <label htmlFor="reduction">
            If you cut <strong>{target}</strong> emissions by <strong>{reduction}%</strong>…
          </label>
          <input
            id="reduction"
            type="range"
            min="0"
            max="100"
            step="5"
            value={reduction}
            onChange={(e) => setReduction(Number(e.target.value))}
          />
          <p>
            You would save <strong>{fmt(saved)} kg CO₂e</strong> and your total would drop from{" "}
            {fmt(total)} to <strong>{fmt(total - saved)} kg</strong>.
          </p>
        </div>
      );
    }

    let rows = [];
    if (insightTab === "predictive") {
      rows = [
        {
          Icon: TrendingUp,
          title: "Biggest contributor",
          text: topCategory
            ? `${topCategory.label} makes up ${Math.round((categoryTotals[topCategory.value] / total) * 100)}% of your recorded emissions.`
            : "Log some activities to see which source dominates.",
          action: "Add activity",
          onAction: () => setModalOpen(true),
        },
        {
          Icon: Target,
          title: "Average per activity",
          text: `Each logged activity emits about ${fmt(avgPerActivity)} kg CO₂e on average.`,
          action: "History",
          onAction: () => setActivePage("history"),
        },
        {
          Icon: Activity,
          title: "Highest day",
          text: nonZeroDays.length
            ? `${weekDays[weekdayTotals.indexOf(Math.max(...weekdayTotals))]} has your highest emissions (${fmt(Math.max(...weekdayTotals))} kg).`
            : "No weekday data yet.",
          action: "View chart",
          onAction: () => document.querySelector(".trend-card")?.scrollIntoView({ behavior: "smooth", block: "center" }),
        },
      ];
    } else if (insightTab === "recommend") {
      const tips = {
        transport: "Swap one car trip a week for the bus or a shared ride.",
        food: "Replace a meat meal with a vegetarian one a few times a week.",
        energy: "Switch off standby devices and move heavy usage off-peak.",
      };
      rows = categories.map((c) => ({
        Icon: Sparkles,
        title: `Lower your ${c.short.toLowerCase()} footprint`,
        text: tips[c.value],
        action: "Try it",
        onAction: () => setModalOpen(true),
      }));
    } else {
      rows = anomalies.length
        ? anomalies.slice(0, 3).map((a) => ({
            Icon: AlertTriangle,
            title: `Unusually high ${a.type}`,
            text: `${fmt(a.emission)} kg is more than double your average (${fmt(avgPerActivity)} kg).`,
            action: "Review",
            onAction: () => setActivePage("history"),
          }))
        : [
            {
              Icon: Sparkles,
              title: "No anomalies found",
              text: "None of your activities stand out from your usual pattern.",
              action: "",
            },
          ];
    }

    return (
      <ul className="insight-list">
        {rows.map((r) => (
          <li key={r.title}>
            <r.Icon size={18} className="insight-icon" />
            <div>
              <strong>{r.title}</strong>
              <span>{r.text}</span>
            </div>
            {r.action && (
              <button type="button" className="link-btn" onClick={r.onAction}>
                {r.action}
              </button>
            )}
          </li>
        ))}
      </ul>
    );
  }

  /* ---------- layout ---------- */
  return (
    <div className={`cb-app ${theme} ${collapsed ? "is-collapsed" : ""}`}>
      {/* ===== Sidebar ===== */}
      <aside className="cb-sidebar" aria-label="Sidebar">
        <div className="cb-sidebar-head">
          <span className="cb-logo">Carbonlytics</span>
          <button
            type="button"
            className="icon-btn plain"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav className="cb-nav">
          {sidebarGroups.map((group) => (
            <div className="cb-nav-group" key={group.title}>
              <p className="cb-nav-title">{group.title}</p>
              {group.items.map(({ label, Icon, page }) => (
                <button
                  type="button"
                  key={label}
                  className={`cb-nav-item ${activeSection === label ? "active" : ""}`}
                  onClick={() => openSection(label)}
                  title={label}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="cb-nav-footer">
          {sidebarFooter.map(({ label, Icon }) => (
            <button type="button" className={`cb-nav-item ${activeSection === label ? "active" : ""}`} key={label} title={label} onClick={() => openSection(label)}>
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ===== Main ===== */}
      <div className="cb-main">
        <header className="cb-topbar">
          <div className="cb-crumbs">
            <Home size={14} />
            <span>/</span>
            <span>Dashboard</span>
            <span>/</span>
            <strong>{activeSection}</strong>
          </div>

          <div className="cb-topbar-right">
            <button type="button" className="icon-btn plain" aria-label="Help" onClick={() => openSection("Suggestions")}>
              <HelpCircle size={17} />
            </button>
            <button type="button" className="icon-btn plain" aria-label="Notifications" onClick={() => openSection("Activity History")}>
              <Bell size={17} />
            </button>

            <div className="theme-toggle" role="group" aria-label="Theme">
              <button
                type="button"
                className={theme === "dark" ? "on" : ""}
                onClick={() => setTheme("dark")}
                aria-label="Dark theme"
              >
                <Moon size={14} />
              </button>
              <button
                type="button"
                className={theme === "light" ? "on" : ""}
                onClick={() => setTheme("light")}
                aria-label="Light theme"
              >
                <Sun size={14} />
              </button>
            </div>

            <div className="cb-profile">
              <span className="avatar">F</span>
              <div>
                <strong>Fluxio Design</strong>
                <small>fluxio.agency@gmail.com</small>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div role="alert" className="backend-error">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
              <X size={14} />
            </button>
          </div>
        )}

        <main className="cb-content">
          <div className="cb-title-row">
            <h1>{activeSection}</h1>
            <div className="cb-quick-actions">
              <button type="button" className="quick-btn" onClick={() => setModalOpen(true)} aria-label="Add activity" title="Add activity">
                <Plus size={20} />
              </button>
              <button type="button" className="quick-btn" onClick={() => openSection("Company Goals")} aria-label="Goals" title="Goals">
                <Target size={20} />
              </button>
              <button type="button" className="quick-btn" onClick={() => openSection("Carbon by Source")} aria-label="Integrations" title="Carbon by Source">
                <Link2 size={20} />
              </button>
              <button type="button" className="quick-btn" onClick={() => openSection("Energy")} aria-label="Data sources" title="Energy source">
                <Database size={20} />
              </button>
            </div>
          </div>

          {activePage === "dashboard" ? (
            <div className="cb-grid">
              {/* --- stat cards --- */}
              <div className="cb-stats">
                <section className="card stat-card">
                  <div>
                    <p className="stat-label">Total CO₂ Emitted</p>
                    <p className="stat-sub">{activities.length} recorded {activities.length === 1 ? "activity" : "activities"}</p>
                    <p className="stat-value">
                      {total.toFixed(1)} <span>kg</span>
                    </p>
                  </div>
                  <button type="button" className="lime-btn" onClick={() => openSection("Activity History")}>
                    Go to History <ArrowRight size={14} />
                  </button>
                </section>

                <section className="card stat-card">
                  <div>
                    <p className="stat-label">Top Source</p>
                    <p className="stat-sub">Highest share of emissions</p>
                    <p className="stat-value small">
                      {topCategory ? topCategory.short : "—"}
                    </p>
                  </div>
                  <button type="button" className="lime-btn" onClick={() => { openSection("Suggestions"); document.querySelector(".forecast-card")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>
                    See Tips <ArrowRight size={14} />
                  </button>
                </section>

                <section className="card stat-card">
                  <div>
                    <p className="stat-label">Activities Logged</p>
                    <p className="stat-sub">Across all sources</p>
                    <p className="stat-value">
                      {activities.length} <span>entries</span>
                    </p>
                  </div>
                  <button type="button" className="lime-btn" onClick={() => setModalOpen(true)}>
                    Add Activity <ArrowRight size={14} />
                  </button>
                </section>
              </div>

              {/* --- trend --- */}
              <section className="card trend-card">
                <div className="card-head">
                  <h2>
                    Emissions Trend <Info size={13} />
                  </h2>
                  <button type="button" className="icon-btn" aria-label="More options" onClick={() => openSection("Insights & Forecasting")}>
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div className="chip-row">
                  {["30 D", "3 M", "6 M", "1 Y", "Custom"].map((c) => (
                    <button type="button" key={c} className={`chip ${c === selectedPeriod ? "on" : ""}`} onClick={() => setSelectedPeriod(c)} aria-pressed={c === selectedPeriod}>{c}</button>
                  ))}
                </div>
                <div className="chart-box">
                  <Bar data={barData} options={barOptions} plugins={[averageLinePlugin]} />
                </div>
                <div className="legend-row">
                  <span><i style={{ background: "#7fd33b" }} />Low Emissions</span>
                  <span><i style={{ background: "#f5c04a" }} />Needs Attention</span>
                  <span><i style={{ background: "#ea6a6a" }} />High Emissions</span>
                  <span><i style={{ background: "#1c1c1c" }} />Average</span>
                </div>
              </section>

              {/* --- breakdown --- */}
              <section className="card breakdown-card">
                <div className="card-head">
                  <h2>
                    Source Breakdown <Info size={13} />
                  </h2>
                  <button type="button" className="icon-btn" aria-label="More options" onClick={() => openSection("Insights & Forecasting")}>
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div className="donut-box">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
                <ul className="breakdown-legend">
                  {categories.map((c) => (
                    <li key={c.value}>
                      <span className="dot" style={{ background: c.color }} />
                      <span className="name">
                        {c.short}: {total > 0 ? Math.round((categoryTotals[c.value] / total) * 100) : 0}%
                      </span>
                      <span className="note">{c.note}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* --- forecast --- */}
              <section className="card forecast-card">
                <div className="card-head">
                  <h2>
                    Smart Forecast & Insights <Info size={13} />
                  </h2>
                  <button type="button" className="icon-btn" aria-label="More options" onClick={() => openSection("Insights & Forecasting")}>
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div className="tab-row" role="tablist">
                  {insightTabs.map((t) => (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={insightTab === t.id}
                      key={t.id}
                      className={`tab ${insightTab === t.id ? "on" : ""}`}
                      onClick={() => setInsightTab(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {renderInsights()}
              </section>

              {/* --- goals --- */}
              <section className="card goals-card">
                <div className="card-head">
                  <h2>
                    Goals Progress <Info size={13} />
                  </h2>
                  <button type="button" className="update-btn" onClick={() => setError("Goal progress is sample data and cannot be edited yet.")}>
                    <FlaskConical size={13} /> Update
                  </button>
                </div>
                <div className="goal-list">
                  {goals.map((g) => (
                    <div className="goal" key={g.title}>
                      <div className="goal-top">
                        <strong>{g.title}</strong>
                        <span className={`pill ${g.tone}`}>{g.status}</span>
                        <small>Due Date: {g.due}</small>
                      </div>
                      <div className="goal-bar" role="progressbar" aria-valuenow={g.progress} aria-valuemin={0} aria-valuemax={100}>
                        <span style={{ width: `${g.progress}%` }}>{g.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <section className="card history-card">
              <div className="card-head">
                <h2>{activeSection} ({visibleActivities.length})</h2>
                <button type="button" className="lime-btn" onClick={() => setModalOpen(true)}>
                  <Plus size={14} /> Add Activity
                </button>
              </div>
              {renderActivityList(visibleActivities)}
            </section>
          )}

          {activePage === "dashboard" && (
            <section className="card recent-card">
              <div className="card-head">
                <h2>Recent activities</h2>
                {activities.length > 0 && (
                  <button type="button" className="link-btn" onClick={() => setActivePage("history")}>
                    View all <ChevronRight size={14} />
                  </button>
                )}
              </div>
              {renderActivityList(activities.slice(0, 5))}
            </section>
          )}
        </main>
      </div>

      {/* ===== Add-activity modal ===== */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-head">
              <h2 id="add-title">Add an activity</h2>
              <button type="button" className="icon-btn" onClick={() => setModalOpen(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="category-buttons">
              {categories.map(({ value, short, Icon }) => (
                <button
                  type="button"
                  key={value}
                  className={`category-button ${form.category === value ? "selected" : ""}`}
                  onClick={() => changeCategory(value)}
                  aria-pressed={form.category === value}
                >
                  <Icon size={16} /> {short}
                </button>
              ))}
            </div>

            <form onSubmit={addActivity}>
              <div className="form-group">
                <label htmlFor="activity-type">Activity type</label>
                <select
                  id="activity-type"
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                >
                  {activityOptions[form.category].map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">
                  Quantity {selectedOption ? `(${selectedOption.unit})` : ""}
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.quantity}
                  onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                  placeholder="e.g. 5"
                  required
                />
              </div>

              <button type="submit" className="lime-btn wide" disabled={saving}>
                <Plus size={16} />
                {saving ? "Saving activity..." : "Save activity"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;




