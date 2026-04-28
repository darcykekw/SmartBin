"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BinCard from "@/components/BinCard";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bins, setBins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);

  // New Bin Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBin, setNewBin] = useState({ name: "", location: "", capacity_cm: 100 });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchBins();
      const interval = setInterval(fetchBins, 5000); // Polling every 5 seconds
      return () => clearInterval(interval);
    }
  }, [status, router]);

  const fetchBins = async () => {
    try {
      const res = await fetch("/api/bins");
      if (res.ok) {
        const data = await res.json();
        
        // Enhance bins with their latest log data
        const enhancedBins = await Promise.all(data.map(async (bin: any) => {
          const logRes = await fetch(`/api/bins/${bin.id}`);
          if (logRes.ok) {
            const { logs } = await logRes.json();
            return { ...bin, latestLog: logs.length > 0 ? logs[0] : null };
          }
          return bin;
        }));
        
        setBins(enhancedBins);
        
        // Check for FULL alerts
        const fullBins = enhancedBins.filter(b => b.latestLog?.status === "Full");
        setAlerts(fullBins.map(b => `${b.name} is FULL! Please arrange for collection.`));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/bins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBin),
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewBin({ name: "", location: "", capacity_cm: 100 });
        fetchBins(); // Refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || status === "loading") {
    return <div className="flex h-[50vh] items-center justify-center">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      
      {/* NOTIFICATION SYSTEM: Floating Alerts */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
        {alerts.map((alert, idx) => (
          <div key={idx} className="animate-bounce bg-red-500/90 text-white px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] backdrop-blur-md font-bold flex items-center gap-2 border border-red-400">
            <span>⚠️</span>
            {alert}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your SmartBins</h1>
          <p className="text-slate-400">Monitor and manage your waste collection. Auto-updating every 5s.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
        >
          {showAddForm ? "Cancel" : "+ Add New Bin"}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md">
          <h3 className="text-xl font-semibold mb-4">Register New Bin</h3>
          <form onSubmit={handleCreateBin} className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-slate-400 mb-1">Name</label>
              <input type="text" required className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700" value={newBin.name} onChange={e => setNewBin({...newBin, name: e.target.value})} placeholder="e.g. Kitchen Bin" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-slate-400 mb-1">Location</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700" value={newBin.location} onChange={e => setNewBin({...newBin, location: e.target.value})} placeholder="e.g. Floor 1" />
            </div>
            <div className="w-[150px]">
              <label className="block text-sm text-slate-400 mb-1">Depth (cm)</label>
              <input type="number" required className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700" value={newBin.capacity_cm} onChange={e => setNewBin({...newBin, capacity_cm: Number(e.target.value)})} />
            </div>
            <button type="submit" className="px-6 py-2 h-[42px] rounded-lg bg-emerald-500 text-slate-900 font-medium hover:bg-emerald-400">Save</button>
          </form>
        </div>
      )}

      {bins.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-700 rounded-2xl bg-slate-800/20">
          <p className="text-slate-400 mb-4">You haven't registered any SmartBins yet.</p>
          <p className="text-sm text-slate-500">Click the "+ Add New Bin" button to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bins.map((bin) => (
            <BinCard key={bin.id} bin={bin} />
          ))}
        </div>
      )}
    </div>
  );
}
