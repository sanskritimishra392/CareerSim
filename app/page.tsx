import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-10 sm:px-8 lg:px-12">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-12">
          <div className="max-w-4xl space-y-8">
            <div className="flex flex-col gap-4">
              <span className="inline-flex rounded-full bg-sky-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
                CareerSim</span>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                Experience Your Future Career Before Choosing It
              </h1>
              <p className="max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
                CareerSim helps students explore in-demand jobs through immersive simulations, AI-powered feedback, and guided discovery so they can make confident career decisions early.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/careers"
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400"
              >
                Start Exploring
              </Link>
              <p className="max-w-2xl text-sm text-zinc-400">
                Start exploring realistic career paths with a polished student experience that blends simulation, coaching, and discovery.
              </p>
            </div>
          </div>

          <section id="start" className="mt-16 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 text-left shadow-xl shadow-black/20 backdrop-blur">
              <div className="mb-4 inline-flex rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
                Real Career Simulations</div>
              <h2 className="text-xl font-semibold text-white">Real Career Simulations</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Step into professional roles with interactive scenarios that mimic real workplace challenges and decision points.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 text-left shadow-xl shadow-black/20 backdrop-blur">
              <div className="mb-4 inline-flex rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-violet-200">
                AI Feedback</div>
              <h2 className="text-xl font-semibold text-white">AI Feedback</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Receive personalized performance insights and growth recommendations to build confidence and clarity faster.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 text-left shadow-xl shadow-black/20 backdrop-blur">
              <div className="mb-4 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
                Career Exploration</div>
              <h2 className="text-xl font-semibold text-white">Career Exploration</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Discover curated career tracks, role comparisons, and next-step guidance that help students choose with purpose.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
