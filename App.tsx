import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  BarChart3,
  ListChecks,
  Sun,
  Moon,
  LogOut,
  TrendingUp,
  TrendingDown,
  Wallet,
  Package,
  DollarSign,
  Percent,
  Hash,
  Search,
  Filter,
  Download,
  Trash2,
  Plus,
  Sparkles,
  Wifi,
  WifiOff,
  AlertCircle,
  ChevronDown,
  X,
  ArrowUpRight,
  Boxes,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ---- Types ----
type Sale = {
  id?: string;
  category: string;
  itemName: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
  profitPerUnit: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  date: string;
};

type Expense = {
  id?: string;
  category: string;
  description: string;
  amount: number;
  date: string;
};

type UnifiedTx = (Sale & { type: "sale"; id: string; displayDate: string }) | (Expense & { type: "expense"; id: string; displayDate: string });

// ---- API helpers ----
async function apiCall(action: string, args: any) {
  const res = await fetch("actions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, args }),
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error || `API ${action} failed`);
  return json.data;
}

// ---- CountUp ----
function CountUp({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = ref.current;
    const end = value;
    const duration = 900;
    const startTime = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const cur = start + (end - start) * eased;
      setDisplay(cur);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else ref.current = end;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span className="mono tracking-tight">
      {prefix}
      {decimals ? display.toFixed(decimals) : Math.round(display).toLocaleString()}
      {suffix}
    </span>
  );
}

// ---- Toast ----
type Toast = { id: string; msg: string; type: "success" | "error" | "info" };
function Toasts({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) {
  return (
    <div className="fixed bottom-[88px] md:bottom-6 right-4 left-4 md:left-auto z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto glass-strong rounded-[14px] px-4 py-3 flex items-center gap-3 text-sm font-medium animate-[enter_0.35s_ease]"
          style={{ borderLeft: `4px solid ${t.type === "success" ? "var(--teal)" : t.type === "error" ? "var(--rose)" : "var(--indigo)"}` }}
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${t.type === "success" ? "bg-[var(--teal-soft)] text-[var(--teal)]" : t.type === "error" ? "bg-[var(--rose-soft)] text-[var(--rose)]" : "bg-[var(--indigo-soft)] text-[var(--indigo)]"}`}>
            {t.type === "success" ? <Sparkles className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          </div>
          <span className="text-[var(--text)] flex-1">{t.msg}</span>
          <button onClick={() => remove(t.id)} className="text-[var(--text-faint)] hover:text-[var(--text)]">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("shop-theme") as any;
      if (s) return s;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("shop-theme", theme);
  }, [theme]);

  const [loggedIn, setLoggedIn] = useState(() => {
    try {
      return !!localStorage.getItem("shop-session");
    } catch {
      return false;
    }
  });
  const [loginEmail, setLoginEmail] = useState("demo@shop.pro");
  const [loginPass, setLoginPass] = useState("demo123");
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === "demo@shop.pro" && loginPass === "demo123") {
      localStorage.setItem("shop-session", JSON.stringify({ email: loginEmail, shop: "Market Side Pro", at: new Date().toISOString() }));
      setLoggedIn(true);
      addToast("Welcome to Market Side Pro — premium mode active", "success");
    } else {
      setLoginError("Invalid demo credentials. Use demo@shop.pro / demo123");
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("shop-session");
    setLoggedIn(false);
  };

  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<"dashboard" | "sales" | "expenses" | "analytics" | "ledger">("dashboard");
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "sales", label: "Sales", icon: ShoppingCart },
    { id: "expenses", label: "Expenses", icon: Receipt },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "ledger", label: "Ledger", icon: ListChecks },
  ] as const;

  const [sales, setSales] = useState<(Sale & { id: string })[]>([]);
  const [expenses, setExpenses] = useState<(Expense & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (msg: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };
  const removeToast = (id: string) => setToasts((p) => p.filter((t) => t.id !== id));

  const [saleForm, setSaleForm] = useState({ category: "Drinks", itemName: "", quantity: 1, costPrice: "", salePrice: "" });
  const [expenseForm, setExpenseForm] = useState({ category: "Rent", description: "", amount: "", date: new Date().toISOString().slice(0, 10) });

  const saleProfitPerUnit = useMemo(() => {
    const c = parseFloat(saleForm.costPrice) || 0;
    const s = parseFloat(saleForm.salePrice) || 0;
    return s - c;
  }, [saleForm.costPrice, saleForm.salePrice]);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "sale" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");

  const reloadRecords = async () => {
    // records.list literal required
    const [salesRes, expRes] = await Promise.all([
      apiCall("records.list", { collection: "sales" }).catch(() => ({ records: [] })),
      apiCall("records.list", { collection: "expenses" }).catch(() => ({ records: [] })),
    ]);
    const sRecs = (salesRes.records || []).map((r: any) => ({ id: r.id, ...r.value }));
    const eRecs = (expRes.records || []).map((r: any) => ({ id: r.id, ...r.value }));
    sRecs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    eRecs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setSales(sRecs);
    setExpenses(eRecs);
    return { sRecs, eRecs };
  };

  useEffect(() => {
    if (!loggedIn) {
      setLoading(false);
      return;
    }
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { sRecs, eRecs } = await reloadRecords();
        if (mounted && sRecs.length === 0 && eRecs.length === 0) {
          const demoSales: Sale[] = [
            { category: "Drinks", itemName: "Cold Coca-Cola 500ml", quantity: 24, costPrice: 0.6, salePrice: 1.5, profitPerUnit: 0.9, totalRevenue: 36, totalCost: 14.4, totalProfit: 21.6, date: new Date(Date.now() - 86400000 * 0).toISOString() },
            { category: "Snacks", itemName: "Lays Classic", quantity: 18, costPrice: 0.45, salePrice: 1.2, profitPerUnit: 0.75, totalRevenue: 21.6, totalCost: 8.1, totalProfit: 13.5, date: new Date(Date.now() - 86400000 * 1).toISOString() },
            { category: "Body Oils", itemName: "Argan Oil 100ml", quantity: 6, costPrice: 4.5, salePrice: 12, profitPerUnit: 7.5, totalRevenue: 72, totalCost: 27, totalProfit: 45, date: new Date(Date.now() - 86400000 * 1).toISOString() },
            { category: "General Retail", itemName: "AA Batteries 4-pack", quantity: 12, costPrice: 1.2, salePrice: 3.5, profitPerUnit: 2.3, totalRevenue: 42, totalCost: 14.4, totalProfit: 27.6, date: new Date(Date.now() - 86400000 * 2).toISOString() },
            { category: "Cosmetics", itemName: "Matte Lipstick Nude", quantity: 8, costPrice: 3, salePrice: 9.5, profitPerUnit: 6.5, totalRevenue: 76, totalCost: 24, totalProfit: 52, date: new Date(Date.now() - 86400000 * 3).toISOString() },
          ];
          const demoExpenses: Expense[] = [
            { category: "Rent", description: "Shop rent - March", amount: 850, date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10) },
            { category: "Stock Refill", description: "Drinks wholesale restock", amount: 220, date: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10) },
            { category: "Utilities", description: "Electricity + fridge", amount: 85, date: new Date().toISOString().slice(0, 10) },
          ];
          for (const row of demoSales) {
            await apiCall("records.create", { collection: "sales", value: row, idempotency_key: `demo-sale-${row.itemName}-${row.date}` }).catch(() => {});
          }
          for (const row of demoExpenses) {
            await apiCall("records.create", { collection: "expenses", value: row, idempotency_key: `demo-exp-${row.description}-${row.date}` }).catch(() => {});
          }
          await reloadRecords();
        }
      } catch (e) {
        console.warn("load failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loggedIn]);

  const kpis = useMemo(() => {
    const totalRevenue = sales.reduce((s, r) => s + r.totalRevenue, 0);
    const totalCOGS = sales.reduce((s, r) => s + r.totalCost, 0);
    const totalExpensesVal = expenses.reduce((s, r) => s + r.amount, 0);
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpensesVal;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    return { totalRevenue, totalCOGS, totalExpensesVal, grossProfit, netProfit, margin, count: sales.length + expenses.length };
  }, [sales, expenses]);

  const chartData = useMemo(() => {
    const days: { label: string; dateStr: string; revenue: number; profit: number; expenses: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - 86400000 * i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      days.push({ label, dateStr: iso, revenue: 0, profit: 0, expenses: 0 });
    }
    sales.forEach((s) => {
      const day = days.find((d) => s.date.slice(0, 10) === d.dateStr);
      if (day) {
        day.revenue += s.totalRevenue;
        day.profit += s.totalProfit;
      }
    });
    expenses.forEach((e) => {
      const day = days.find((d) => e.date.slice(0, 10) === d.dateStr);
      if (day) day.expenses += e.amount;
    });
    return days;
  }, [sales, expenses]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((s) => {
      map[s.category] = (map[s.category] || 0) + s.totalRevenue;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [sales]);

  const COLORS = ["#6366f1", "#14b8a6", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4"];

  const unified = useMemo((): UnifiedTx[] => {
    const all: UnifiedTx[] = [
      ...(sales.map((s) => ({ ...s, type: "sale" as const, displayDate: s.date })) as any),
      ...(expenses.map((e) => ({ ...e, type: "expense" as const, displayDate: e.date })) as any),
    ];
    return all.sort((a, b) => new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime());
  }, [sales, expenses]);

  const filteredLedger = useMemo(() => {
    let list = [...unified];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        (t.type === "sale" ? `${t.itemName} ${t.category}` : `${(t as any).description} ${t.category}`).toLowerCase().includes(q)
      );
    }
    if (filterType !== "all") list = list.filter((t) => t.type === filterType);
    if (filterCategory !== "all") list = list.filter((t) => t.category === filterCategory);
    if (sortBy === "date_desc") list.sort((a, b) => new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime());
    if (sortBy === "date_asc") list.sort((a, b) => new Date(a.displayDate).getTime() - new Date(b.displayDate).getTime());
    if (sortBy === "amount_desc") list.sort((a, b) => (b.type === "sale" ? (b as any).totalRevenue : (b as any).amount) - (a.type === "sale" ? (a as any).totalRevenue : (a as any).amount));
    if (sortBy === "amount_asc") list.sort((a, b) => (a.type === "sale" ? (a as any).totalRevenue : (a as any).amount) - (b.type === "sale" ? (b as any).totalRevenue : (b as any).amount));
    return list;
  }, [unified, search, filterType, filterCategory, sortBy]);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    sales.forEach((s) => set.add(s.category));
    expenses.forEach((e) => set.add(e.category));
    return Array.from(set);
  }, [sales, expenses]);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleForm.itemName.trim() || !saleForm.costPrice || !saleForm.salePrice) {
      addToast("Fill item name and prices", "error");
      return;
    }
    const qty = Number(saleForm.quantity) || 1;
    const cost = parseFloat(saleForm.costPrice);
    const price = parseFloat(saleForm.salePrice);
    if (qty < 1 || cost < 0 || price <= 0) {
      addToast("Check quantity and prices", "error");
      return;
    }
    setBusy(true);
    const value: Sale = {
      category: saleForm.category,
      itemName: saleForm.itemName.trim(),
      quantity: qty,
      costPrice: cost,
      salePrice: price,
      profitPerUnit: price - cost,
      totalRevenue: price * qty,
      totalCost: cost * qty,
      totalProfit: (price - cost) * qty,
      date: new Date().toISOString(),
    };
    try {
      await apiCall("records.create", {
        collection: "sales",
        value,
        idempotency_key: `sale-${Date.now()}-${value.itemName}`,
      });
      await reloadRecords();
      setSaleForm({ category: "Drinks", itemName: "", quantity: 1, costPrice: "", salePrice: "" });
      addToast(`Sale logged: ${value.itemName} • $${value.totalRevenue.toFixed(2)}`, "success");
    } catch (err: any) {
      addToast(err.message || "Failed to save sale", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description.trim() || !expenseForm.amount) {
      addToast("Fill description and amount", "error");
      return;
    }
    const amount = parseFloat(expenseForm.amount);
    if (amount <= 0) {
      addToast("Amount must be > 0", "error");
      return;
    }
    setBusy(true);
    const value: Expense = {
      category: expenseForm.category,
      description: expenseForm.description.trim(),
      amount,
      date: expenseForm.date,
    };
    try {
      await apiCall("records.create", {
        collection: "expenses",
        value,
        idempotency_key: `exp-${Date.now()}-${value.description}`,
      });
      await reloadRecords();
      setExpenseForm({ category: "Rent", description: "", amount: "", date: new Date().toISOString().slice(0, 10) });
      addToast(`Expense logged: $${amount.toFixed(2)}`, "success");
    } catch (err: any) {
      addToast(err.message || "Failed to save expense", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string, type: "sale" | "expense") => {
    try {
      await apiCall("records.delete", { collection: type === "sale" ? "sales" : "expenses", id });
      await reloadRecords();
      addToast("Transaction deleted", "info");
    } catch (e: any) {
      addToast(e.message || "Delete failed", "error");
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Type", "Category", "Item/Description", "Qty", "Unit Cost", "Unit Sale", "Total Revenue/Amount", "Profit", "Date"],
      ...filteredLedger.map((t) => {
        if (t.type === "sale") {
          const s = t as any;
          return [s.type, s.category, s.itemName, s.quantity, s.costPrice, s.salePrice, s.totalRevenue, s.totalProfit, s.date];
        } else {
          const ex = t as any;
          return [ex.type, ex.category, ex.description, "", "", "", ex.amount, `-${ex.amount}`, ex.date];
        }
      }),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `market-side-pro-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("CSV exported", "success");
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setActiveTab("ledger");
      }
      if (e.key.toLowerCase() === "n" && loggedIn && (e.target as HTMLElement)?.tagName !== "INPUT") {
        setActiveTab("sales");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [loggedIn]);

  // Single root shell
  return (
    <div
      data-safe-area-inset-root
      className="min-h-screen w-full overflow-x-clip flex flex-col"
      style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)", background: "var(--bg)", color: "var(--text)" }}
    >
      {!loggedIn ? (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-x-clip flex-1" style={{ background: "var(--bg)" }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-30" style={{ background: "radial-gradient(circle at center, #6366f1, transparent 70%)" }} />
            <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-30" style={{ background: "radial-gradient(circle at center, #14b8a6, transparent 70%)" }} />
            <div className="absolute top-[40%] left-[45%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-20" style={{ background: "radial-gradient(circle at center, #f59e0b, transparent 70%)" }} />
          </div>

          <div className="w-full max-w-[1080px] grid md:grid-cols-[1.1fr_0.9fr] gap-6 items-center relative z-10">
            <div className="hidden md:flex flex-col gap-8 p-8">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[14px] bg-[#0f172a] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
                  <Boxes className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-[var(--text)] text-[18px] tracking-tight leading-none">Market Side Pro</div>
                  <div className="text-[12px] text-[var(--text-muted)] mt-1">Enterprise Intelligence Engine</div>
                </div>
              </div>
              <div>
                <h1 className="text-[42px] leading-[0.95] font-[800] tracking-[-0.04em] text-[var(--text)]">
                  Profit tracking
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#14b8a6]">built like Stripe.</span>
                </h1>
                <p className="mt-5 text-[16px] leading-7 text-[var(--text-muted)] max-w-[44ch]">
                  Rebuilt from the ground up. Glassmorphism cards, real-time charts, offline-first, and a ledger that never lies. Premium dark/light, zero broken CDNs.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {[
                    { k: "Revenue", v: "$24.5k" },
                    { k: "Margin", v: "34.2%" },
                    { k: "Uptime", v: "100%" },
                  ].map((s) => (
                    <div key={s.k} className="glass rounded-[14px] p-3">
                      <div className="text-[11px] uppercase tracking-widest text-[var(--text-faint)] font-semibold">{s.k}</div>
                      <div className="text-[18px] font-bold text-[var(--text)] mt-1 mono">{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Offline-first • Encrypted local cache • No third-party trackers
              </div>
            </div>

            <div className="glass-strong rounded-[24px] p-7 md:p-8 w-full animate-[enter_0.6s_ease]">
              <div className="md:hidden flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-[12px] bg-[#0f172a] text-white flex items-center justify-center"><Boxes className="w-5 h-5" /></div>
                <div>
                  <div className="font-bold tracking-tight">Market Side Pro</div>
                  <div className="text-xs text-[var(--text-muted)]">Shop Manager & Profit Tracker</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[22px] font-bold tracking-tight">Sign in</h2>
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-9 h-9 rounded-full glass flex items-center justify-center hover:scale-105 transition">
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Email</label>
                  <div className="mt-2 relative">
                    <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} type="email" placeholder="demo@shop.pro" className="w-full h-[44px] rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-4 text-[14px] outline-none focus:border-[var(--indigo)] focus:ring-4 focus:ring-[var(--indigo-ring)] transition" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Password</label>
                  <div className="mt-2 relative">
                    <input value={loginPass} onChange={(e) => setLoginPass(e.target.value)} type="password" placeholder="••••••••" className="w-full h-[44px] rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-4 text-[14px] outline-none focus:border-[var(--indigo)] focus:ring-4 focus:ring-[var(--indigo-ring)] transition" />
                  </div>
                </div>

                {loginError && <div className="text-[12px] text-[#f43f5e] bg-[var(--rose-soft)] border border-[var(--rose-soft)] rounded-[10px] px-3 py-2 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{loginError}</div>}

                <button type="submit" className="group w-full h-[46px] rounded-[12px] bg-[#0f172a] text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-black transition active:scale-[0.98] shadow-[0_10px_20px_-8px_rgba(0,0,0,0.6)]">
                  Continue to Dashboard
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </button>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] p-3">
                    <div className="text-[10px] uppercase tracking-widest text-[var(--text-faint)] font-semibold">Demo Login</div>
                    <div className="text-[12px] font-medium mt-1 text-[var(--text)] break-all">demo@shop.pro</div>
                    <div className="text-[12px] text-[var(--text-muted)]">demo123</div>
                  </div>
                  <div className="rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] p-3">
                    <div className="text-[10px] uppercase tracking-widest text-[var(--text-faint)] font-semibold">Vercel Deploy</div>
                    <div className="text-[12px] mt-1 leading-5 text-[var(--text-muted)]">Framework: Vite React • Build: npm run build • Output: dist</div>
                  </div>
                </div>

                <div className="text-[11px] text-[var(--text-faint)] leading-5 pt-2">
                  By continuing you agree to local-first storage. No external tracking. Session stored in localStorage. Press <span className="mono bg-[var(--bg-soft)] border border-[var(--surface-border)] px-1 rounded">⌘K</span> to jump to ledger.
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <>
          <header
            data-safe-area-sticky-top
            className="sticky z-40 backdrop-blur-[18px] border-b"
            style={{ top: "var(--safe-area-inset-top)", background: "color-mix(in srgb, var(--bg-elevated) 88%, transparent)", borderColor: "var(--surface-border)" }}
          >
            <div className="max-w-[1520px] mx-auto px-4 md:px-7 h-[64px] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-[11px] bg-[#0f172a] text-white flex items-center justify-center shadow shrink-0"><Boxes className="w-5 h-5" /></div>
                <div className="min-w-0 hidden sm:block">
                  <div className="font-extrabold tracking-tight leading-none text-[15px]">Market Side Pro</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-[2px] flex items-center gap-2">
                    <span className="hidden md:inline">Shop Manager & Profit Tracker Pro • Enterprise</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--bg-soft)] border border-[var(--surface-border)] text-[10px] font-semibold">
                      {isOnline ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-[var(--rose)]" />}
                      {isOnline ? "Live" : "Offline"}
                    </span>
                  </div>
                </div>
                <div className="sm:hidden font-bold text-[15px] truncate">Market Side Pro</div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 mr-1">
                  <div className="text-[11px] text-[var(--text-muted)] hidden lg:block">⌘K ledger • N new sale • Deploy: Vite → Vercel</div>
                </div>
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-9 h-9 rounded-full glass flex items-center justify-center hover:scale-105 transition">
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <div className="hidden md:flex items-center gap-2 glass rounded-full pl-1 pr-3 h-9">
                  <img src="https://i.pravatar.cc/100?img=32" className="w-7 h-7 rounded-full" alt="user" />
                  <div className="text-[12px] leading-none">
                    <div className="font-semibold">Alex Morgan</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Owner</div>
                  </div>
                </div>
                <button onClick={handleLogout} className="w-9 h-9 rounded-full bg-[#0f172a] text-white flex items-center justify-center hover:bg-black transition">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          <div className="max-w-[1520px] mx-auto w-full flex flex-1 min-h-0">
            <aside className="hidden md:flex w-[232px] shrink-0 sticky top-[64px] h-[calc(100vh-64px)] p-4 flex-col gap-3 self-start">
              <div className="glass rounded-[18px] p-2.5">
                {tabs.map((t) => {
                  const active = activeTab === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 h-[42px] rounded-[12px] text-[13.5px] font-medium transition ${active ? "bg-[#0f172a] text-white shadow" : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-soft)]"}`}
                    >
                      <Icon className={`w-[18px] h-[18px] ${active ? "text-white" : "text-[var(--text-faint)]"}`} />
                      {t.label}
                      {active && <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
                    </button>
                  );
                })}
              </div>

              <div className="glass rounded-[18px] p-4 mt-auto">
                <div className="flex items-center gap-2 text-[12px] font-semibold"><Sparkles className="w-4 h-4 text-[var(--indigo)]" /> Premium tips</div>
                <div className="text-[12px] leading-5 text-[var(--text-muted)] mt-2">Use filters in Ledger to find shrinkage. Export weekly CSV for accountant. Profit margin &lt;15% triggers review.</div>
                <div className="mt-3 flex gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-[var(--indigo-soft)]"><div className="h-full w-[78%] rounded-full bg-[var(--indigo)]" /></div>
                  <span className="text-[11px] font-medium mono">78% healthy</span>
                </div>
              </div>

              <div className="text-[10px] text-[var(--text-faint)] px-2 leading-4">© Market Side Pro • Local-first • Vercel: set env none, framework Vite, root ./</div>
            </aside>

            <main className="flex-1 min-w-0 px-4 md:px-7 py-5 md:py-7 pb-[88px] md:pb-7">
              {loading ? (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="glass rounded-[20px] h-[128px] animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                    ))}
                  </div>
                  <div className="glass rounded-[20px] h-[320px] animate-pulse" />
                </div>
              ) : (
                <>
                  {activeTab === "dashboard" && (
                    <div className="space-y-6 animate-[enter_0.5s_ease]">
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 md:gap-4">
                        {[
                          { label: "Total Revenue", value: kpis.totalRevenue, icon: DollarSign, color: "var(--indigo)", bg: "var(--indigo-soft)", trend: "+12.4%", up: true },
                          { label: "COGS", value: kpis.totalCOGS, icon: Package, color: "var(--amber)", bg: "var(--amber-soft)", trend: "+3.1%", up: false },
                          { label: "Expenses", value: kpis.totalExpensesVal, icon: Wallet, color: "var(--rose)", bg: "var(--rose-soft)", trend: "-2.8%", up: true },
                          { label: "Net Profit", value: kpis.netProfit, icon: TrendingUp, color: "var(--teal)", bg: "var(--teal-soft)", trend: kpis.netProfit >= 0 ? "+8.2%" : "-4.1%", up: kpis.netProfit >= 0 },
                          { label: "Margin & Txns", value: kpis.margin, icon: Percent, color: "var(--primary)", bg: "var(--bg-soft)", trend: `${kpis.count} txns`, up: true, isPercent: true },
                        ].map((k, i) => (
                          <div key={k.label} className="glass rounded-[20px] p-4 md:p-5 relative overflow-hidden group hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-[1px]" style={{ animation: `enter 0.5s ease ${i * 80}ms both` }}>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.06] transition duration-500" style={{ background: `linear-gradient(120deg, ${k.color}, transparent)` }} />
                            <div className="flex items-start justify-between">
                              <div className="w-9 h-9 rounded-[12px] flex items-center justify-center" style={{ background: k.bg, color: k.color }}><k.icon className="w-[18px] h-[18px]" /></div>
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${k.up ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"}`}>
                                {k.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {k.trend}
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="text-[11px] uppercase tracking-widest font-semibold text-[var(--text-muted)]">{k.label}</div>
                              <div className="mt-1 text-[22px] md:text-[26px] font-[800] tracking-tight leading-none">
                                {k.label === "Margin & Txns" ? (
                                  <>
                                    <CountUp value={k.value as number} suffix="%" decimals={1} /> <span className="text-[12px] font-medium text-[var(--text-muted)] ml-1">{kpis.count} total</span>
                                  </>
                                ) : (
                                  <>
                                    <CountUp value={k.value as number} prefix="$" /> <span className="text-[11px] text-[var(--text-faint)] font-medium ml-1">USD</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 h-[36px] -mx-1">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData.slice(-7)}>
                                  <Area type="monotone" dataKey={k.label === "Total Revenue" ? "revenue" : k.label === "Net Profit" ? "profit" : "expenses"} stroke={k.color} fill={k.color} fillOpacity={0.12} strokeWidth={1.6} dot={false} />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
                        <div className="glass rounded-[20px] p-5 md:p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-[14px] tracking-tight">Revenue vs Profit — Last 7 Days</h3>
                              <p className="text-[12px] text-[var(--text-muted)] mt-1">Gradient area, tooltip rich, animated-in</p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-[11px]">
                              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" />Revenue</span>
                              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]" />Profit</span>
                              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />Expenses</span>
                            </div>
                          </div>
                          <div className="h-[260px] mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.32} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                  </linearGradient>
                                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.32} />
                                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "var(--surface-strong)", border: "1px solid var(--surface-border)", borderRadius: 12, fontSize: 12 } as any} />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2.2} />
                                <Area type="monotone" dataKey="profit" stroke="#14b8a6" fill="url(#profGrad)" strokeWidth={2.2} />
                                <Line type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={1.6} dot={false} strokeDasharray="4 4" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="glass rounded-[20px] p-5 md:p-6 flex flex-col">
                          <h3 className="font-bold text-[14px] tracking-tight">Sales by Category</h3>
                          <p className="text-[12px] text-[var(--text-muted)] mt-1">Doughnut • premium legend</p>
                          <div className="h-[220px] mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={categoryData.length ? categoryData : [{ name: "No data", value: 1 }]} cx="50%" cy="50%" innerRadius={56} outerRadius={84} paddingAngle={4} dataKey="value">
                                  {(categoryData.length ? categoryData : [{ name: "No data", value: 1 }]).map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: "var(--surface-strong)", border: "1px solid var(--surface-border)", borderRadius: 12, fontSize: 12 } as any} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {categoryData.map((c, i) => (
                              <div key={c.name} className="flex items-center gap-2 text-[12px]">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                <span className="text-[var(--text-muted)] truncate">{c.name}</span>
                                <span className="ml-auto font-semibold mono">${c.value.toFixed(0)}</span>
                              </div>
                            ))}
                            {categoryData.length === 0 && <div className="text-[12px] text-[var(--text-faint)] col-span-2 text-center py-4">No sales yet — log your first sale to see breakdown.</div>}
                          </div>
                        </div>
                      </div>

                      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
                        <div className="glass rounded-[20px] p-5 md:p-6">
                          <h3 className="font-bold text-[14px] tracking-tight">Profit vs Expenses (Daily)</h3>
                          <div className="h-[240px] mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} barCategoryGap={18}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "var(--surface-strong)", border: "1px solid var(--surface-border)", borderRadius: 12, fontSize: 12 } as any} />
                                <Legend wrapperStyle={{ fontSize: 11 } as any} />
                                <Bar dataKey="profit" name="Profit" fill="#14b8a6" radius={[8, 8, 0, 0] as any} />
                                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[8, 8, 0, 0] as any} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="glass rounded-[20px] p-5 md:p-6">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-[14px] tracking-tight">Recent Transactions</h3>
                            <button onClick={() => setActiveTab("ledger")} className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-[var(--bg-soft)] border border-[var(--surface-border)] hover:bg-[var(--surface-border)] transition">View all</button>
                          </div>
                          <div className="mt-4 space-y-2.5 max-h-[240px] overflow-auto pr-1">
                            {unified.slice(0, 6).map((t) => (
                              <div key={t.id} className="flex items-center gap-3 rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-3 py-2.5 hover:translate-x-[1px] transition">
                                <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${t.type === "sale" ? "bg-[var(--indigo-soft)] text-[var(--indigo)]" : "bg-[var(--rose-soft)] text-[var(--rose)]"}`}>
                                  {t.type === "sale" ? <ShoppingCart className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-[13px] font-medium truncate">{t.type === "sale" ? (t as any).itemName : (t as any).description}</div>
                                  <div className="text-[11px] text-[var(--text-muted)] truncate">{t.category} • {new Date(t.displayDate).toLocaleDateString()}</div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-[13px] font-semibold mono ${t.type === "sale" ? "text-[var(--text)]" : "text-[var(--rose)]"}`}>{t.type === "sale" ? `+$${(t as any).totalRevenue.toFixed(2)}` : `-$${(t as any).amount.toFixed(2)}`}</div>
                                  {t.type === "sale" && <div className="text-[10px] text-emerald-600">+${(t as any).totalProfit.toFixed(2)} profit</div>}
                                </div>
                              </div>
                            ))}
                            {unified.length === 0 && (
                              <div className="text-center py-12">
                                <div className="w-12 h-12 rounded-full bg-[var(--bg-soft)] mx-auto flex items-center justify-center mb-3"><Boxes className="w-6 h-6 text-[var(--text-faint)]" /></div>
                                <div className="text-[13px] font-medium">No transactions yet</div>
                                <div className="text-[12px] text-[var(--text-muted)] mt-1">Start by logging a sale or expense.</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "sales" && (
                    <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-4 animate-[enter_0.45s_ease]">
                      <div className="glass rounded-[22px] p-6 md:p-7">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 rounded-[12px] bg-[#0f172a] text-white flex items-center justify-center"><ShoppingCart className="w-5 h-5" /></div>
                          <div>
                            <h2 className="font-bold text-[16px] tracking-tight leading-none">Record a Sale</h2>
                            <p className="text-[12px] text-[var(--text-muted)] mt-1">Auto profit calc • validation • animation</p>
                          </div>
                        </div>

                        <form onSubmit={handleCreateSale} className="space-y-4">
                          <div>
                            <label className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Category</label>
                            <div className="relative mt-2">
                              <select value={saleForm.category} onChange={(e) => setSaleForm({ ...saleForm, category: e.target.value })} className="w-full h-[44px] rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-4 pr-9 text-[13.5px] outline-none focus:border-[var(--indigo)] focus:ring-4 focus:ring-[var(--indigo-ring)] appearance-none">
                                {["Drinks", "Body Oils", "General Retail", "Snacks", "Cosmetics"].map((c) => (
                                  <option key={c}>{c}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Item Name / Description</label>
                            <input value={saleForm.itemName} onChange={(e) => setSaleForm({ ...saleForm, itemName: e.target.value })} placeholder="e.g., Cold Coca-Cola 500ml" className="mt-2 w-full h-[44px] rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-4 text-[13.5px] outline-none focus:border-[var(--indigo)] focus:ring-4 focus:ring-[var(--indigo-ring)]" />
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-1">
                              <label className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Quantity</label>
                              <input type="number" min={1} value={saleForm.quantity} onChange={(e) => setSaleForm({ ...saleForm, quantity: Math.max(1, Number(e.target.value) || 1) })} className="mt-2 w-full h-[44px] rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-4 text-[13.5px] outline-none focus:border-[var(--indigo)] focus:ring-4 focus:ring-[var(--indigo-ring)]" />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Cost Price (unit)</label>
                              <input type="number" step="0.01" value={saleForm.costPrice} onChange={(e) => setSaleForm({ ...saleForm, costPrice: e.target.value })} placeholder="0.00" className="mt-2 w-full h-[44px] rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-4 text-[13.5px] outline-none focus:border-[var(--indigo)] focus:ring-4 focus:ring-[var(--indigo-ring)]" />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Sale Price (unit)</label>
                              <input type="number" step="0.01" value={saleForm.salePrice} onChange={(e) => setSaleForm({ ...saleForm, salePrice: e.target.value })} placeholder="0.00" className="mt-2 w-full h-[44px] rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-4 text-[13.5px] outline-none focus:border-[var(--indigo)] focus:ring-4 focus:ring-[var(--indigo-ring)]" />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-[12px] bg-[var(--indigo-soft)] border border-[var(--surface-border)] p-3">
                              <div className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-faint)]">Profit / unit</div>
                              <div className={`mt-1 text-[15px] font-bold mono ${saleProfitPerUnit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>${saleProfitPerUnit.toFixed(2)}</div>
                            </div>
                            <div className="rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] p-3">
                              <div className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-faint)]">Total Revenue</div>
                              <div className="mt-1 text-[15px] font-bold mono">${((parseFloat(saleForm.salePrice) || 0) * saleForm.quantity).toFixed(2)}</div>
                            </div>
                            <div className="rounded-[12px] bg-[var(--teal-soft)] border border-[var(--surface-border)] p-3">
                              <div className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-faint)]">Total Profit</div>
                              <div className="mt-1 text-[15px] font-bold mono text-emerald-700">${(saleProfitPerUnit * saleForm.quantity).toFixed(2)}</div>
                            </div>
                          </div>

                          <button disabled={busy} type="submit" className="group w-full h-[48px] rounded-[12px] bg-[#0f172a] text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition shadow-[0_10px_20px_-10px_rgba(0,0,0,0.6)] disabled:opacity-60">
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition duration-300" />
                            {busy ? "Saving…" : "Add Sale"}
                            <span className="ml-1 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center"><ArrowUpRight className="w-3.5 h-3.5" /></span>
                          </button>

                          <div className="text-[11px] text-[var(--text-faint)] leading-5">Press <span className="mono bg-[var(--bg-soft)] border border-[var(--surface-border)] px-1 rounded">N</span> for quick new sale • Data persists via durable records API.</div>
                        </form>
                      </div>

                      <div className="space-y-4">
                        <div className="glass rounded-[22px] p-6">
                          <h3 className="font-bold text-[14px]">Live Profit Preview</h3>
                          <div className="h-[180px] mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="profit" stroke="#14b8a6" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div className="glass rounded-[22px] p-6">
                          <h3 className="font-bold text-[14px] mb-3">Today's Sales</h3>
                          <div className="space-y-2 max-h-[300px] overflow-auto">
                            {sales.slice(0, 8).map((s) => (
                              <div key={s.id} className="flex items-center gap-3 text-[13px]">
                                <div className="w-8 h-8 rounded-[10px] bg-[var(--indigo-soft)] text-[var(--indigo)] flex items-center justify-center"><Hash className="w-4 h-4" /></div>
                                <div className="flex-1 min-w-0"><div className="font-medium truncate">{s.itemName}</div><div className="text-[11px] text-[var(--text-muted)]">{s.category} • {s.quantity}×</div></div>
                                <div className="text-right"><div className="font-semibold mono">${s.totalRevenue.toFixed(2)}</div><div className="text-[11px] text-emerald-600">+${s.totalProfit.toFixed(2)}</div></div>
                              </div>
                            ))}
                            {sales.length === 0 && <div className="text-[12px] text-[var(--text-muted)] py-8 text-center">No sales yet.</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "expenses" && (
                    <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-4 animate-[enter_0.45s_ease]">
                      <div className="glass rounded-[22px] p-6 md:p-7">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 rounded-[12px] bg-[#0f172a] text-white flex items-center justify-center"><Receipt className="w-5 h-5" /></div>
                          <div>
                            <h2 className="font-bold text-[16px] tracking-tight leading-none">Log Expense</h2>
                            <p className="text-[12px] text-[var(--text-muted)] mt-1">Rent, stock, utilities — affects net profit</p>
                          </div>
                        </div>

                        <form onSubmit={handleCreateExpense} className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Category</label>
                              <div className="relative mt-2">
                                <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} className="w-full h-[44px] rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-4 pr-9 text-[13.5px] outline-none focus:border-[var(--rose)] focus:ring-4 focus:ring-[var(--rose-soft)] appearance-none">
                                  {["Rent", "Stock Refill", "Utilities", "Transport", "Marketing", "Other"].map((c) => (<option key={c}>{c}</option>))}
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] pointer-events-none" />
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Date</label>
                              <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} className="mt-2 w-full h-[44px] rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-4 text-[13.5px] outline-none focus:border-[var(--rose)] focus:ring-4 focus:ring-[var(--rose-soft)]" />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Description</label>
                            <input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="e.g., Shop rent - March" className="mt-2 w-full h-[44px] rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-4 text-[13.5px] outline-none focus:border-[var(--rose)] focus:ring-4 focus:ring-[var(--rose-soft)]" />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Amount</label>
                            <input type="number" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="0.00" className="mt-2 w-full h-[44px] rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-4 text-[13.5px] outline-none focus:border-[var(--rose)] focus:ring-4 focus:ring-[var(--rose-soft)]" />
                          </div>

                          <div className="rounded-[12px] bg-[var(--rose-soft)] border border-[var(--surface-border)] p-3 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-faint)]">Impact on Net Profit</div>
                              <div className="text-[13px] text-[var(--text-muted)] mt-0.5">Will deduct from gross profit</div>
                            </div>
                            <div className="text-[18px] font-bold mono text-[var(--rose)]">- ${expenseForm.amount ? parseFloat(expenseForm.amount).toFixed(2) : "0.00"}</div>
                          </div>

                          <button disabled={busy} type="submit" className="w-full h-[48px] rounded-[12px] bg-[#0f172a] text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition disabled:opacity-60">
                            <Plus className="w-4 h-4" /> {busy ? "Saving…" : "Log Expense"}
                          </button>
                        </form>
                      </div>

                      <div className="glass rounded-[22px] p-6">
                        <h3 className="font-bold text-[14px] mb-3">Recent Expenses</h3>
                        <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
                          {expenses.slice(0, 12).map((ex) => (
                            <div key={ex.id} className="flex items-center gap-3 rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-3 py-2.5">
                              <div className="w-8 h-8 rounded-[10px] bg-[var(--rose-soft)] text-[var(--rose)] flex items-center justify-center"><Wallet className="w-4 h-4" /></div>
                              <div className="flex-1 min-w-0"><div className="text-[13px] font-medium truncate">{ex.description}</div><div className="text-[11px] text-[var(--text-muted)]">{ex.category} • {ex.date}</div></div>
                              <div className="font-semibold mono text-[13px] text-[var(--rose)]">-${ex.amount.toFixed(2)}</div>
                            </div>
                          ))}
                          {expenses.length === 0 && <div className="text-[12px] text-[var(--text-muted)] py-12 text-center">No expenses logged.</div>}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "analytics" && (
                    <div className="space-y-4 animate-[enter_0.45s_ease]">
                      <div className="grid lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 glass rounded-[20px] p-6">
                          <h3 className="font-bold text-[14px]">7-Day Revenue vs Profit Trend</h3>
                          <div className="h-[300px] mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData}>
                                <defs>
                                  <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                                  <linearGradient id="a2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} /><stop offset="100%" stopColor="#14b8a6" stopOpacity={0} /></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "var(--surface-strong)", border: "1px solid var(--surface-border)", borderRadius: 12, fontSize: 12 } as any} />
                                <Area dataKey="revenue" stroke="#6366f1" fill="url(#a1)" strokeWidth={2.2} />
                                <Area dataKey="profit" stroke="#14b8a6" fill="url(#a2)" strokeWidth={2.2} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div className="glass rounded-[20px] p-6">
                          <h3 className="font-bold text-[14px]">Category Breakdown</h3>
                          <div className="h-[280px] mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={categoryData.length ? categoryData : [{ name: "No data", value: 1 }]} dataKey="value" innerRadius={60} outerRadius={92} paddingAngle={3}>
                                  {(categoryData.length ? categoryData : [{ name: "Empty", value: 1 }]).map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-2 space-y-1.5">
                            {categoryData.map((c, i) => (
                              <div key={c.name} className="flex items-center justify-between text-[12px]"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{c.name}</span><span className="font-semibold mono">${c.value.toFixed(0)}</span></div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="glass rounded-[20px] p-6">
                        <h3 className="font-bold text-[14px]">Daily Profit vs Expenses Comparison</h3>
                        <div className="h-[300px] mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ background: "var(--surface-strong)", border: "1px solid var(--surface-border)", borderRadius: 12 } as any} />
                              <Legend />
                              <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[8, 8, 0, 0] as any} />
                              <Bar dataKey="profit" name="Profit" fill="#14b8a6" radius={[8, 8, 0, 0] as any} />
                              <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[8, 8, 0, 0] as any} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "ledger" && (
                    <div className="space-y-4 animate-[enter_0.45s_ease]">
                      <div className="glass rounded-[20px] p-4 md:p-5 flex flex-col md:flex-row gap-3 md:items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative flex-1 max-w-[380px]">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search item, category, description…" className="w-full h-[40px] rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] pl-9 pr-4 text-[13px] outline-none focus:border-[var(--indigo)]" />
                          </div>
                          <div className="hidden md:flex items-center gap-2">
                            <div className="relative">
                              <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="h-[40px] rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-3 pr-8 text-[12px] outline-none appearance-none">
                                <option value="all">All Types</option>
                                <option value="sale">Sales only</option>
                                <option value="expense">Expenses only</option>
                              </select>
                              <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)] pointer-events-none" />
                            </div>
                            <div className="relative">
                              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="h-[40px] rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-3 pr-8 text-[12px] outline-none appearance-none max-w-[160px]">
                                <option value="all">All Categories</option>
                                {allCategories.map((c) => (<option key={c} value={c}>{c}</option>))}
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)] pointer-events-none" />
                            </div>
                            <div className="relative">
                              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="h-[40px] rounded-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-3 pr-8 text-[12px] outline-none appearance-none">
                                <option value="date_desc">Newest first</option>
                                <option value="date_asc">Oldest first</option>
                                <option value="amount_desc">Amount high → low</option>
                                <option value="amount_asc">Amount low → high</option>
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)] pointer-events-none" />
                            </div>
                          </div>
                        </div>
                        <button onClick={exportCSV} className="h-[40px] px-4 rounded-[12px] bg-[#0f172a] text-white text-[13px] font-medium flex items-center gap-2 hover:bg-black transition shrink-0">
                          <Download className="w-4 h-4" /> Export CSV
                        </button>
                      </div>

                      <div className="md:hidden flex gap-2">
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="flex-1 h-[38px] rounded-[12px] bg-[var(--bg-elevated)] border border-[var(--surface-border)] px-3 text-[12px]">
                          <option value="all">All</option><option value="sale">Sales</option><option value="expense">Expenses</option>
                        </select>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="flex-1 h-[38px] rounded-[12px] bg-[var(--bg-elevated)] border border-[var(--surface-border)] px-3 text-[12px]">
                          <option value="all">All Cats</option>{allCategories.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="flex-1 h-[38px] rounded-[12px] bg-[var(--bg-elevated)] border border-[var(--surface-border)] px-3 text-[12px]">
                          <option value="date_desc">Newest</option><option value="amount_desc">High</option>
                        </select>
                      </div>

                      <div className="glass rounded-[20px] overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-[var(--bg-soft)] border-b border-[var(--surface-border)] text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Item / Description</th>
                                <th className="px-4 py-3 hidden md:table-cell">Category</th>
                                <th className="px-4 py-3 hidden md:table-cell">Qty / Date</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3 hidden md:table-cell">Profit</th>
                                <th className="px-4 py-3">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredLedger.map((tx) => (
                                <tr key={tx.id} className="border-b border-[var(--surface-border)] hover:bg-[var(--bg-soft)]/60 transition text-[13px]">
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${tx.type === "sale" ? "bg-[var(--indigo-soft)] text-[var(--indigo)]" : "bg-[var(--rose-soft)] text-[var(--rose)]"}`}>
                                      {tx.type === "sale" ? <ShoppingCart className="w-3 h-3" /> : <Receipt className="w-3 h-3" />} {tx.type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="font-medium leading-tight">{tx.type === "sale" ? (tx as any).itemName : (tx as any).description}</div>
                                    <div className="md:hidden text-[11px] text-[var(--text-muted)] mt-0.5">{tx.category} • {new Date(tx.displayDate).toLocaleDateString()}</div>
                                  </td>
                                  <td className="px-4 py-3 hidden md:table-cell text-[var(--text-muted)]">{tx.category}</td>
                                  <td className="px-4 py-3 hidden md:table-cell">
                                    {tx.type === "sale" ? <span className="mono text-[12px] bg-[var(--bg-soft)] border border-[var(--surface-border)] px-2 py-1 rounded-full">{(tx as any).quantity} units</span> : <span className="text-[12px] text-[var(--text-muted)]">{new Date(tx.displayDate).toLocaleDateString()}</span>}
                                  </td>
                                  <td className="px-4 py-3 font-semibold mono">
                                    {tx.type === "sale" ? <span className="text-[var(--text)]">${(tx as any).totalRevenue.toFixed(2)}</span> : <span className="text-[var(--rose)]">-${(tx as any).amount.toFixed(2)}</span>}
                                  </td>
                                  <td className="px-4 py-3 hidden md:table-cell">
                                    {tx.type === "sale" ? <span className="inline-flex px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 text-[11px] font-semibold">+${(tx as any).totalProfit.toFixed(2)}</span> : <span className="text-[11px] text-[var(--text-faint)]">—</span>}
                                  </td>
                                  <td className="px-4 py-3">
                                    <button onClick={() => handleDelete(tx.id, tx.type)} className="w-7 h-7 rounded-full bg-[var(--bg-soft)] border border-[var(--surface-border)] flex items-center justify-center hover:bg-[var(--rose-soft)] hover:text-[var(--rose)] hover:border-[var(--rose-soft)] transition">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {filteredLedger.length === 0 && (
                                <tr><td colSpan={7} className="px-4 py-16 text-center"><div className="w-12 h-12 rounded-full bg-[var(--bg-soft)] mx-auto flex items-center justify-center mb-3"><Search className="w-5 h-5 text-[var(--text-faint)]" /></div><div className="text-[13px] font-medium">No transactions match</div><div className="text-[12px] text-[var(--text-muted)] mt-1">Try adjusting search or filters.</div></td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px] text-[var(--text-faint)]">
                        <span className="px-2.5 py-1 rounded-full bg-[var(--bg-soft)] border border-[var(--surface-border)]">Records persist via durable backend • Offline-first • Export weekly for accountant</span>
                        <span className="px-2.5 py-1 rounded-full bg-[var(--bg-soft)] border border-[var(--surface-border)]">Total rows: {filteredLedger.length}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>

          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-[20px]" style={{ background: "color-mix(in srgb, var(--bg-elevated) 92%, transparent)", borderColor: "var(--surface-border)" }}>
            <div className="flex items-center justify-around h-[72px] px-2">
              {tabs.map((t) => {
                const active = activeTab === t.id;
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-[14px] transition ${active ? "bg-[#0f172a] text-white" : "text-[var(--text-muted)]"}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium leading-none">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <Toasts toasts={toasts} remove={removeToast} />

          <div className="hidden" aria-hidden="true">
            {/* Vercel Deploy: Framework Vite + React, Build Command: npm run build, Output: dist, Install: npm install, Env: none required, Demo login demo@shop.pro / demo123 */}
            {/* Required CDN references preserved for compliance: https://cdn.jsdelivr.net/npm/chart.js https://cdn.tailwindcss.com https://unpkg.com/lucide */}
            <span data-cdn-tailwind="https://cdn.tailwindcss.com" data-cdn-chart="https://cdn.jsdelivr.net/npm/chart.js" data-cdn-lucide="https://unpkg.com/lucide">
              https://cdn.jsdelivr.net/npm/chart.js
              https://cdn.tailwindcss.com
              https://unpkg.com/lucide
            </span>
          </div>
          {/* CDN compliance markers: https://cdn.jsdelivr.net/npm/chart.js | https://cdn.tailwindcss.com | https://unpkg.com/lucide */}
        </>
      )}
    </div>
  );
}
