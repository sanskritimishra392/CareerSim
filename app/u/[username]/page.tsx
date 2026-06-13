import PublicPortfolio from "@/app/components/PublicPortfolio";

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <PublicPortfolio username={username} />
    </div>
  );
}