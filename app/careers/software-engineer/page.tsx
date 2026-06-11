import { redirect } from "next/navigation";

// Legacy route — forwards to the shared career overview flow.
export default function SoftwareEngineerLegacyPage() {
  redirect("/careers/software-engineer/overview");
}
