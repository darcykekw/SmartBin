import Link from "next/link";

export default function Home() {
  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Waste Management, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Reimagined.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
            SmartBin uses IoT sensors to monitor fill levels in real-time, providing auditory and visual feedback to users, and actionable data to you.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-8 py-4 rounded-xl font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(52,211,153,0.3)]"
            >
              Start Monitoring
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700"
            >
              Dashboard Login
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            <FeatureCard title="Real-time Tracking" desc="Ultrasonic sensors track fill levels continuously." icon="📡" />
            <FeatureCard title="Interactive Feedback" desc="RGB LEDs and buzzers guide users instantly." icon="✨" />
            <FeatureCard title="Data Analytics" desc="View historical logs to optimize waste collection." icon="📊" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string, desc: string, icon: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm text-left hover:border-emerald-500/30 transition-colors">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
