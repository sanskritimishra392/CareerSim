import { notFound } from "next/navigation";
import CareerOverview from "@/app/components/CareerOverview";
import { CAREERS, getCareerBySlug } from "@/lib/careers";

interface CareerOverviewPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CAREERS.map((career) => ({ slug: career.slug }));
}

export default async function CareerOverviewPage({ params }: CareerOverviewPageProps) {
  const { slug } = await params;
  const career = getCareerBySlug(slug);

  if (!career) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
        <CareerOverview career={career} />
      </main>
    </div>
  );
}
