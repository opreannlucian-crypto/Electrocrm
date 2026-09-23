import { useMemo, useState } from 'react';

export default function ClientAutocomplete({ clients = [], clientId, value, onChange, error }) {
    const [focused, setFocused] = useState(false);
    const term = value.trim().toLocaleLowerCase('ro-RO');
    const suggestions = useMemo(() => term ? clients.filter((client) => `${client.name} ${client.cui || ''}`.toLocaleLowerCase('ro-RO').includes(term)).slice(0, 8) : [], [clients, term]);
    const exactMatch = suggestions.some((client) => client.name.trim().toLocaleLowerCase('ro-RO') === term);

    return <div className="relative"><input type="text" required value={value} onFocus={() => setFocused(true)} onChange={(event) => onChange({ client_id: '', client_name: event.target.value })} placeholder="Scrie numele clientului..." className="w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500" />{focused && suggestions.length > 0 && <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl">{suggestions.map((client) => <button key={client.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange({ client_id: client.id, client_name: client.name }); setFocused(false); }} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-blue-50"><span className="font-semibold text-slate-800">{client.name}</span><span className="shrink-0 text-xs text-slate-500">{client.cui || 'Client salvat'}</span></button>)}</div>}{focused && term && !exactMatch && <p className="mt-1 text-xs text-blue-700">Client nou — va fi adăugat automat la salvarea documentului.</p>}{clientId && <p className="mt-1 text-xs text-emerald-700">Client selectat din nomenclator.</p>}{error && <p className="mt-1 text-sm text-red-600">{error}</p>}</div>;
}
