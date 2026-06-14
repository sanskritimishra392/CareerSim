import AdaptiveInterviewScreen from "@/app/components/AdaptiveInterviewScreen";

// This is a simplified demo entry point for the adaptive interview.
// In production, career, company, and scenario would come from URL params or user selection.

export default async function AdaptiveInterviewPage({
  params,
}: {
  params: Promise<{ career: string }>;
}) {
  const { career } = await params;

  // Default demo values
  const companyId = "google";
  const companyName = "Google";
  const scenario = `You are a ${career.replace(/-/g, " ")} professional interviewing at ${companyName}. 
The interviewer wants to assess your technical depth, problem-solving ability, and domain expertise through a series of adaptive questions that build on your answers.`;

  return (
    <div className="min-h-screen bg-black">
      <AdaptiveInterviewScreen
        careerKey={career}
        companyId={companyId}
        companyName={companyName}
        scenario={scenario}
      />
    </div>
  );
}