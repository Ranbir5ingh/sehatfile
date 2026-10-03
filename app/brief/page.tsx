'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/context/FamilyContext';
import {
  IconClipboard,
  IconSparkles,
  IconPrinter,
  IconCopy,
  IconCheck,
  IconClose,
  IconArrowUpRight,
} from '@/components/Icons';

interface Brief {
  id: number;
  person_id: number;
  content: string;
  created_at: string;
}

export default function DoctorBriefPage() {
  const { selectedPersonId, selectedPerson } = useFamily();

  const [brief, setBrief] = useState<Brief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPersonId) {
      loadBrief(selectedPersonId);
    } else {
      setBrief(null);
    }
  }, [selectedPersonId]);

  function notify(msg: string) {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  }

  function showError(err: any) {
    const msg = typeof err === 'string' ? err : err?.message || 'Failed to process request';
    setErrorMessage(msg);
  }

  async function loadBrief(personId: number) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/people/${personId}/brief`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBrief(data.brief || null);
    } catch (err) {
      showError(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateBrief() {
    if (!selectedPersonId) return;

    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/people/${selectedPersonId}/brief`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBrief(data.brief);
      notify("Doctor's brief successfully generated!");
    } catch (err) {
      showError(err);
    } finally {
      setIsGenerating(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleCopy() {
    if (!brief?.content) return;
    navigator.clipboard.writeText(brief.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    notify('Copied brief to clipboard');
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-200/80 no-print">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              [04] CLINICAL CONSULTATION BRIEF
            </span>
            {selectedPerson && (
              <span className="font-serif-accent text-xs text-stone-500">
                • {selectedPerson.name} ({selectedPerson.relation || 'Member'})
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight font-display">
            The <span className="font-serif-accent font-normal text-emerald-800">90-Second</span> Doctor&apos;s Brief
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-lg">
            Structured, conservative summary of active medications, chronological lab trends, and specific questions for the physician.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateBrief}
            disabled={isGenerating || !selectedPersonId}
            className="interactive-btn px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-full text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <IconSparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{brief ? 'Regenerate Brief' : 'Generate Brief'}</span>
                <IconArrowUpRight className="w-3 h-3 text-stone-400" />
              </>
            )}
          </button>

          {brief && (
            <>
              <button
                onClick={handlePrint}
                className="interactive-btn px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-900 rounded-full text-xs font-semibold border border-stone-300 flex items-center space-x-1.5 cursor-pointer"
              >
                <IconPrinter className="w-3.5 h-3.5 text-stone-700" />
                <span>Print Handout</span>
              </button>

              <button
                onClick={handleCopy}
                className="interactive-btn px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-700 rounded-full text-xs font-semibold border border-stone-300 flex items-center space-x-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <IconCopy className="w-3.5 h-3.5 text-stone-600" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Brief Display Container */}
      {isLoading ? (
        <div className="py-20 text-center text-stone-400 text-xs bg-white rounded-3xl border border-stone-200 font-mono">
          <span className="inline-block w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin mr-2"></span>
          Retrieving consultation summary...
        </div>
      ) : isGenerating ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-stone-200 text-xs text-stone-500">
          <span className="inline-block w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin mb-3"></span>
          <p className="font-bold text-stone-950 text-sm font-display">
            AI is compiling structured clinical brief...
          </p>
          <p className="text-stone-400 mt-1 max-w-md mx-auto font-serif-accent">
            Aggregating active medications, cross-referencing multi-year lab trends, and grounding specific questions for the consultation.
          </p>
        </div>
      ) : !brief ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-stone-300 no-print">
          <IconClipboard className="w-10 h-10 mx-auto text-stone-300 mb-3 stroke-[1.25]" />
          <h3 className="text-base font-bold text-stone-900 font-display">
            No doctor&apos;s brief generated yet for {selectedPerson?.name || 'this family member'}
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto mb-5 leading-relaxed font-serif-accent">
            Generate a standardized 1-page summary to print and hand to the doctor at the start of your consultation so they never need to re-order the same tests.
          </p>
          <button
            onClick={handleGenerateBrief}
            disabled={!selectedPersonId}
            className="interactive-btn px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-semibold cursor-pointer inline-flex items-center space-x-1.5"
          >
            <span>Generate Brief Now</span>
            <IconArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* On-Screen Document Sheet - Editorial Layout, ZERO SHADOWS */}
          <div className="p-8 sm:p-10 bg-white border border-stone-200/90 rounded-3xl no-print font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-stone-200 gap-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold">
                  [DOCUMENT: PATIENT CONSULTATION BRIEF]
                </div>
                <h2 className="text-xl font-bold text-stone-950 mt-0.5 font-display">
                  {selectedPerson?.name} {selectedPerson?.relation && <span className="font-serif-accent text-base text-stone-500">({selectedPerson.relation})</span>}
                </h2>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs font-mono text-stone-500 block">
                  SehatFile Verified Brief
                </span>
                <span className="text-[11px] text-stone-400 font-mono">
                  {new Date(brief.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Document Content */}
            <div className="space-y-4 text-xs leading-relaxed text-stone-800 whitespace-pre-line font-mono bg-stone-50/70 p-6 rounded-2xl border border-stone-200">
              {brief.content}
            </div>

            <div className="mt-6 pt-5 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 gap-3">
              <span className="font-serif-accent">Prepared for 90-second consultation • Grounded in physical diagnostic reports</span>
              <button
                onClick={handlePrint}
                className="interactive-btn text-stone-900 hover:text-emerald-800 font-semibold flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
              >
                <IconPrinter className="w-3.5 h-3.5 text-stone-700" />
                <span>Print 1-Page Handout</span>
                <IconArrowUpRight className="w-3 h-3 text-stone-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY CONTAINER: Clean 1-Page Doctor's Handout */}
      {selectedPerson && brief && (
        <div id="printable-doctor-brief" className="hidden print:block font-sans text-gray-900">
          <div className="border-b-2 border-gray-900 pb-2 mb-3 flex justify-between items-end">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
                PATIENT CONSULTATION BRIEF
              </h1>
              <p className="text-xs text-gray-600">
                Prepared by Family Health Manager via SehatFile
              </p>
            </div>
            <div className="text-right text-xs font-mono">
              <div className="font-semibold text-gray-900">
                Patient: {selectedPerson.name} {selectedPerson.relation && `(${selectedPerson.relation})`}
              </div>
              <div className="text-gray-600">
                Date: {new Date(brief.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="text-[10pt] leading-relaxed whitespace-pre-line text-gray-800 font-sans">
            {brief.content}
          </div>

          <div className="mt-6 pt-3 border-t border-gray-400 flex justify-between items-center text-[8pt] text-gray-500">
            <span>SehatFile Health Summary • Grounded in physical lab reports</span>
            <span>Doctor Sign-off / Notes: ___________________________</span>
          </div>
        </div>
      )}
    </div>
  );
}
