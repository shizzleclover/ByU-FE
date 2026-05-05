'use client'

import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { apiPost } from '@/lib/api'

interface ImportResult {
  created: number
  skipped: number
  errors: Array<{ row: number; email: string; reason: string }>
}

const TEMPLATE_HEADERS = ['fullName', 'email', 'username', 'department', 'year']
const REQUIRED_COLUMNS = 'fullName, email'

function downloadTemplate() {
  const csv = [
    TEMPLATE_HEADERS.join(','),
    'Jane Doe,jane.doe@gmail.com,janedoe,Computer Science,300',
    'John Smith,john.smith@gmail.com,johnsmith,Business Administration,200',
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'byu-import-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function BulkImportPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

  const importMutation = useMutation({
    mutationFn: async (f: File) => {
      const form = new FormData()
      form.append('file', f)
      return apiPost<ImportResult>('/admin/users/import', form)
    },
    onSuccess: (data) => {
      setResult(data)
      toast.success(`Import complete — ${data.created} accounts created.`)
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Import failed.'
      toast.error(msg)
    },
  })

  const handleFile = (f: File) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ]
    if (!allowed.includes(f.type) && !f.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error('Please upload an .xlsx, .xls, or .csv file.')
      return
    }
    setFile(f)
    setResult(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  return (
    <>
      <DashboardTopbar title="Bulk Import Users" />
      <div className="flex-1 px-6 md:px-8 py-10 overflow-auto">
        <div className="max-w-[640px] space-y-8">

          {/* Instructions */}
          <div className="border border-line p-6 space-y-4">
            <p className="text-overline text-ink-muted">HOW IT WORKS</p>
            <ol className="space-y-2 text-caption text-ink-soft list-decimal list-inside">
              <li>Download the template and fill in student data</li>
              <li>Required columns: <span className="text-ink font-medium">{REQUIRED_COLUMNS}</span></li>
              <li>Optional: username, department, year (level)</li>
              <li>Duplicate emails are skipped — no overwriting existing accounts</li>
              <li>Each new student receives a welcome email with a temporary password</li>
              <li>Students must change their password on first login</li>
            </ol>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-overline border border-line px-4 py-2.5 hover:border-ink transition-colors"
            >
              <Download size={13} />
              DOWNLOAD TEMPLATE (.csv)
            </button>
          </div>

          {/* Drop zone */}
          <div>
            <p className="text-overline text-ink-muted mb-3">UPLOAD FILE</p>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-line hover:border-ink transition-colors cursor-pointer p-10 flex flex-col items-center gap-3"
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
              {file ? (
                <>
                  <FileSpreadsheet size={28} className="text-ink-muted" />
                  <p className="text-meta font-bold text-ink">{file.name}</p>
                  <p className="text-caption text-ink-muted">{(file.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <Upload size={28} className="text-ink-faint" />
                  <p className="text-meta text-ink-soft">Drop your .xlsx or .csv here, or click to browse</p>
                </>
              )}
            </div>
          </div>

          {/* Submit */}
          {file && !result && (
            <button
              onClick={() => importMutation.mutate(file)}
              disabled={importMutation.isPending}
              className="w-full bg-ink text-bg text-overline py-3.5 hover:bg-ink-soft transition-colors disabled:opacity-50"
            >
              {importMutation.isPending ? 'IMPORTING...' : `IMPORT ${file.name} →`}
            </button>
          )}

          {/* Results */}
          {result && (
            <div className="border border-line p-6 space-y-6">
              <p className="text-overline text-ink-muted">IMPORT RESULTS</p>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-state-success">
                    <CheckCircle size={14} />
                    <span className="text-overline">CREATED</span>
                  </div>
                  <p className="text-h4 font-bold text-ink">{result.created}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-ink-muted">
                    <AlertCircle size={14} />
                    <span className="text-overline">SKIPPED</span>
                  </div>
                  <p className="text-h4 font-bold text-ink">{result.skipped}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-state-error">
                    <XCircle size={14} />
                    <span className="text-overline">ERRORS</span>
                  </div>
                  <p className="text-h4 font-bold text-ink">{result.errors.length}</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <p className="text-overline text-ink-muted mb-3">ERROR DETAILS</p>
                  <div className="border border-state-error/30 divide-y divide-state-error/20 max-h-64 overflow-auto">
                    {result.errors.map((e, i) => (
                      <div key={i} className="px-4 py-3">
                        <p className="text-meta font-bold text-state-error">Row {e.row} — {e.email}</p>
                        <p className="text-caption text-ink-muted mt-0.5">{e.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => { setFile(null); setResult(null); if (inputRef.current) inputRef.current.value = '' }}
                className="text-overline border border-line px-4 py-2.5 hover:border-ink transition-colors"
              >
                ← IMPORT ANOTHER FILE
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
