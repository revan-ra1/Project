import { useState } from "react"

type FieldType = "text" | "date" | "signature" | "checkbox"
type Status = "Created" | "Approved" | "Sent" | "Signed" | "Locked" | "Revoked"

type Field = {
  id: string
  type: FieldType
  label: string
  value?: any
}

type Blueprint = {
  id: string
  name: string
  fields: Field[]
}

type Contract = {
  id: string
  name: string
  blueprintId: string
  fields: Field[]
  status: Status
}

const bpKey = "blueprints"
const ctKey = "contracts"

const getBlueprints = (): Blueprint[] =>
  JSON.parse(localStorage.getItem(bpKey) || "[]")

const saveBlueprints = (v: Blueprint[]) =>
  localStorage.setItem(bpKey, JSON.stringify(v))

const getContracts = (): Contract[] =>
  JSON.parse(localStorage.getItem(ctKey) || "[]")

const saveContracts = (v: Contract[]) =>
  localStorage.setItem(ctKey, JSON.stringify(v))

const flow: Status[] = ["Created", "Approved", "Sent", "Signed", "Locked"]

const nextStatus = (s: Status) =>
  s === "Locked" || s === "Revoked" ? s : flow[flow.indexOf(s) + 1]

/* ---------------- DASHBOARD ---------------- */

export function Dashboard({ open }: any) {
  const [contracts, setContracts] = useState(getContracts())
  const blueprints = getBlueprints()

  const advance = (id: string) => {
    const updated = contracts.map(c =>
      c.id === id ? { ...c, status: nextStatus(c.status) } : c
    )
    setContracts(updated)
    saveContracts(updated)
  }

  return (
    <div className="bg-white rounded shadow p-4">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Blueprint</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map(c => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.name}</td>
              <td className="p-2">
                {blueprints.find(b => b.id === c.blueprintId)?.name || "-"}
              </td>
              <td className="p-2 font-semibold text-blue-600">{c.status}</td>
              <td className="p-2 space-x-2">
                <button className="btn" onClick={() => advance(c.id)}>
                  Next
                </button>
                <button
                  className="btn-primary"
                  onClick={() => open("contract", c.id)}
                >
                  Open
                </button>
              </td>
            </tr>
          ))}
          {contracts.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center p-6 text-gray-500">
                No contracts created yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------- BLUEPRINT BUILDER ---------------- */

export function BlueprintBuilder({ back }: any) {
  const [name, setName] = useState("")
  const [fields, setFields] = useState<Field[]>([])

  const addField = (type: FieldType) => {
    setFields(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        label: type
      }
    ])
  }

  const save = () => {
    if (!name.trim()) {
      alert("Please enter a blueprint name")
      return
    }

    const all = getBlueprints()

    const blueprint: Blueprint = {
      id: crypto.randomUUID(),
      name,
      fields
    }

    saveBlueprints([...all, blueprint])

    alert("Blueprint created successfully")
    back()
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-4">
      <input
        className="input"
        value={name}
        placeholder="Blueprint name"
        onChange={e => setName(e.target.value)}
      />

      <div className="flex gap-2 flex-wrap">
        <button className="btn" onClick={() => addField("text")}>Text</button>
        <button className="btn" onClick={() => addField("date")}>Date</button>
        <button className="btn" onClick={() => addField("signature")}>Signature</button>
        <button className="btn" onClick={() => addField("checkbox")}>Checkbox</button>
      </div>

      <div className="text-sm text-gray-600">
        Fields added: {fields.length}
      </div>

      <button className="btn-primary w-full" onClick={save}>
        Save Blueprint
      </button>
    </div>
  )
}

/* ---------------- CONTRACT EDITOR ---------------- */

export function ContractEditor({ id, back }: any) {
  const [contracts, setContracts] = useState(getContracts())
  const contract = contracts.find(c => c.id === id)

  if (!contract) return null

  const update = (fid: string, value: any) => {
    const updated = contracts.map(c =>
      c.id === id
        ? {
            ...c,
            fields: c.fields.map(f =>
              f.id === fid ? { ...f, value } : f
            )
          }
        : c
    )

    setContracts(updated)
    saveContracts(updated)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-lg font-semibold">{contract.name}</h2>

      {contract.fields.map(f => (
        <div key={f.id}>
          <label className="block text-sm mb-1">{f.label}</label>
          {f.type === "text" && (
            <input
              className="input"
              onChange={e => update(f.id, e.target.value)}
            />
          )}
          {f.type === "checkbox" && (
            <input
              type="checkbox"
              onChange={e => update(f.id, e.target.checked)}
            />
          )}
        </div>
      ))}

      <button className="btn w-full" onClick={back}>
        Back
      </button>
    </div>
  )
}
