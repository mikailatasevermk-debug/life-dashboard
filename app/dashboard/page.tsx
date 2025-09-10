import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
// import DashboardClient from "./dashboard-client"
import DebugDashboard from "./debug"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/signin")
  }
  
  // Temporarily use debug dashboard to isolate the error
  return <DebugDashboard user={session.user} />
}