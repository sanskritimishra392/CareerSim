import ScenarioScreen from "@/app/components/ScenarioScreen";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-black">
      <ScenarioScreen careerKey={slug} />
    </div>
  );
}
