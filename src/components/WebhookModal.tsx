import React, { useState } from 'react';
import { FileSpreadsheet, X, Copy, Check, ExternalLink, HelpCircle } from 'lucide-react';
import { APPS_SCRIPT_TEMPLATE } from '../sheetsApi';

interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWebhookUrl: string;
  onSaveWebhookUrl: (url: string) => void;
  onTestSync: () => void;
  isSyncing: boolean;
}

export const WebhookModal: React.FC<WebhookModalProps> = ({
  isOpen,
  onClose,
  currentWebhookUrl,
  onSaveWebhookUrl,
  onTestSync,
  isSyncing
}) => {
  const [url, setUrl] = useState(currentWebhookUrl);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'url' | 'instructions' | 'code'>('url');

  React.useEffect(() => {
    setUrl(currentWebhookUrl);
  }, [currentWebhookUrl]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSaveWebhookUrl(url.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Google Sheets Web App Integration
              </h3>
              <p className="text-xs text-slate-500">
                Connect your Google Apps Script Deployment Endpoint
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('url')}
            className={`py-2 px-3 border-b-2 cursor-pointer transition ${
              activeTab === 'url'
                ? 'border-[#0f2042] text-[#0f2042]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Webhook Endpoint
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`py-2 px-3 border-b-2 cursor-pointer transition ${
              activeTab === 'instructions'
                ? 'border-[#0f2042] text-[#0f2042]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Step-by-Step Setup
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-2 px-3 border-b-2 cursor-pointer transition ${
              activeTab === 'code'
                ? 'border-[#0f2042] text-[#0f2042]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Apps Script Code
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Apps Script Web App URL (exec endpoint)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f2042] font-mono text-xs"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    Must be deployed with <strong>Execute as: Me</strong> and <strong>Who has access: Anyone</strong>.
                  </span>
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950">
                <span className="font-bold text-emerald-900 block mb-1">Dual-Storage Enabled:</span>
                Your class monitor appointments and checklist toggles always save locally to your browser and automatically post JSON payloads to this endpoint on every change.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onTestSync}
                  disabled={!url || isSyncing}
                  className="px-3.5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {isSyncing ? 'Testing...' : 'Test Connection Now'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-[#0f2042] text-white flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                <div>
                  <p className="font-bold text-slate-900">Create or open your target Google Sheet</p>
                  <p className="text-slate-500 text-[11px]">Go to Google Sheets and open the spreadsheet where you want St. Mary's monitor data recorded.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-[#0f2042] text-white flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                <div>
                  <p className="font-bold text-slate-900">Open Apps Script editor</p>
                  <p className="text-slate-500 text-[11px]">Click on <strong>Extensions &gt; Apps Script</strong> in the top menu of your Google Sheet.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-[#0f2042] text-white flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                <div>
                  <p className="font-bold text-slate-900">Paste Script Code & Deploy</p>
                  <p className="text-slate-500 text-[11px]">Copy the script from the "Apps Script Code" tab, paste it into Code.gs, and click <strong>Deploy &gt; New deployment</strong>.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-[#0f2042] text-white flex items-center justify-center font-bold text-[11px] shrink-0">4</span>
                <div>
                  <p className="font-bold text-slate-900">Set Access Permissions</p>
                  <p className="text-slate-500 text-[11px]">Select type <strong>Web app</strong>, set <em>Who has access</em> to <strong>Anyone</strong>, authorize permissions, and copy the Web App URL.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Code.gs Implementation:</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Entire Script'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed">
                {APPS_SCRIPT_TEMPLATE}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3.5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold bg-[#0f2042] hover:bg-[#1b356b] text-white rounded-lg transition shadow-xs cursor-pointer"
          >
            Save Endpoint URL
          </button>
        </div>
      </div>
    </div>
  );
};
