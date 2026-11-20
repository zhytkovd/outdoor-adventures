'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Btn, Card, DateInput, SelectInput, TextInput } from '@/components/rentals/ui';
const contributionTypes = ['Grant', 'Gear', 'Campaign', 'Other'] as const;
type ContributionType = typeof contributionTypes[number];

interface Contribution {
  id: string;
  name: string;
  type: ContributionType;
  valueCents: number;
  itemCount: number;
  giftDate: string;
}

const storageKey = 'outdoor-adventures:donor-contributions:v1';

function readContributions(): Contribution[] {
  const stored = window.localStorage.getItem(storageKey);
  return stored ? JSON.parse(stored) as Contribution[] : [];
}

const emptyForm = {
  name: '',
  type: 'Grant' as ContributionType,
  value: '',
  items: '',
  giftDate: '',
};
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const giftDateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

export function DonorReport() {
  const [contributions, setContributions] = useState<Contribution[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      setContributions(readContributions());
    } catch {
      setLoadError('Could not load donor contributions from this browser.');
    }
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = form.value.trim();
    const items = form.items.trim();
    const name = form.name.trim();
    if (!name || name.length > 150 || !form.giftDate) {
      setFormError('Enter a donor name of up to 150 characters and a gift date.');
      return;
    }
    if (value && !/^\d+(\.\d{1,2})?$/.test(value)) {
      setFormError('Enter the value in dollars with up to two decimal places.');
      return;
    }
    if (items && !/^\d+$/.test(items)) {
      setFormError('Enter a whole number of gear items.');
      return;
    }
    const valueCents = Math.round(Number(value) * 100);
    const itemCount = Number(items);
    if (valueCents > 1_000_000_000 || itemCount > 1_000_000) {
      setFormError('Use a value of up to $10,000,000 and up to 1,000,000 gear items.');
      return;
    }
    if (valueCents === 0 && itemCount === 0) {
      setFormError('Enter a contribution value or a gear item count.');
      return;
    }

    setFormError('');
    try {
      const entry = { id: crypto.randomUUID(), name, type: form.type, giftDate: form.giftDate, valueCents, itemCount };
      const updated = [entry, ...readContributions()].sort((a, b) => b.giftDate.localeCompare(a.giftDate));
      window.localStorage.setItem(storageKey, JSON.stringify(updated));
      setContributions(updated);
      setForm(emptyForm);
      setShowForm(false);
      setStatus('Contribution saved.');
    } catch {
      setFormError('Could not save the contribution in this browser.');
    }
  }

  if (loadError) {
    return (
      <Card className="p-5">
        <p role="alert">{loadError}</p>
      </Card>
    );
  }
  if (!contributions) return <p role="status">Loading donor contributions…</p>;

  const totalValue = contributions.reduce((sum, entry) => sum + entry.valueCents, 0);
  const totalItems = contributions.reduce((sum, entry) => sum + entry.itemCount, 0);
  const donorCount = new Set(contributions.map(entry => entry.name.toLowerCase())).size;

  return (
    <div className="space-y-5">
      <p className="text-sm text-text-s">Contributions are saved in this browser.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Total Support', currency.format(totalValue / 100)],
          ['Gear Donated', totalItems.toLocaleString('en-US')],
          ['Donors', donorCount.toLocaleString('en-US')],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <div className="text-2xl font-bold text-text-p">{value}</div>
            <div className="mt-1 text-sm text-text-s">{label}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-col px-5 py-4">
          <h3 className="font-semibold text-text-p">Donor Contributions</h3>
          {!showForm && <Btn onClick={() => { setStatus(''); setShowForm(true); }}>Add Contribution</Btn>}
        </div>
        {showForm && (
          <form onSubmit={submit} className="space-y-4 border-b border-border-col p-5">
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium">Donor name
                <TextInput value={form.name} onChange={name => setForm({ ...form, name })} />
              </label>
              <label className="grid gap-1 text-sm font-medium">Contribution type
                <SelectInput value={form.type} onChange={type => setForm({ ...form, type: type as ContributionType })} options={contributionTypes.map(value => ({ label: value, value }))} />
              </label>
              <label className="grid gap-1 text-sm font-medium">Estimated value (USD)
                <TextInput value={form.value} onChange={value => setForm({ ...form, value })} placeholder="0.00" />
              </label>
              <label className="grid gap-1 text-sm font-medium">Gear item count
                <TextInput value={form.items} onChange={items => setForm({ ...form, items })} placeholder="0" />
              </label>
              <label className="grid gap-1 text-sm font-medium">Gift date
                <DateInput value={form.giftDate} onChange={giftDate => setForm({ ...form, giftDate })} min="" />
              </label>
            </fieldset>
            {formError && <p role="alert" className="text-sm text-text-p">{formError}</p>}
            <div className="flex flex-wrap gap-2">
              <Btn type="submit">Save Contribution</Btn>
              <Btn variant="secondary" onClick={() => { setShowForm(false); setForm(emptyForm); setFormError(''); }}>Cancel</Btn>
            </div>
          </form>
        )}
        {status && <p role="status" className="px-5 py-3 text-sm text-pine">{status}</p>}
        {contributions.length === 0 ? (
          <p className="p-5 text-sm text-text-s">No contributions have been recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-table-hd text-left text-xs text-text-s">
                  {['Donor', 'Type', 'Estimated value', 'Gear items', 'Gift date'].map(label => (
                    <th key={label} scope="col" className="px-5 py-3 font-medium">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-col">
                {contributions.map(entry => (
                  <tr key={entry.id}>
                    <th scope="row" className="px-5 py-3 text-left font-medium">{entry.name}</th>
                    <td className="px-5 py-3">{entry.type}</td>
                    <td className="px-5 py-3">{currency.format(entry.valueCents / 100)}</td>
                    <td className="px-5 py-3">{entry.itemCount}</td>
                    <td className="whitespace-nowrap px-5 py-3">{giftDateFormat.format(new Date(entry.giftDate + 'T00:00:00Z'))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
