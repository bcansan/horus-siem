import React, { useEffect, useState } from 'react'
import RulesList from '../components/Rules/RulesList'
import RuleEditor from '../components/Rules/RuleEditor'
import { listRules } from '../services/api'

export default function RulesPage() {
  const [rules, setRules] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [text, setText] = useState('')

  useEffect(() => {
    listRules().then(setRules).catch(() => setRules([]))
  }, [])

  useEffect(() => {
    if (selected) setText(JSON.stringify(selected, null, 2))
  }, [selected])

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <RulesList rules={rules} onSelect={setSelected} />
      <div className="md:col-span-2">
        {selected ? <RuleEditor value={text} onChange={setText} /> : <div className="rounded border border-slate-700 bg-slate-900 p-4 text-slate-400">Selecciona una regla</div>}
      </div>
    </div>
  )
}


