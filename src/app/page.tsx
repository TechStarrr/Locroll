import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-background text-brand-text font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0c1324]/60 backdrop-blur-xl transition-all duration-300">
        <div className="flex justify-between items-center px-8 py-6 max-w-screen-2xl mx-auto">
          <Link href="/" className="text-xl font-black uppercase tracking-tighter text-[#13f09c]">
            NEON_NOIR
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-[#dce1fb] font-medium hover:text-[#13f09c] transition-colors duration-300" href="#">Services</a>
            <a className="text-[#dce1fb] font-medium hover:text-[#13f09c] transition-colors duration-300" href="#">Showcase</a>
            <Link href="/dashboard" className="text-[#13f09c] font-bold border-b-2 border-[#13f09c] pb-1">Terminal</Link>
            <a className="text-[#dce1fb] font-medium hover:text-[#13f09c] transition-colors duration-300" href="#">About</a>
          </div>
          <Link href="/dashboard" className="bg-[#13f09c] text-[#0c1324] px-6 py-2.5 rounded-sm font-bold uppercase text-xs tracking-widest hover:scale-95 duration-200 transition-transform">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative min-h-[921px] flex items-center justify-center overflow-hidden px-6">
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] gradient-blur"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#13f09c]/10 rounded-full blur-[100px]"></div>
          </div>
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-white mb-8">
                Pay anyone,<br /><span className="text-[#13f09c]">anywhere.</span>
              </h1>
              <p className="text-xl md:text-2xl text-[#dce1fb]/70 max-w-lg mb-10 font-medium">
                Settle in half a second. Global payroll that feels like a local transfer.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard" className="bg-[#13f09c] text-[#0c1324] px-8 py-4 rounded-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all">
                  Launch Terminal
                </Link>
                <button className="border border-[#13f09c]/30 text-white px-8 py-4 rounded-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="relative h-[500px] hidden lg:block">
              <div className="absolute top-0 right-0 w-[400px] bg-[#070d1f] border border-white/10 p-6 rounded-lg shadow-2xl backdrop-blur-md z-20">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#13f09c]">Treasury Live</span>
                  <div className="h-2 w-2 rounded-full bg-[#13f09c] animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-1 bg-white/5 w-full"></div>
                  <div className="text-3xl font-mono text-white">$1,482,900.00</div>
                  <div className="flex gap-2">
                    <div className="h-8 w-1/3 bg-[#13f09c]/20 border border-[#13f09c]/30"></div>
                    <div className="h-8 w-2/3 bg-white/5"></div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-10 left-0 w-[350px] bg-[#070d1f] border border-[#13f09c]/20 p-6 rounded-lg shadow-2xl z-30">
                <div className="text-xs font-mono text-[#dce1fb]/50 mb-2">RUNNING PAYROLL #092</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Engineers (12)</span>
                    <span className="text-sm text-[#13f09c]">PENDING</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 overflow-hidden">
                    <div className="bg-[#13f09c] h-full w-[65%]"></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                    <span>TX_ID: 0x42...F92</span>
                    <span>0.5s SETTLEMENT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-32 bg-[#070d1f] relative border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20 max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
                International payroll is <span className="text-red-500">bleeding</span> your business.
              </h2>
              <p className="text-[#dce1fb]/60 text-lg">Legacy systems are slow, expensive, and outdated. We built the alternative.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 border border-white/5 bg-[#0c1324] group hover:border-[#13f09c]/50 transition-all duration-500">
                <div className="text-6xl font-black text-[#13f09c] mb-4">$47</div>
                <p className="text-sm uppercase tracking-widest font-mono text-white/50 mb-2">Avg. Wire Fee</p>
                <p className="text-[#dce1fb]/80">Traditional banks charge exorbitant fees for every cross-border transaction.</p>
              </div>
              <div className="p-8 border border-white/5 bg-[#0c1324] group hover:border-[#13f09c]/50 transition-all duration-500">
                <div className="text-6xl font-black text-[#13f09c] mb-4">2-5</div>
                <p className="text-sm uppercase tracking-widest font-mono text-white/50 mb-2">Working Days</p>
                <p className="text-[#dce1fb]/80">The time your employees wait for their money while banks play with capital.</p>
              </div>
              <div className="p-8 border border-white/5 bg-[#0c1324] group hover:border-[#13f09c]/50 transition-all duration-500">
                <div className="text-6xl font-black text-[#13f09c] mb-4">6.2%</div>
                <p className="text-sm uppercase tracking-widest font-mono text-white/50 mb-2">FX Spread Loss</p>
                <p className="text-[#dce1fb]/80">Hidden exchange rate markups that quietly drain your operational budget.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto space-y-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <span className="text-[#13f09c] font-mono text-xs tracking-[0.3em] uppercase mb-4 block">Engine Efficiency</span>
                <h3 className="text-5xl font-black text-white mb-6">Instant Settlement.</h3>
                <p className="text-xl text-[#dce1fb]/70 leading-relaxed mb-8">
                  Why wait days? Our proprietary ledger technology settles transactions in under 500ms, regardless of distance or currency.
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono uppercase">
                      <span>Legacy Rails</span>
                      <span>72+ Hours</span>
                    </div>
                    <div className="w-full bg-white/5 h-2">
                      <div className="bg-white/20 h-full w-full"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono uppercase text-[#13f09c]">
                      <span>NEON_NOIR</span>
                      <span>0.5 Seconds</span>
                    </div>
                    <div className="w-full bg-white/5 h-2">
                      <div className="bg-[#13f09c] h-full w-[2%]"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#13f09c]/5 to-transparent border border-white/5 rounded-2xl p-8 aspect-video flex items-center justify-center">
                <div className="w-full font-mono text-[10px] md:text-sm text-[#13f09c]/80 overflow-hidden">
                  <p>&gt; INIT_TRANSFER: $50,000.00 USD -&gt; EUR</p>
                  <p>&gt; ROUTING via LIGHT_RAIL_CORE...</p>
                  <p className="text-white">&gt; [SUCCESS] HASH: 0x82...E11</p>
                  <p>&gt; SETTLEMENT_TIME: 488ms</p>
                  <div className="mt-4 h-1 w-full bg-white/5">
                    <div className="bg-[#13f09c] h-full w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-b from-[#13f09c]/10 to-transparent border border-[#13f09c]/20 p-12 md:p-24 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#13f09c] to-transparent"></div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tight leading-none">
              Ready for the future of capital movement?
            </h2>
            <Link href="/dashboard" className="inline-block bg-[#13f09c] text-[#0c1324] px-12 py-5 rounded-sm font-bold uppercase tracking-[0.2em] hover:scale-105 duration-300 shadow-[0_0_50px_rgba(19,240,156,0.3)]">
              Contact Sales
            </Link>
          </div>
        </section>
      </main>

      <footer className="w-full py-12 px-8 bg-[#070d1f] border-t border-white/5">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 w-full">
          <div className="flex flex-col gap-4">
            <div className="text-lg font-bold text-[#13f09c] uppercase tracking-tighter">NEON_NOIR</div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#dce1fb]/50">
              © 2024 NEON_NOIR DIGITAL. ALL RIGHTS RESERVED.
            </p>
          </div>
          <div className="flex gap-10">
            <a className="font-mono text-xs uppercase tracking-widest text-[#dce1fb]/50 hover:text-[#13f09c] transition-opacity" href="#">Privacy</a>
            <a className="font-mono text-xs uppercase tracking-widest text-[#dce1fb]/50 hover:text-[#13f09c] transition-opacity" href="#">Terms</a>
            <a className="font-mono text-xs uppercase tracking-widest text-[#dce1fb]/50 hover:text-[#13f09c] transition-opacity" href="#">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
