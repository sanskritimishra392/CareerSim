import SkillTreeView from "@/app/components/SkillTreeView";

export default async function SkillTreePage({
  params,
}: {
  params: Promise<{ career: string }>;
}) {
  const { career } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <SkillTreeView careerKey={career} />
    </div>
  );
}