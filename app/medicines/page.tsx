'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { IconPill, IconClose, IconPlus } from '@/components/Icons';

interface Medicine {
  id: number;
  person_id: number;
  name: string;
  dosage: string | null;
  frequency: string | null;
  active: number;
  created_at: string;
}

export default function MedicinesPage() {
  const { selectedPersonId, selectedPerson } = useFamily();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingMed, setIsAddingMed] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPersonId) {
      loadMedicines(selectedPersonId);
    } else {
      setMedicines([]);
    }
  }, [selectedPersonId]);

  function notify(msg: string) {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  }

  function showError(err: any) {
    const msg = typeof err === 'string' ? err : err?.message || 'Action failed';
    setErrorMessage(msg);
  }

  async function loadMedicines(personId: number) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/people/${personId}/medicines`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMedicines(data.medicines || []);
    } catch (err) {
      showError(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddMedicine(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !selectedPersonId) return;

    setIsAddingMed(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/people/${selectedPersonId}/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setName('');
      setDosage('');
      setFrequency('');
      await loadMedicines(selectedPersonId);
      notify(`Added ${data.medicine.name} to medicine cabinet`);
    } catch (err) {
      showError(err);
    } finally {
      setIsAddingMed(false);
    }
  }

  async function handleToggleStatus(id: number, currentActive: number) {
    setTogglingId(id);
    setErrorMessage(null);
    try {
      const nextActive = currentActive === 1 ? false : true;
      const res = await fetch(`/api/medicines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMedicines((prev) =>
        prev.map((m) => (m.id === id ? { ...m, active: nextActive ? 1 : 0 } : m))
      );
      notify(`Marked medicine as ${nextActive ? 'Active' : 'Discontinued'}`);
    } catch (err) {
      showError(err);
    } finally {
      setTogglingId(null);
    }
  }

  const activeMedicines = medicines.filter((m) => m.active === 1);
  const discontinuedMedicines = medicines.filter((m) => m.active === 0);

  return (
    <div className="space-y-8">
      {/* Toast Notification - ZERO SHADOWS */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-3 rounded-full border border-stone-800 flex items-center space-x-2.5 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Banner - ZERO SHADOWS */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-start justify-between">
          <div>
            <div className="font-bold text-rose-800 font-display">Notice</div>
            <p className="mt-0.5 text-stone-700">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-stone-400 hover:text-stone-700 interactive-btn p-1">
            <IconClose className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-200/80">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              [03] PHARMACEUTICAL ARCHIVE
            </span>
            {selectedPerson && (
              <span className="font-serif-accent text-xs text-stone-500">
                • {selectedPerson.name} ({selectedPerson.relation || 'Member'})
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight font-display">
            Living Medicine <span className="font-serif-accent font-normal text-emerald-800">Cabinet</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-lg">
            Real-time prescription list. Automatically folds in medicines from scanned doctor prescriptions and lab notes.
          </p>
        </div>
      </div>

      {/* Add Medication Card - ZERO SHADOWS */}
      <div className="p-7 sm:p-8 bg-white border border-stone-200/90 rounded-3xl">
        <div className="flex items-baseline space-x-2 mb-1">
          <h3 className="text-sm font-bold text-stone-900 font-display">
            Add Prescription Manually
          </h3>
          <span className="font-serif-accent text-xs text-stone-400">new entry</span>
        </div>
        <p className="text-xs text-stone-500 mb-5 leading-relaxed max-w-lg">
          Add over-the-counter or doctor-prescribed medications to keep the family&apos;s living record accurate.
        </p>

        <form onSubmit={handleAddMedicine} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">MEDICINE NAME *</label>
            <input
              type="text"
              required
              placeholder="e.g. Metformin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-950 focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">DOSAGE</label>
            <input
              type="text"
              placeholder="e.g. 500 mg"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-950 focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">FREQUENCY</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Twice daily with meals"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-950 focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
              />
              <button
                type="submit"
                disabled={isAddingMed || !name.trim() || !selectedPersonId}
                className="interactive-btn px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer self-end flex items-center space-x-1"
              >
                <IconPlus className="w-3.5 h-3.5 text-stone-300" />
                <span>{isAddingMed ? 'Saving...' : 'Add'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Medicines Lists */}
      <div className="space-y-6">
        {/* Active Medicines Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-baseline space-x-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500">
                ACTIVE PRESCRIPTIONS
              </h3>
              <span className="font-serif-accent text-xs text-stone-400">[{activeMedicines.length}]</span>
            </div>
            <span className="text-xs text-stone-400 font-mono">CURRENT REGIMEN</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-stone-400 text-xs font-mono">
              Loading medication regimen...
            </div>
          ) : activeMedicines.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-dashed border-stone-300 text-center text-xs text-stone-500">
              <IconPill className="w-8 h-8 mx-auto text-stone-300 mb-2 stroke-[1.25]" />
              <p className="font-serif-accent">No active medications logged. Upload a prescription report or add one above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {activeMedicines.map((med) => (
                <div
                  key={med.id}
                  className="p-5 bg-white border border-stone-200/90 rounded-2xl flex items-start justify-between gap-4"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0 mt-0.5">
                      <IconPill className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-stone-900 flex items-center space-x-2 font-display">
                        <span>{med.name}</span>
                        {med.dosage && (
                          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {med.dosage}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 mt-1 font-serif-accent">
                        {med.frequency || 'Dosage as directed by physician'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(med.id, med.active)}
                    disabled={togglingId === med.id}
                    className="interactive-btn px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 cursor-pointer shrink-0"
                    title="Mark medicine as discontinued"
                  >
                    {togglingId === med.id ? 'Updating...' : 'Discontinue'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discontinued / Past Medicines */}
        {discontinuedMedicines.length > 0 && (
          <div className="pt-6 border-t border-stone-200">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400">
                DISCONTINUED / STOPPED ({discontinuedMedicines.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-80">
              {discontinuedMedicines.map((med) => (
                <div
                  key={med.id}
                  className="p-4 bg-stone-50/70 border border-stone-200 rounded-xl flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-semibold text-stone-500 line-through">
                      {med.name} {med.dosage && `(${med.dosage})`}
                    </div>
                    <div className="text-[11px] text-stone-400 font-serif-accent">
                      {med.frequency || 'Discontinued'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(med.id, med.active)}
                    disabled={togglingId === med.id}
                    className="interactive-btn px-3 py-1 rounded-full text-[11px] font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 cursor-pointer"
                  >
                    {togglingId === med.id ? 'Updating...' : 'Reactivate'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
