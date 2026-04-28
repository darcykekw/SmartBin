"use client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function BinCard({ bin }: { bin: any }) {
  const latestLog = bin.latestLog;
  
  const fillLevel = latestLog ? latestLog.fill_level_percent : 0;
  let statusText = latestLog ? latestLog.status : "Empty";
  
  let statusColor = "from-emerald-400 to-green-600";
  let shadowColor = "shadow-emerald-500/20";
  let textColor = "text-emerald-400";

  if (statusText === "Full") {
    statusColor = "from-red-500 to-rose-700";
    shadowColor = "shadow-red-500/20";
    textColor = "text-red-400";
  } else if (statusText === "Half-Full") {
    statusColor = "from-yellow-400 to-amber-600";
    shadowColor = "shadow-yellow-500/20";
    textColor = "text-yellow-400";
  }

  const lastUpdated = latestLog 
    ? formatDistanceToNow(new Date(latestLog.recorded_at), { addSuffix: true })
    : "Never updated";

  return (
    <Link href={`/dashboard/${bin.id}`} className="block">
      <div className={`p-6 rounded-2xl bg-slate-800/40 border border-slate-700 backdrop-blur-sm shadow-xl hover:${shadowColor} transition-all duration-300 relative overflow-hidden group cursor-pointer`}>
        <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${statusColor} rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity`} />
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{bin.name}</h3>
            <p className="text-sm text-slate-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {bin.location || "Unspecified"}
            </p>
          </div>
          <div className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-500">
            ID: {bin.id.substring(0,6)}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-slate-300 text-sm font-medium">Fill Level</span>
            <span className={`text-2xl font-bold ${textColor}`}>{fillLevel}%</span>
          </div>
          
          <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${statusColor} transition-all duration-1000 ease-out`}
              style={{ width: `${fillLevel}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3">
                {statusText === "Full" && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-gradient-to-r ${statusColor}`}></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r ${statusColor}`}></span>
              </div>
              <span className={`text-sm font-medium ${textColor}`}>{statusText}</span>
            </div>
            <div className="text-xs text-slate-500">
              Dist: {latestLog ? latestLog.distance_cm : bin.capacity_cm} cm
            </div>
          </div>
          
          <div className="text-xs text-slate-400 mt-1">
            Last update: {lastUpdated}
          </div>
        </div>
      </div>
    </Link>
  );
}
