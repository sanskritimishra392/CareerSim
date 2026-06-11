import Link from "next/link";
import { CAREERS } from "@/lib/careers";

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 sm:px-8 lg:px-12">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-12">
          <div className="max-w-4xl space-y-6">
            <div className="space-y-3">
              <p className="inline-flex rounded-full bg-sky-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
                Explore Careers
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Choose the right career path with immersive role previews.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
                Browse our curated career options and start exploring simulations, skills, and real-world expectations for each role.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {CAREERS.map((career) => (
                <Link
                  key={career.key}
                  href={`/careers/${career.slug}/overview`}
                  className="group block overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-sky-400/20 hover:bg-zinc-900/80"
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-500/10 text-2xl">
                      {career.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">{career.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{career.description}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <span className="inline-flex items-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition group-hover:bg-sky-400">
                      Explore
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
