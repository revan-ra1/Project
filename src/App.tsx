import { useState } from "react"
import {
  Dashboard,
  BlueprintBuilder,
  ContractEditor,
  CreateContract
} from "./core"

export default function App() {
  const [page, setPage] = useState("dashboard")
  const [activeId, setActiveId] = useState<string | null>(null)

  const open = (p: string, id?: string) => {
    setActiveId(id || null)
    setPage(p)
  }

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur shadow px-6 py-4 grid grid-cols-3 items-center">
        {/* Left spacer */}
        <div></div>

        {/* Center title */}
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent text-center tracking-wide">
          Contract Platform
        </h1>

        {/* Right buttons */}
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={() => open("dashboard")}>
            Dashboard
          </button>

          <button
            className="btn-primary"
            onClick={() => open("blueprint")}
          >
            New Blueprint
          </button>

          <button
            className="btn-primary"
            onClick={() => open("create")}
          >
            New Contract
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-6">
        {page === "dashboard" && <Dashboard open={open} />}

        {page === "blueprint" && (
          <BlueprintBuilder back={() => open("dashboard")} />
        )}

        {page === "create" && (
          <CreateContract back={() => open("dashboard")} />
        )}

        {page === "contract" && activeId && (
          <ContractEditor
            id={activeId}
            back={() => open("dashboard")}
          />
        )}
      </main>
    </div>
  )
}
