'use client';

import React, { useState } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { IconUsers, IconClose, IconPlus, IconArrowUpRight } from '@/components/Icons';

export default function MembersPage() {
  const {
    people,
    selectedPersonId,
    setSelectedPersonId,
    createPerson,
    deletePerson,
    clearAllMembers,
  } = useFamily();

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  function notify(msg: string) {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const newPerson = await createPerson(name, relation);
      setName('');
      setRelation('');
      notify(`Added ${newPerson.name} to family folders`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteMember(id: number, memberName: string) {
    if (!confirm(`Are you sure you want to delete ${memberName}'s folder and all associated reports?`)) return;
    try {
      await deletePerson(id);
      notify(`Deleted ${memberName}'s folder`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete member');
    }
  }

  async function handleClearAll() {
    if (!confirm('Are you sure you want to clear ALL members and health records from the database? This cannot be undone.')) return;
    try {
      await clearAllMembers();
      notify('All members and records cleared from database');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to clear members');
    }
  }

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
      <div className="pb-4 border-b border-stone-200/80">
        <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mb-1">
          [05] HOUSEHOLD DIRECTORY
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight font-display">
          Family Member <span className="font-serif-accent font-normal text-emerald-800">Profiles</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1 max-w-lg">
          Each family member has an isolated health folder tracking their diagnostic reports, living medicines, and doctor briefs.
        </p>
      </div>

      {/* Two Column Layout: Add Member + Member Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Add Member Form (Span 1) - ZERO SHADOWS */}
        <div className="p-6 bg-white border border-stone-200/90 rounded-3xl h-fit">
          <div className="flex items-baseline space-x-2 mb-1">
            <div className="flex items-center space-x-1.5">
              <IconPlus className="w-3.5 h-3.5 text-emerald-800" />
              <h3 className="text-sm font-bold text-stone-900 font-display">
                Add Family Member
              </h3>
            </div>
            <span className="font-serif-accent text-xs text-stone-400">new folder</span>
          </div>
          <p className="text-xs text-stone-500 mb-4 leading-relaxed font-serif-accent">
            Create a folder for an aging parent, grandparent, spouse, or child.
          </p>

          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                FULL NAME *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar or Papa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-950 focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                RELATIONSHIP / ROLE
              </label>
              <input
                type="text"
                placeholder="e.g. Father, Mother, Self, Grandmother"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-950 focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="interactive-btn w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center space-x-1"
            >
              <span>{isSubmitting ? 'Creating Folder...' : 'Create Health Folder'}</span>
              <IconArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </form>
        </div>

        {/* Right Column: Family Member Cards (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400">
              [HOUSEHOLD: {people.length} {people.length === 1 ? 'MEMBER' : 'MEMBERS'}]
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-stone-500 font-serif-accent">Click card to switch active record</span>
              {people.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="interactive-btn text-[11px] font-mono font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {people.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-300">
              <IconUsers className="w-10 h-10 mx-auto text-stone-300 mb-3 stroke-[1.25]" />
              <p className="text-sm font-bold text-stone-900 font-display">No family members registered</p>
              <p className="text-xs text-stone-500 mt-1 font-serif-accent">Use the form on the left to add your first family member.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {people.map((person) => {
                const isSelected = person.id === selectedPersonId;
                const initial = person.name.charAt(0).toUpperCase();

                return (
                  <div
                    key={person.id}
                    onClick={() => {
                      setSelectedPersonId(person.id);
                      notify(`Switched active folder to ${person.name}`);
                    }}
                    className={`clickable-card p-6 rounded-2xl border flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-white border-2 border-stone-900'
                        : 'bg-white border border-stone-200/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm font-display ${
                              isSelected
                                ? 'bg-stone-900 text-white'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {initial}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-stone-900 font-display">{person.name}</h4>
                            <div className="text-xs text-stone-500 font-serif-accent">
                              {person.relation || 'Family Member'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {isSelected ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="text-[11px] text-stone-400 font-mono inline-flex items-center gap-0.5">
                              <span>SELECT</span>
                              <IconArrowUpRight className="w-3 h-3 text-stone-400" />
                            </span>
                          )}
                          <button
                            type="button"
                            title={`Delete ${person.name}'s folder`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMember(person.id, person.name);
                            }}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                          >
                            <IconClose className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Chronic conditions chips */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {person.conditions && person.conditions.length > 0 ? (
                          person.conditions.map((cond, i) => (
                            <span
                              key={i}
                              className="interactive-chip px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-medium border border-stone-200"
                            >
                              {cond}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-stone-400 italic font-serif-accent">No chronic conditions</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                      <span>{new Date(person.created_at).toLocaleDateString()}</span>
                      <span className="font-semibold text-stone-900 font-sans inline-flex items-center gap-1">
                        {isSelected ? 'Viewing Record' : (
                          <>
                            <span>Open Record</span>
                            <IconArrowUpRight className="w-3 h-3" />
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
