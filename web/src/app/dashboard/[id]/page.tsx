"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function BinDetails() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchBinDetails();
      const interval = setInterval(fetchBinDetails, 5000);
      return () => clearInterval(interval);
    }
  }, [status, router, params.id]);

  const fetchBinDetails = async () => {
    try {
      const res = await fetch(`/api/bins/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return <div className="flex h-[50vh] items-center justify-center">Loading...</div>;
  }

  if (!data || !data.bin) {
    return <div className="text-center py-20">Bin not found</div>;
  }

  const { bin, logs } = data;
  const latestLog = logs.length > 0 ? logs[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-6 inline-block">
        &larr; Back to Dashboard
      </Link>
      
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{bin.name}</h1>
        <p className="text-slate-400">Location: {bin.location}</p>
        <p className="text-slate-400">Capacity: {bin.capacity_cm} cm</p>
        
        {latestLog && (
          <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-slate-700">
            <h3 className="text-lg font-semibold mb-2">Current Status</h3>
            <div className="flex gap-4">
              <div>Level: <span className="font-bold text-emerald-400">{latestLog.fill_level_percent}%</span></div>
              <div>State: <span className="font-bold text-yellow-400">{latestLog.status}</span></div>
              <div>Distance: <span className="font-bold text-blue-400">{latestLog.distance_cm} cm</span></div>
            </div>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4">Activity Logs</h2>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900/80 text-slate-300 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Fill Level</th>
              <th className="px-6 py-4">Distance (cm)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 text-slate-400">{new Date(log.recorded_at).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium
                    ${log.status === 'Empty' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      log.status === 'Half-Full' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                      'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono">{log.fill_level_percent}%</td>
                <td className="px-6 py-4 font-mono text-slate-400">{log.distance_cm}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No logs available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
