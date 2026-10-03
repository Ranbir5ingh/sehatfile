'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFamily } from '@/context/FamilyContext';
import {
  IconFolder,
  IconPill,
  IconClipboard,
  IconReports,
  IconCamera,
  IconUsers,
  IconArrowUpRight,
  IconSparkles,
} from '@/components/Icons';

interface KeyValue {
  name: string;
  value: string;
  flag?: string;
}

interface ReportItem {
  id: number;
  report_date: string | null;
  lab: string | null;
  test_name: string | null;
  summary: string;
  key_values: KeyValue[];
}

interface MedicineItem {
  id: number;
  name: string;
  dosage: string | null;
  frequency: string | null;
  active: number;
}

interface BriefItem {
  id: number;
  content: string;
  created_at: string;
}

export default function DashboardPage() {
  const { people, selectedPersonId, selectedPerson } = useFamily();

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [brief, setBrief] = useState<BriefItem | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (selectedPersonId) {
      loadOverviewData(selectedPersonId);
    }
  }, [selectedPersonId]);

  async function loadOverviewData(personId: number) {
    setIsLoadingData(true);
    try {
      const [repRes, medRes, brfRes] = await Promise.all([
        fetch(`/api/people/${personId}/reports`),
        fetch(`/api/people/${personId}/medicines`),
        fetch(`/api/people/${personId}/brief`),
      ]);
      const [repData, medData, brfData] = await Promise.all([
        repRes.json(),
        medRes.json(),
        brfRes.json(),
      ]);
      if (repRes.ok) setReports(repData.reports || []);
      if (medRes.ok) setMedicines(medData.medicines || []);
      if (brfRes.ok) setBrief(brfData.brief || null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingData(false);
    }
  }

  const activeMedicines = medicines.filter((m) => m.active === 1);

  return (
    <div className="space-y-8">
      {/* Hero Section: Editorial, ZERO SHADOWS, Non-clickable container has NO hover borders */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-stone-200/90 p-7 sm:p-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 flex items-center space-x-1.5">
                <IconSparkles className="w-3 h-3 text-stone-500" />
                <span>[01] FAMILY HEALTH INTELLIGENCE</span>
              </span>
              <span className="font-mono text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>LOCAL GEMMA ENGINE</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-950 leading-[1.1] font-display">
              YOUR FAMILY&apos;S HEALTH,{' '}
              <span className="font-serif-accent text-4xl sm:text-6xl font-normal text-emerald-800 tracking-normal block sm:inline">
                organized
              </span>{' '}
              BY AI.
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
              Turn chaotic plastic files of paper lab reports into an instant chronological timeline, living medicine list, and a 1-page printable doctor&apos;s brief for the 90-second consultation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <Link
              href="/reports"
              className="interactive-btn px-6 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center justify-center space-x-2 cursor-pointer text-center"
            >
              <IconCamera className="w-4 h-4" />
              <span>Photograph Report</span>
              <IconArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
            </Link>
            <Link
              href="/brief"
              className="interactive-btn px-6 py-3 rounded-full bg-white hover:bg-stone-100 text-stone-900 font-semibold text-xs border border-stone-300 flex items-center justify-center space-x-2 cursor-pointer text-center"
            >
              <IconClipboard className="w-4 h-4 text-stone-600" />
              <span>Doctor&apos;s Brief</span>
              <IconArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
            </Link>
          </div>
        </div>

        {/* Editorial Footnote Strip */}
        <div className="mt-8 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between text-[11px] text-stone-400 gap-3 font-mono">
          <span>PRIVATE • WORKS OFFLINE • ZERO CLOUD TELEMETRY</span>
          <span className="font-serif-accent text-xs text-stone-500 font-normal">Designed for 90-second Indian clinical consultations</span>
        </div>
      </section>

      {/* Selected Member Health Status Strip */}
      {selectedPerson && (
        <section className="p-5 bg-white rounded-2xl border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-900 font-extrabold text-sm font-display">
              {selectedPerson.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-sm font-bold text-stone-900 font-display">{selectedPerson.name}</span>
                {selectedPerson.relation && (
                  <span className="font-serif-accent text-xs text-stone-500">
                    ({selectedPerson.relation})
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Active Health Folder • Grounded from physical diagnostic tests
              </div>
            </div>
          </div>

          {/* Conditions Tags with microinteraction */}
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedPerson.conditions && selectedPerson.conditions.length > 0 ? (
              selectedPerson.conditions.map((cond, i) => (
                <span
                  key={i}
                  className="interactive-chip px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1.5 cursor-default"
                >
                  <IconSparkles className="w-3 h-3 text-emerald-600" />
                  <span>{cond}</span>
                </span>
              ))
            ) : (
              <span className="text-[11px] text-stone-400 italic font-serif-accent">No chronic conditions recorded</span>
            )}
          </div>
        </section>
      )}

      {/* Quick Metrics Grid - Clickable Cards have MINIMAL SHINE on hover, ZERO stroke border change */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Link
          href="/reports"
          className="clickable-card p-5 rounded-2xl bg-white border border-stone-200/90 group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-stone-400 tracking-wider uppercase flex items-center space-x-1">
              <IconReports className="w-3 h-3" />
              <span>[01] Reports</span>
            </span>
            <IconArrowUpRight className="w-3 h-3 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <div className="text-2xl font-extrabold text-stone-950 font-display">{reports.length}</div>
          <div className="font-serif-accent text-xs text-stone-500 mt-0.5">tests documented</div>
        </Link>

        <Link
          href="/medicines"
          className="clickable-card p-5 rounded-2xl bg-white border border-stone-200/90 group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-stone-400 tracking-wider uppercase flex items-center space-x-1">
              <IconPill className="w-3 h-3" />
              <span>[02] Active Rx</span>
            </span>
            <IconArrowUpRight className="w-3 h-3 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-800 font-display">{activeMedicines.length}</div>
          <div className="font-serif-accent text-xs text-stone-500 mt-0.5">daily prescriptions</div>
        </Link>

        <Link
          href="/brief"
          className="clickable-card p-5 rounded-2xl bg-white border border-stone-200/90 group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-stone-400 tracking-wider uppercase flex items-center space-x-1">
              <IconClipboard className="w-3 h-3" />
              <span>[03] Brief</span>
            </span>
            <IconArrowUpRight className="w-3 h-3 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <div className="text-sm font-bold text-stone-900 mt-1 font-display">
            {brief ? 'Ready to Print' : 'Needs Generation'}
          </div>
          <div className="font-serif-accent text-xs text-stone-500 mt-0.5">1-page consultation</div>
        </Link>

        <Link
          href="/members"
          className="clickable-card p-5 rounded-2xl bg-white border border-stone-200/90 group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-stone-400 tracking-wider uppercase flex items-center space-x-1">
              <IconUsers className="w-3 h-3" />
              <span>[04] Profiles</span>
            </span>
            <IconArrowUpRight className="w-3 h-3 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <div className="text-2xl font-extrabold text-stone-950 font-display">{people.length}</div>
          <div className="font-serif-accent text-xs text-stone-500 mt-0.5">household members</div>
        </Link>
      </section>

      {/* Two-Column Dashboard Content Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Reports Feed (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2 font-display">
              <IconReports className="w-4 h-4 text-stone-500" />
              <span>Recent Diagnostic Tests</span>
              <span className="font-serif-accent text-xs text-stone-500 font-normal">({reports.length} logged)</span>
            </h3>
            <Link
              href="/reports"
              className="text-xs font-semibold text-stone-900 hover:underline transition-colors interactive-btn flex items-center space-x-1"
            >
              <span>View Timeline</span>
              <IconArrowUpRight className="w-3 h-3 text-stone-500" />
            </Link>
          </div>

          {isLoadingData ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-400 font-mono">
              Fetching laboratory feed...
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-stone-300">
              <IconReports className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-stone-800 font-display">No reports logged yet</p>
              <p className="text-xs text-stone-500 mt-0.5 mb-3 font-serif-accent">
                Photograph a lab report to start tracking your family&apos;s health parameters.
              </p>
              <Link
                href="/reports"
                className="interactive-btn px-4 py-2 bg-stone-900 text-white rounded-full text-xs font-semibold inline-flex items-center space-x-1.5"
              >
                <span>Upload First Report</span>
                <IconArrowUpRight className="w-3 h-3 text-stone-400" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 3).map((rep) => (
                <div
                  key={rep.id}
                  className="p-5 bg-white border border-stone-200/90 rounded-2xl"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 font-display">{rep.test_name || 'Lab Report'}</h4>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {rep.lab && <span>{rep.lab} • </span>}
                        <span className="font-mono text-emerald-800 font-medium">{rep.report_date || 'Undated'}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-2 mb-3">
                    {rep.summary}
                  </p>

                  {rep.key_values && rep.key_values.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {rep.key_values.slice(0, 3).map((kv, i) => (
                        <span
                          key={i}
                          className="interactive-chip px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-700"
                        >
                          <strong className="text-stone-900 font-semibold">{kv.name}:</strong> {kv.value}
                        </span>
                      ))}
                      {rep.key_values.length > 3 && (
                        <span className="px-2 py-1 text-[11px] text-stone-400 font-mono">
                          +{rep.key_values.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Medicines & Brief Snapshot (Span 1) */}
        <div className="space-y-6">
          {/* Active Medicines Card */}
          <div className="p-5 bg-white border border-stone-200/90 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline space-x-2">
                <div className="flex items-center space-x-1.5">
                  <IconPill className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-bold text-stone-900 font-display">Active Prescriptions</h3>
                </div>
                <span className="font-serif-accent text-xs text-stone-500">[{activeMedicines.length}]</span>
              </div>
              <Link
                href="/medicines"
                className="interactive-btn text-xs font-semibold text-stone-900 hover:underline transition-colors flex items-center space-x-0.5"
              >
                <span>Manage</span>
                <IconArrowUpRight className="w-3 h-3 text-stone-500" />
              </Link>
            </div>

            {activeMedicines.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-500 bg-stone-50 rounded-xl font-serif-accent">
                No active medicines recorded.
              </div>
            ) : (
              <div className="space-y-2">
                {activeMedicines.slice(0, 4).map((med) => (
                  <div
                    key={med.id}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900 font-display">{med.name}</div>
                      <div className="text-[11px] text-stone-500 font-serif-accent">{med.frequency || 'Daily'}</div>
                    </div>
                    {med.dosage && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold font-mono">
                        {med.dosage}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Doctor Brief Card */}
          <div className="p-5 bg-white border border-stone-200/90 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <IconClipboard className="w-4 h-4 text-stone-600" />
                <h3 className="text-sm font-bold text-stone-900 font-display">Doctor Consultation Handout</h3>
              </div>
              <Link
                href="/brief"
                className="interactive-btn text-xs font-semibold text-stone-900 hover:underline transition-colors flex items-center space-x-0.5"
              >
                <span>View</span>
                <IconArrowUpRight className="w-3 h-3 text-stone-500" />
              </Link>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed mb-4 font-serif-accent">
              Condensed single-page printable brief with medications, diagnostic trends, and questions for the physician.
            </p>

            <Link
              href="/brief"
              className="interactive-btn w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer text-center"
            >
              <span>{brief ? 'View & Print Brief' : 'Generate Brief'}</span>
              <IconArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
