import React, { useState } from 'react';
import {
  FileText,
  Table,
  Download,
  Clock,
  CheckCircle,
  ShieldCheck,
  Zap,
  Cpu,
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const ExportPanel = ({
  lastDownloads,
  onDownloadPDF,
  onDownloadCSV,
  onAsyncExport,
  isDownloadingPDF,
  isDownloadingCSV,
  isAsyncExporting,
  isAdmin = false,
}) => {
  const [csvType, setCsvType] = useState('complete');

  return (
    <div className="bg-surface rounded-2xl border border-borderMuted shadow-card p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-borderMuted">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-textMain tracking-tight">
              Export Application Records
            </h3>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-800 border border-emerald-300">
                <Zap className="w-3 h-3 text-emerald-600" />
                <span>EDA Enabled (Admin)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-0.5">
            {isAdmin
              ? 'Export the complete task database and audit logs directly or schedule non-blocking asynchronous worker jobs.'
              : 'Export your task database and audit logs directly in PDF or CSV formats.'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200/60 text-brand-800 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-brand-700" />
          <span>MongoDB Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* PDF Card */}
        <div className="rounded-2xl border border-purple-100 bg-purple-50/20 p-5 flex flex-col justify-between space-y-4 hover:border-purple-200 transition-colors">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-textMain">Complete PDF Report</h4>
            <p className="text-xs text-muted leading-relaxed">
              Formatted document containing all active & completed todos, complete audit log history,
              and executive summary tables.
            </p>
          </div>

          <div className="pt-3 border-t border-purple-100/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Last PDF Download:</span>
              </span>
              <span className="font-semibold text-textMain">
                {lastDownloads?.lastPdf ? formatDate(lastDownloads.lastPdf) : 'Never'}
              </span>
            </div>

            <div className={`flex ${isAdmin ? 'flex-col sm:flex-row' : 'flex-col'} gap-2 pt-1`}>
              <button
                type="button"
                onClick={onDownloadPDF}
                disabled={isDownloadingPDF || isAsyncExporting}
                className="w-full py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs sm:text-sm font-medium shadow-sm transition-all focus-ring disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDownloadingPDF ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onAsyncExport?.('pdf')}
                  disabled={isDownloadingPDF || isAsyncExporting}
                  className="flex-1 py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all focus-ring disabled:opacity-50 flex items-center justify-center gap-1.5"
                  title="Admin Only: Offload PDF compiling to background async worker queue"
                >
                  <Cpu className="w-4 h-4 text-purple-700" />
                  <span>Async Worker (EDA)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CSV Card */}
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/20 p-5 flex flex-col justify-between space-y-4 hover:border-cyan-200 transition-colors">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Table className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-textMain">Structured CSV Record</h4>
            <p className="text-xs text-muted leading-relaxed">
              Standard comma-separated spreadsheet data. Choose full combined audit or individual
              collections.
            </p>
          </div>

          <div className="pt-3 border-t border-cyan-100/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Last CSV Download:</span>
              </span>
              <span className="font-semibold text-textMain">
                {lastDownloads?.lastCsv ? formatDate(lastDownloads.lastCsv) : 'Never'}
              </span>
            </div>

            {/* CSV scope selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface border border-borderMuted rounded-xl">
              <button
                type="button"
                onClick={() => setCsvType('complete')}
                className={`py-1 text-[11px] font-medium rounded-lg transition-colors ${
                  csvType === 'complete' ? 'bg-brand-700 text-white' : 'text-muted hover:text-textMain'
                }`}
              >
                Complete
              </button>
              <button
                type="button"
                onClick={() => setCsvType('todos')}
                className={`py-1 text-[11px] font-medium rounded-lg transition-colors ${
                  csvType === 'todos' ? 'bg-brand-700 text-white' : 'text-muted hover:text-textMain'
                }`}
              >
                Todos Only
              </button>
              <button
                type="button"
                onClick={() => setCsvType('logs')}
                className={`py-1 text-[11px] font-medium rounded-lg transition-colors ${
                  csvType === 'logs' ? 'bg-brand-700 text-white' : 'text-muted hover:text-textMain'
                }`}
              >
                Logs Only
              </button>
            </div>

            <div className={`flex ${isAdmin ? 'flex-col sm:flex-row' : 'flex-col'} gap-2 pt-1`}>
              <button
                type="button"
                onClick={() => onDownloadCSV(csvType)}
                disabled={isDownloadingCSV || isAsyncExporting}
                className="w-full py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs sm:text-sm font-medium shadow-sm transition-all focus-ring disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDownloadingCSV ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating CSV...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download CSV</span>
                  </>
                )}
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onAsyncExport?.('csv', csvType)}
                  disabled={isDownloadingCSV || isAsyncExporting}
                  className="flex-1 py-2.5 px-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all focus-ring disabled:opacity-50 flex items-center justify-center gap-1.5"
                  title="Admin Only: Offload CSV generation to background async worker queue"
                >
                  <Cpu className="w-4 h-4 text-cyan-700" />
                  <span>Async Worker (EDA)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
