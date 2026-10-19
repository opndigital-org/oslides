import { WorkInProgress } from "@/components/WorkInProgress"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="mx-auto min-h-[calc(100dvh-4rem)] w-full max-w-7xl px-6 py-10">
      <WorkInProgress />
    </main>
  )
}
