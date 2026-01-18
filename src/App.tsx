import { useState } from "react"
import { Dashboard, BlueprintBuilder, ContractEditor } from "./core"

export default function App() {
  const [page, setPage] = useState("dashboard")
  const [activeId, setActiveId] = useState<string | null>(null)

  const open = (p: string, id?: string) => {
    setActiveId(id || null)
    setPage(p)
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow px-6 py-4 flex justify-between">
        <h1 className="text-xl font-semibold">Contract Platform</h1>
        <div className="space-x-2">
          <button className="btn" onClick={() => open("dashboard")}>Dashboard</button>
          <button className="btn-primary" onClick={() => open("blueprint")}>New Blueprint</button>
        </div>
      </header>

      <main className="p-6">
        {page === "dashboard" && <Dashboard open={open} />}
        {page === "blueprint" && <BlueprintBuilder back={() => open("dashboard")} />}
        {page === "contract" && activeId && (
          <ContractEditor id={activeId} back={() => open("dashboard")} />
        )}
      </main>
    </div>
  )
}
