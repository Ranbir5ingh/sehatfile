'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFamily } from '@/context/FamilyContext';
import {
  IconFolder,
  IconReports,
  IconPill,
  IconClipboard,
  IconUsers,
  IconArrowUpRight,
  IconChevronDown,
  IconCheck,
  IconClose,
  IconSparkles,
} from '@/components/Icons';

export default function Navbar() {
  const pathname = usePathname();
  const { people, selectedPersonId, selectedPerson, setSelectedPersonId, createPerson } = useFamily();

  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navLinks = [
    { index: '01', label: 'Overview', href: '/', icon: IconFolder },
    { index: '02', label: 'Reports', href: '/reports', icon: IconReports },
    { index: '03', label: 'Medicines', href: '/medicines', icon: IconPill },
    { index: '04', label: "Doctor's Brief", href: '/brief', icon: IconClipboard },
    { index: '05', label: 'Members', href: '/members', icon: IconUsers },
  ];

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      await createPerson(newName, newRelation);
      setNewName('');
      setNewRelation('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#faf9f5]/90 backdrop-blur-md border-b border-stone-200/90 no-print transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo with modern icon */}
          <Link href="/" className="flex items-center space-x-3 group interactive-btn">
            <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <IconSparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-base font-extrabold tracking-tight text-stone-950 font-display">
                  SehatFile
                </span>
              </div>
            </div>
          </Link>

          {/* Multipage Nav Links (Desktop) with modern SVG icons */}
          <nav className="hidden md:flex items-center space-x-1 bg-stone-200/50 p-1 rounded-full border border-stone-200">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const IconComp = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all interactive-btn flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-stone-400'}`} />
                  <span className={`text-[10px] font-mono ${isActive ? 'text-stone-400' : 'text-stone-400'}`}>
                    {link.index}
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Member Switcher & Status */}
          <div className="flex items-center space-x-2.5">
            {/* Active Member Switcher Dropdown */}
            {people.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                  className="interactive-btn flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-300 text-xs font-semibold text-stone-900 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span className="max-w-[120px] sm:max-w-[150px] truncate">
                    {selectedPerson?.name || 'Select Member'}
                  </span>
                  <IconChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${showMemberDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showMemberDropdown && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-stone-300 rounded-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-stone-400 border-b border-stone-100 flex items-center justify-between">
                      <span>Family Folders</span>
                      <span>[{people.length}]</span>
                    </div>
                    <div className="max-h-56 overflow-y-auto py-1">
                      {people.map((p) => {
                        const isSelected = p.id === selectedPersonId;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedPersonId(p.id);
                              setShowMemberDropdown(false);
                            }}
                            className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-stone-100 text-stone-950 font-bold'
                                : 'text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            <div className="truncate">
                              <div>{p.name}</div>
                              {p.relation && (
                                <div className="text-[10px] text-stone-400 font-serif-accent">{p.relation}</div>
                              )}
                            </div>
                            {isSelected && <IconCheck className="w-3.5 h-3.5 text-stone-900" />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="border-t border-stone-100 pt-1 mt-1 px-2">
                      <button
                        onClick={() => {
                          setShowMemberDropdown(false);
                          setShowAddModal(true);
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-stone-900 hover:bg-stone-100 rounded-lg font-semibold flex items-center justify-between interactive-btn"
                      >
                        <span>+ Add New Member</span>
                        <IconArrowUpRight className="w-3 h-3 text-stone-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Add Button if no members yet */}
            {people.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="interactive-btn px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-semibold cursor-pointer"
              >
                + Add Member
              </button>
            )}

          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden border-t border-stone-200 bg-[#faf9f5] px-4 py-2 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const IconComp = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all interactive-btn flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900 bg-stone-200/60'
                }`}
              >
                <IconComp className={`w-3 h-3 ${isActive ? 'text-emerald-400' : 'text-stone-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs no-print">
          <div className="bg-white border-2 border-stone-900 rounded-3xl w-full max-w-md p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-baseline space-x-2">
                <h3 className="text-base font-bold text-stone-950 font-display">New Family Member</h3>
                <span className="font-serif-accent text-xs text-stone-500">profile setup</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-900 text-sm cursor-pointer p-1 interactive-btn"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-stone-600 mb-5 leading-relaxed">
              Create an on-device health record for the parent, grandparent, or child whose lab reports you organize.
            </p>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar or Papa"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-950 focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Relationship / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Father, Mother, Self, Grandmother"
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-950 focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
                />
              </div>
              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="interactive-btn px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newName.trim()}
                  className="interactive-btn px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <span>{isSubmitting ? 'Creating...' : 'Create Folder'}</span>
                  <IconArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
