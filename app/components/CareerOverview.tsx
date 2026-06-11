import Link from "next/link";
import type { CareerConfig } from "@/lib/careers";

interface CareerOverviewProps {
  career: CareerConfig;
}

export default function CareerOverview({ career }: CareerOverviewProps) {
  const { overview } = career;

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-12">
      <div className="flex flex-col gap-6">
        <section className="space-y-4">
          <div className="inline-flex rounded-full bg-sky-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
            {career.title} Overview
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {overview.headline}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
              {overview.intro}
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={`/careers/${career.slug}/scenario`}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-8 py-4 text-base font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Start Simulation
            </Link>
            <p className="text-sm text-zinc-400">{overview.simulationBlurb}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6 rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-white">What {career.title}s Do</h2>
              <p className="text-sm leading-7 text-zinc-300">{overview.whatTheyDo}</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-white">Required Skills</h2>
              <ul className="space-y-2 text-sm leading-7 text-zinc-300">
                {overview.skills.map((skill) => (
                  <li key={skill}>• {skill}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-white">Educational Pathways</h2>
              <ul className="space-y-2 text-sm leading-7 text-zinc-300">
                {overview.education.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl shadow-black/20 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white">Typical Salary Ranges</h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-300">
                {overview.salaryRanges.map((salary) => (
                  <div key={salary.region} className="rounded-3xl bg-zinc-950/80 p-4">
                    <p className="font-semibold text-white">{salary.region}</p>
                    <p>{salary.range}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl shadow-black/20 backdrop-blur">
              <h2 className="text-2xl font-semibold text-white">Pros &amp; Cons</h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-300">
                <div>
                  <p className="font-semibold text-white">Pros</p>
                  <ul className="mt-3 space-y-2">
                    {overview.pros.map((pro) => (
                      <li key={pro}>• {pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-white">Cons</p>
                  <ul className="mt-3 space-y-2">
                    {overview.cons.map((con) => (
                      <li key={con}>• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Day in the Life</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-300">
              {overview.dayInLife.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Career Progression Roadmap</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-300">
              {overview.progression.map((step) => (
                <div key={step.title} className="space-y-2 rounded-3xl bg-zinc-950/80 p-4">
                  <p className="font-semibold text-white">{step.title}</p>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
