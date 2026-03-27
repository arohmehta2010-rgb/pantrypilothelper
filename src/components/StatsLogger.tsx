import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, TrendingDown, TrendingUp, Minus, Scale, Trash2, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface WeightLog {
  id: string;
  weight: number;
  weight_unit: string;
  body_fat_percent: number | null;
  muscle_mass: number | null;
  notes: string | null;
  logged_at: string;
}

const StatsLogger = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("lbs");
  const [bodyFat, setBodyFat] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [notes, setNotes] = useState("");

  const fetchLogs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("weight_logs")
      .select("*")
      .order("logged_at", { ascending: true });
    if (data) setLogs(data as WeightLog[]);
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !weight) return;
    setLoading(true);

    const { error } = await supabase.from("weight_logs").insert({
      user_id: user.id,
      weight: parseFloat(weight),
      weight_unit: unit,
      body_fat_percent: bodyFat ? parseFloat(bodyFat) : null,
      muscle_mass: muscleMass ? parseFloat(muscleMass) : null,
      notes: notes || null,
    });

    if (error) {
      toast.error("Failed to log stats");
    } else {
      toast.success("Stats logged!");
      setWeight("");
      setBodyFat("");
      setMuscleMass("");
      setNotes("");
      setShowForm(false);
      fetchLogs();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("weight_logs").delete().eq("id", id);
    if (!error) {
      setLogs((prev) => prev.filter((l) => l.id !== id));
      toast.success("Entry deleted");
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-lg text-center space-y-4 py-16">
        <Scale className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <h2 className="text-xl font-bold text-foreground">Track Your Progress</h2>
        <p className="text-sm text-muted-foreground">Sign in to log your weight and body stats over time</p>
        <Button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </div>
    );
  }

  const chartData = logs.map((l) => ({
    date: new Date(l.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weight: l.weight,
    bodyFat: l.body_fat_percent,
  }));

  const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight : null;
  const previousWeight = logs.length > 1 ? logs[logs.length - 2].weight : null;
  const weightDiff = latestWeight && previousWeight ? latestWeight - previousWeight : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Body Stats</h1>
        <p className="text-sm text-muted-foreground">Track your weight and body composition over time</p>
      </div>

      {/* Quick stats */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card/40 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{latestWeight}</p>
            <p className="text-xs text-muted-foreground mt-1">Current ({logs[logs.length - 1].weight_unit})</p>
          </div>
          <div className="rounded-xl border border-border bg-card/40 p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              {weightDiff !== null && (
                <>
                  {weightDiff > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-400" />
                  ) : weightDiff < 0 ? (
                    <TrendingDown className="h-4 w-4 text-primary" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={`text-2xl font-bold ${weightDiff > 0 ? "text-red-400" : weightDiff < 0 ? "text-primary" : "text-foreground"}`}>
                    {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)}
                  </span>
                </>
              )}
              {weightDiff === null && <span className="text-2xl font-bold text-muted-foreground">—</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Change</p>
          </div>
          <div className="rounded-xl border border-border bg-card/40 p-4 text-center col-span-2 sm:col-span-1">
            <p className="text-2xl font-bold text-foreground">{logs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Entries</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="rounded-xl border border-border bg-card/40 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Weight Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }} />
              <YAxis domain={["auto", "auto"]} tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(0 0% 10%)",
                  border: "1px solid hsl(0 0% 16%)",
                  borderRadius: "8px",
                  color: "hsl(0 0% 93%)",
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="weight" stroke="hsl(142 60% 50%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(142 60% 50%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add entry */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Log New Entry</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Weight *</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  className="h-10 bg-card/40 border-border"
                  placeholder="185"
                />
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="h-10 w-20 bg-card/40 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Body Fat %</Label>
              <Input
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="h-10 bg-card/40 border-border"
                placeholder="15"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-10 bg-card/40 border-border"
              placeholder="e.g. after morning weigh-in"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 border-border">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
              {loading ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </form>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          Log New Entry
        </Button>
      )}

      {/* History */}
      {logs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1">History</h3>
          {[...logs].reverse().map((log) => (
            <div key={log.id} className="flex items-center gap-3 rounded-xl border border-border bg-card/40 px-4 py-3 group">
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-foreground">{log.weight} {log.weight_unit}</span>
                  {log.body_fat_percent && (
                    <span className="text-xs text-muted-foreground">{log.body_fat_percent}% BF</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(log.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  {log.notes && (
                    <>
                      <span className="text-border">·</span>
                      <span className="text-[11px] text-muted-foreground">{log.notes}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(log.id)}
                className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatsLogger;
