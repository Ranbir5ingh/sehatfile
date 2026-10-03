'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { downscaleImage, generateSampleLabReportCanvas } from '@/lib/client-utils';
import {
  IconCamera,
  IconBolt,
  IconCalendar,
  IconReports,
  IconClose,
  IconArrowUpRight,
  IconSearch,
} from '@/components/Icons';

interface KeyValue {
  name: string;
  value: string;
  flag?: string;
}

interface ReportItem {
  id: number;
  person_id: number;
  report_date: string | null;
  lab: string | null;
  test_name: string | null;
  summary: string;
  key_values: KeyValue[];
  created_at: string;
}

export default function ReportsPage() {
  const { selectedPersonId, selectedPerson, fetchPeople } = useFamily();

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedPersonId) {
      loadReports(selectedPersonId);
    } else {
      setReports([]);
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

  async function loadReports(personId: number) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/people/${personId}/reports`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReports(data.reports || []);
    } catch (err) {
      showError(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0 || !selectedPersonId) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const downscaledImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const dataUrl = await downscaleImage(file);
          downscaledImages.push(dataUrl);
        }
      }

      if (downscaledImages.length === 0) {
        throw new Error('Please select valid image files');
      }

      const res = await fetch(`/api/people/${selectedPersonId}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: downscaledImages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await loadReports(selectedPersonId);
      await fetchPeople();
      notify(`Successfully extracted ${downscaledImages.length} report(s) into timeline!`);
    } catch (err) {
      showError(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleSampleTestUpload() {
    if (!selectedPersonId || !selectedPerson) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const sampleDataUrl = generateSampleLabReportCanvas(selectedPerson.name, selectedPerson.relation);

      const res = await fetch(`/api/people/${selectedPersonId}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: [sampleDataUrl] }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await loadReports(selectedPersonId);
      await fetchPeople();
      notify('Sample lab report analyzed and added to timeline!');
    } catch (err) {
      showError(err);
    } finally {
      setIsUploading(false);
    }
  }

  const filteredReports = reports.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.test_name && r.test_name.toLowerCase().includes(term)) ||
      (r.lab && r.lab.toLowerCase().includes(term)) ||
      (r.summary && r.summary.toLowerCase().includes(term)) ||
      r.key_values.some((kv) => kv.name.toLowerCase().includes(term))
    );
  });

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
              [02] CHRONOLOGICAL REPOSITORY
            </span>
            {selectedPerson && (
              <span className="font-serif-accent text-xs text-stone-500">
                • {selectedPerson.name} ({selectedPerson.relation || 'Member'})
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight font-display">
            Diagnostic Reports &{' '}
            <span className="font-serif-accent font-normal text-emerald-800">Timeline</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-lg">
            Photograph lab reports once. AI extracts tests, reference flags, and doctor notes chronologically.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !selectedPersonId}
            className="interactive-btn px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-full text-xs font-semibold flex items-center space-x-2 cursor-pointer"
          >
            {isUploading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Reading...</span>
              </>
            ) : (
              <>
                <IconCamera className="w-3.5 h-3.5 text-stone-300" />
                <span>Upload Report</span>
                <IconArrowUpRight className="w-3 h-3 text-stone-400" />
              </>
            )}
          </button>

          <button
            onClick={handleSampleTestUpload}
            disabled={isUploading || !selectedPersonId}
            className="interactive-btn px-4 py-2.5 bg-white hover:bg-stone-100 disabled:opacity-50 text-stone-800 rounded-full text-xs font-semibold border border-stone-300 flex items-center space-x-1.5 cursor-pointer"
            title="Upload a simulated Indian lab report to test without a photo"
          >
            <IconBolt className="w-3.5 h-3.5 text-amber-600" />
            <span>1-Click Sample Test</span>
          </button>
        </div>
      </div>

      {/* Upload Zone Card - ZERO SHADOWS */}
      <div className="p-7 sm:p-8 bg-white border border-stone-200/90 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                <IconCamera className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 font-display">
                Add Diagnostic Report Photos
              </h3>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed max-w-md">
              Photograph pathology reports, blood panels, or doctor prescriptions. Images are downscaled client-side and parsed locally.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !selectedPersonId}
              className="interactive-btn px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-full text-xs font-semibold flex items-center space-x-2 cursor-pointer"
            >
              <IconCamera className="w-4 h-4 text-stone-300" />
              <span>Snap Photo or Upload File</span>
              <IconArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </div>
        </div>

        {isUploading && (
          <div className="mt-5 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-3 animate-pulse">
            <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
            <span className="font-medium">
              AI Document Reader is analyzing parameters, reference flags, and prescription notes...
            </span>
          </div>
        )}
      </div>

      {/* Reports Timeline Feed */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="text-xs font-mono uppercase tracking-wider text-stone-400">
            [RECORDS: {filteredReports.length} {filteredReports.length === 1 ? 'FILE' : 'FILES'}]
          </div>

          {reports.length > 0 && (
            <div className="relative w-full sm:w-64">
              <IconSearch className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search reports by test, lab, or reading..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-1.5 bg-white border border-stone-200 rounded-full text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 w-full transition-colors"
              />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-stone-400 text-xs font-mono">
            <span className="inline-block w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin mr-2"></span>
            Retrieving lab records...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-300">
            <IconReports className="w-10 h-10 mx-auto text-stone-300 mb-3 stroke-[1.25]" />
            <p className="text-sm font-bold text-stone-900 font-display">
              {reports.length === 0 ? 'No reports logged yet' : 'No matching reports found'}
            </p>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto mb-4 font-serif-accent">
              {reports.length === 0
                ? 'Photograph a lab report from the plastic folder or click "1-Click Sample Test" above.'
                : 'Try clearing your search query to see all reports.'}
            </p>
            {reports.length === 0 && (
              <button
                onClick={handleSampleTestUpload}
                disabled={isUploading || !selectedPersonId}
                className="interactive-btn px-5 py-2.5 bg-stone-900 text-white rounded-full text-xs font-semibold flex items-center space-x-1.5 mx-auto cursor-pointer"
              >
                <IconBolt className="w-3.5 h-3.5 text-amber-300" />
                <span>Try 1-Click Sample Report</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-6 bg-white border border-stone-200/90 rounded-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h3 className="text-sm font-bold text-stone-900 font-display">
                    {report.test_name || 'Diagnostic Laboratory Investigation'}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-stone-500">
                    <span className="inline-flex items-center space-x-1.5 font-mono text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <IconCalendar className="w-3 h-3 text-emerald-700" />
                      <span>{report.report_date || 'Undated'}</span>
                    </span>
                    {report.lab && (
                      <span className="text-stone-500 font-medium">
                        • {report.lab}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-stone-50/90 border-l-2 border-emerald-600 rounded-r-xl text-xs text-stone-700 leading-relaxed mb-4">
                  {report.summary}
                </div>

                {report.key_values && report.key_values.length > 0 && (
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-2">
                      OBSERVED PARAMETERS:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {report.key_values.map((kv, idx) => {
                        const flagUpper = kv.flag ? kv.flag.toUpperCase() : '';
                        const isHigh = flagUpper.includes('HIGH');
                        const isLow = flagUpper.includes('LOW');
                        const isBorderline = flagUpper.includes('BORDERLINE');

                        const flagBadgeColor = isHigh
                          ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                          : isLow
                          ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                          : isBorderline
                          ? 'bg-orange-50 text-orange-700 border-orange-200 font-bold'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';

                        return (
                          <div
                            key={idx}
                            className="interactive-chip px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs flex items-center space-x-2 cursor-default"
                          >
                            <span className="text-stone-500 font-medium">
                              {kv.name}:
                            </span>
                            <span className="font-mono font-bold text-stone-900">
                              {kv.value}
                            </span>
                            {kv.flag && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${flagBadgeColor}`}
                              >
                                {kv.flag}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
