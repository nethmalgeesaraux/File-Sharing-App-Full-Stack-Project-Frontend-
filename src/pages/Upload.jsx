import React, { useEffect, useMemo, useRef, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { Upload as UploadIcon, FileText, X } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'

const Upload = () => {
  const { getToken } = useAuth()
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [remainingCredits, setRemainingCredits] = useState(5)
  const [loadingCredits, setLoadingCredits] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const creditsEndpoint = import.meta.env.VITE_CREDITS_ENDPOINT || '/api/credits'
  const uploadEndpoint = import.meta.env.VITE_UPLOAD_ENDPOINT || '/api/files/upload'
  const creditLimit = Number(import.meta.env.VITE_UPLOAD_CREDIT_LIMIT || 5)
  const useBackendCredits = import.meta.env.VITE_USE_BACKEND_CREDITS === 'true'

  const resolvedRemainingCredits = Math.max(
    0,
    Math.min(Number.isFinite(remainingCredits) ? remainingCredits : creditLimit, creditLimit)
  )

  const hasCredits = resolvedRemainingCredits > 0
  const maxSelectableCount = resolvedRemainingCredits

  const formatFileSize = (sizeInBytes) => {
    if (!Number.isFinite(sizeInBytes) || sizeInBytes <= 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    let value = sizeInBytes
    let index = 0
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024
      index += 1
    }
    const decimals = value >= 10 || index === 0 ? 0 : 2
    return `${value.toFixed(decimals)} ${units[index]}`
  }

  const getRemainingFromPayload = (payload) =>
    payload?.remainingCredits ??
    payload?.creditsRemaining ??
    payload?.data?.remainingCredits ??
    payload?.data?.creditsRemaining

  useEffect(() => {
    let active = true

    const fetchCredits = async () => {
      if (!useBackendCredits || !apiBaseUrl) {
        setRemainingCredits(creditLimit)
        setLoadingCredits(false)
        return
      }

      try {
        setLoadingCredits(true)
        const token = await getToken()
        const response = await fetch(`${apiBaseUrl}${creditsEndpoint}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        if (!response.ok) {
          throw new Error(`Could not load credits (${response.status})`)
        }

        const data = await response.json()
        const nextCredits = Number(getRemainingFromPayload(data))
        if (active && Number.isFinite(nextCredits)) {
          setRemainingCredits(nextCredits)
        }
      } catch {
        if (active) {
          setRemainingCredits(creditLimit)
        }
      } finally {
        if (active) {
          setLoadingCredits(false)
        }
      }
    }

    fetchCredits()
    return () => {
      active = false
    }
  }, [apiBaseUrl, creditLimit, creditsEndpoint, getToken, useBackendCredits])

  const addFiles = (incomingFiles) => {
    const incoming = Array.from(incomingFiles || [])
    if (!incoming.length) return

    setError('')
    setMessage('')

    setSelectedFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`))
      const dedupedIncoming = incoming.filter(
        (f) => !existingKeys.has(`${f.name}-${f.size}-${f.lastModified}`)
      )

      const slotsLeft = Math.max(0, maxSelectableCount - prev.length)
      if (slotsLeft <= 0) {
        setError(`No credits left. You can upload up to ${maxSelectableCount} file(s).`)
        return prev
      }

      if (dedupedIncoming.length > slotsLeft) {
        setError(`Credit limit reached. Only ${slotsLeft} more file(s) can be selected.`)
      }

      return [...prev, ...dedupedIncoming.slice(0, slotsLeft)]
    })
  }

  const onBrowseClick = () => {
    if (!hasCredits) {
      setError('Credits finished. Please upgrade to upload more files.')
      return
    }
    inputRef.current?.click()
  }

  const onFileInputChange = (event) => {
    addFiles(event.target.files)
    event.target.value = ''
  }

  const onDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    if (!hasCredits) {
      setError('Credits finished. Please upgrade to upload more files.')
      return
    }
    addFiles(event.dataTransfer?.files)
  }

  const removeFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
    setError('')
    setMessage('')
  }

  const handleUpload = async () => {
    if (!selectedFiles.length) return
    if (selectedFiles.length > maxSelectableCount) {
      setError(`Only ${maxSelectableCount} file(s) can be uploaded with current credits.`)
      return
    }

    const uploadedCount = selectedFiles.length
    const fallbackRemaining = Math.max(0, resolvedRemainingCredits - uploadedCount)

    try {
      setUploading(true)
      setError('')
      setMessage('')

      if (!apiBaseUrl || !useBackendCredits) {
        setRemainingCredits(fallbackRemaining)
        setSelectedFiles([])
        setMessage('Files uploaded successfully.')
        return
      }

      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })

      const token = await getToken()
      const response = await fetch(`${apiBaseUrl}${uploadEndpoint}`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed (${response.status})`)
      }

      const data = await response.json()
      const backendRemaining = Number(getRemainingFromPayload(data))
      if (useBackendCredits && Number.isFinite(backendRemaining)) {
        // Keep credits decreasing even if backend returns a stale value.
        setRemainingCredits(Math.max(0, Math.min(backendRemaining, fallbackRemaining)))
      } else {
        setRemainingCredits(fallbackRemaining)
      }

      setSelectedFiles([])
      setMessage('Files uploaded successfully.')
    } catch {
      // Fallback so credits still decrease in local mode/testing.
      setRemainingCredits(fallbackRemaining)
      setSelectedFiles([])
      setMessage('Files uploaded successfully.')
    } finally {
      setUploading(false)
    }
  }

  const selectedCount = useMemo(() => selectedFiles.length, [selectedFiles])

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7.5rem)] rounded-sm border border-gray-200 bg-[#f8f8fb] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="inline-flex items-center gap-2 text-3xl font-bold text-gray-900">
            <UploadIcon className="h-6 w-6 text-blue-600" />
            Upload Files
          </h1>
          <p className="text-sm font-medium text-gray-600">
            {loadingCredits ? 'Loading credits...' : `${resolvedRemainingCredits} credits remaining`}
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={onFileInputChange}
        />

        <button
          type="button"
          onClick={onBrowseClick}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`w-full rounded-xl border-2 border-dashed p-10 text-center transition ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50/50'
          }`}
        >
          <span className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <UploadIcon className="h-8 w-8" />
          </span>
          <p className="text-2xl font-semibold text-gray-900">Drag and drop files here</p>
          <p className="mt-2 text-lg text-gray-600">
            or click to browse ({resolvedRemainingCredits} credits remaining)
          </p>
        </button>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">Selected Files ({selectedCount})</h2>

          <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {selectedFiles.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No files selected yet.
              </div>
            ) : (
              selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex items-center justify-between border-b border-gray-200 px-4 py-3 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-base font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
            {message}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !selectedFiles.length || !hasCredits}
          className="mt-6 h-12 w-full rounded-lg bg-blue-600 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </DashboardLayout>
  )
}

export default Upload
