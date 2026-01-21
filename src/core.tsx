import { useState } from "react"

/* ---------- TYPES ---------- */

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

/* ---------- STORAGE ---------- */

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

/* ---------- LIFECYCLE ---------- */

const flow: Status[] = ["Created", "Approved", "Sent", "Signed", "Locked"]

const nextStatus = (s: Status) =>
  s === "Locked" || s === "Revoked" ? s : flow[flow.indexOf(s) + 1]

/* ================= DASHBOARD ================= */

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
    <div className="card">
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
              <td
  className={`p-2 ${
    c.status === "Locked"
      ? "status-locked"
      : "status-approved"
  }`}
>
  {c.status}
</td>

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

/* ================= BLUEPRINT BUILDER ================= */

export function BlueprintBuilder({ back }: any) {
  const [name, setName] = useState("")
  const [fields, setFields] = useState<Field[]>([])

  const addField = (type: FieldType) => {
    setFields(prev => [
      ...prev,
      { id: crypto.randomUUID(), type, label: type }
    ])
  }

  const save = () => {
    if (!name.trim()) {
      alert("Enter blueprint name")
      return
    }

    const blueprint: Blueprint = {
      id: crypto.randomUUID(),
      name,
      fields
    }

    saveBlueprints([...getBlueprints(), blueprint])
    alert("Blueprint created")
    back()
  }

  return (
    <div className="max-w-md mx-auto card space-y-4">
      <input
        className="input"
        placeholder="Blueprint name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <div className="flex gap-2 flex-wrap">
        <button className="btn" onClick={() => addField("text")}>
          Text
        </button>
        <button className="btn" onClick={() => addField("date")}>
          Date
        </button>
        <button className="btn" onClick={() => addField("signature")}>
          Signature
        </button>
        <button className="btn" onClick={() => addField("checkbox")}>
          Checkbox
        </button>
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

/* ================= CREATE CONTRACT ================= */

export function CreateContract({ back }: any) {
  const [name, setName] = useState("")
  const [blueprintId, setBlueprintId] = useState("")

  const blueprints = getBlueprints()

  const create = () => {
    if (!name || !blueprintId) {
      alert("Fill all fields")
      return
    }

    const blueprint = blueprints.find(b => b.id === blueprintId)
    if (!blueprint) return

    const contract: Contract = {
      id: crypto.randomUUID(),
      name,
      blueprintId,
      fields: blueprint.fields.map(f => ({ ...f, value: "" })),
      status: "Created"
    }

    saveContracts([...getContracts(), contract])
    alert("Contract created")
    back()
  }

  return (
    <div className="max-w-md mx-auto card space-y-4">
      <h2 className="text-lg font-semibold">Create Contract</h2>

      <input
        className="input"
        placeholder="Contract name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <select
        className="input"
        value={blueprintId}
        onChange={e => setBlueprintId(e.target.value)}
      >
        <option value="">Select Blueprint</option>
        {blueprints.map(b => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <button className="btn-primary w-full" onClick={create}>
        Create
      </button>

      <button className="btn w-full" onClick={back}>
        Cancel
      </button>
    </div>
  )
}

/* ================= CONTRACT EDITOR ================= */

export function ContractEditor({ id, back }: any) {
  const [contracts, setContracts] = useState(getContracts())
  const contract = contracts.find(c => c.id === id)

  if (!contract) return null

  const isLocked = contract.status === "Locked"

  const update = (fid: string, value: any) => {
    if (isLocked) return

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

  const save = () => {
    saveContracts(contracts)
    alert("Contract saved successfully")
  }

  return (
    <div className="max-w-md mx-auto card space-y-4">
      <h2 className="text-lg font-semibold">{contract.name}</h2>

      {contract.fields.map(f => (
        <div key={f.id}>
          <label className="block text-sm mb-1">{f.label}</label>

          {f.type === "text" && (
            <input
              className="input"
              disabled={isLocked}
              defaultValue={f.value}
              onChange={e => update(f.id, e.target.value)}
            />
          )}

          {f.type === "date" && (
            <input
              type="date"
              className="input"
              disabled={isLocked}
              defaultValue={f.value}
              onChange={e => update(f.id, e.target.value)}
            />
          )}

          {f.type === "checkbox" && (
            <input
              type="checkbox"
              disabled={isLocked}
              defaultChecked={f.value}
              onChange={e => update(f.id, e.target.checked)}
            />
          )}

          {f.type === "signature" && (
            <input
              className="input"
              disabled={isLocked}
              placeholder="Type signer name"
              defaultValue={f.value}
              onChange={e => update(f.id, e.target.value)}
            />
          )}
        </div>
      ))}

      {!isLocked && (
        <button className="btn-primary w-full" onClick={save}>
          Save
        </button>
      )}

      {isLocked && (
        <div className="text-center text-sm text-red-500">
          Contract is locked and cannot be edited
        </div>
      )}

      <button className="btn w-full" onClick={back}>
        Back
      </button>
    </div>
  )
}
