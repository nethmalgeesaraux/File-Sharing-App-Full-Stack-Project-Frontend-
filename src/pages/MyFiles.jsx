import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { List, LayoutGrid, FileText, Lock, Download, Trash2, Globe, Eye, Link2 } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'

const MyFiles = () => {
  const { getToken } = useAuth()
  const [viewMode, setViewMode] = useState('list')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const filesEndpoint = import.meta.env.VITE_MY_FILES_ENDPOINT || '/api/files'
  const visibilityEndpointTemplate =
    import.meta.env.VITE_FILE_VISIBILITY_ENDPOINT_TEMPLATE || '/api/files/:id/visibility'
  const shareEndpointTemplate =
    import.meta.env.VITE_FILE_SHARE_ENDPOINT_TEMPLATE || '/api/files/:id/share'

  const getNormalizedFiles = (payload) => {
    const source = payload?.files || payload?.data?.files || payload?.data || payload?.results || payload
    const fileList = Array.isArray(source) ? source : []

    return fileList.map((item, index) => ({
      id: item.id || item._id || item.fileId || `file-${index}`,
      name: item.name || item.fileName || item.originalName || 'Untitled file',
      sizeInBytes: Number(item.sizeInBytes ?? item.size ?? item.fileSize ?? 0),
      uploadedAt: item.uploadedAt || item.createdAt || item.date || null,
      visibility: item.visibility || item.access || item.sharing || (item.isPublic ? 'Public' : 'Private'),
      downloadUrl: item.downloadUrl || item.url || item.fileUrl || item.path || '#',
      publicUrl: item.publicUrl || item.shareUrl || item.publicLink || null,
    }))
  }

  const formatFileSize = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let value = bytes
    let unitIndex = 0
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024
      unitIndex += 1
    }
    const fixed = value >= 10 || unitIndex === 0 ? 0 : 1
    return `${value.toFixed(fixed)} ${units[unitIndex]}`
  }

  const formatUploadedDate = (dateValue) => {
    if (!dateValue) return 'N/A'
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return String(dateValue)
    return date.toLocaleDateString('en-GB')
  }

  useEffect(() => {
    const controller = new AbortController()

    const fetchFiles = async () => {
      try {
        setLoading(true)
        setError('')

        const token = await getToken()
        const response = await fetch(`${apiBaseUrl}${filesEndpoint}`, {
          method: 'GET',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch files (${response.status})`)
        }

        const data = await response.json()
        setFiles(getNormalizedFiles(data))
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Could not load files from backend.')
          setFiles([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchFiles()

    return () => controller.abort()
  }, [apiBaseUrl, filesEndpoint, getToken])

  const fileCount = useMemo(() => files.length, [files])

  const getEndpointFromTemplate = (template, fileId) => `${apiBaseUrl}${template.replace(':id', fileId)}`

  const getPublicLink = (file) => {
    if (file.publicUrl) return file.publicUrl
    if (file.downloadUrl && file.downloadUrl !== '#') return file.downloadUrl
    return `${window.location.origin}/public-file/${file.id}`
  }

  const updateFileInState = (fileId, patch) => {
    setFiles((prevFiles) =>
      prevFiles.map((item) => (String(item.id) === String(fileId) ? { ...item, ...patch } : item))
    )
  }

  const handleToggleVisibility = async (file) => {
    const nextVisibility = String(file.visibility).toLowerCase() === 'public' ? 'Private' : 'Public'

    try {
      setActionLoadingId(file.id)
      const token = await getToken()
      const endpoint = getEndpointFromTemplate(visibilityEndpointTemplate, file.id)
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          visibility: nextVisibility.toLowerCase(),
          isPublic: nextVisibility === 'Public',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const updated = getNormalizedFiles(data)?.[0]
        if (updated) {
          updateFileInState(file.id, {
            visibility: updated.visibility,
            publicUrl: updated.publicUrl || file.publicUrl,
          })
          return
        }
      }

      updateFileInState(file.id, { visibility: nextVisibility })
    } catch {
      updateFileInState(file.id, { visibility: nextVisibility })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleShareLink = async (file) => {
    try {
      setActionLoadingId(file.id)
      const token = await getToken()
      const endpoint = getEndpointFromTemplate(shareEndpointTemplate, file.id)
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (response.ok) {
        const data = await response.json()
        const updated = getNormalizedFiles(data)?.[0]
        const link = updated?.publicUrl || getPublicLink(file)
        if (updated?.publicUrl) {
          updateFileInState(file.id, { publicUrl: updated.publicUrl, visibility: 'Public' })
        }
        await navigator.clipboard.writeText(link)
        return
      }

      await navigator.clipboard.writeText(getPublicLink(file))
    } catch {
      try {
        await navigator.clipboard.writeText(getPublicLink(file))
      } catch {
        // Clipboard may be blocked in non-secure contexts.
      }
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7.5rem)] rounded-sm border border-gray-200 bg-[#f8f8fb] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold leading-none tracking-tight text-gray-900 sm:text-[42px]">
              My Files
            </h1>
            <span className="inline-flex min-w-9 items-center justify-center rounded-full border border-violet-200 bg-gradient-to-r from-violet-50 to-blue-50 px-3 py-1 text-sm font-semibold text-violet-700 shadow-sm">
              {fileCount}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex h-8 w-8 items-center justify-center rounded transition ${viewMode === 'list'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              aria-label="List view"
            >
              <List className="h-5 w-5" strokeWidth={2.4} />
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex h-8 w-8 items-center justify-center rounded transition ${viewMode === 'grid'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white px-6 py-10 text-sm text-gray-500 shadow-sm">
            Loading files...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : fileCount === 0 ? (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white px-6 py-10 text-sm text-gray-600 shadow-sm">
            No files found.
          </div>
        ) : viewMode === 'list' ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Uploaded</th>
                  <th className="px-6 py-4">Sharing</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="text-sm text-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-gray-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{formatFileSize(file.sizeInBytes)}</td>
                    <td className="px-6 py-4">{formatUploadedDate(file.uploadedAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(file)}
                          disabled={actionLoadingId === file.id}
                          className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {String(file.visibility).toLowerCase() === 'public' ? (
                            <Globe className="h-4 w-4 text-green-600" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-500" />
                          )}
                          {file.visibility}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShareLink(file)}
                          disabled={actionLoadingId === file.id}
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Link2 className="h-4 w-4" />
                          Share Link
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-gray-500">
                        <a
                          href={file.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded p-1 hover:bg-gray-100 hover:text-green-600"
                          aria-label="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button type="button" className="rounded p-1 hover:bg-gray-100 hover:text-red-600" aria-label="Delete file">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <a
                          href={getPublicLink(file)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded p-1 hover:bg-gray-100 hover:text-blue-600"
                          aria-label="Open public view"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {files.map((file) => (
              <article
                key={file.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-b from-[#f4f4fa] via-[#e9e9f2] to-[#d7d7e3] p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-white/80 p-2 text-violet-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  {String(file.visibility).toLowerCase() === 'public' ? (
                    <Globe className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-600" />
                  )}
                </div>

                <div className="mt-14">
                  <p className="truncate text-lg font-semibold text-gray-900">{file.name}</p>
                  <p className="mt-1 text-sm text-gray-600">{formatFileSize(file.sizeInBytes)}</p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(file)}
                    disabled={actionLoadingId === file.id}
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-sm transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Toggle file visibility"
                  >
                    {String(file.visibility).toLowerCase() === 'public' ? (
                      <Globe className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-gray-500" />
                    )}
                    {file.visibility}
                  </button>
                  <a
                    href={file.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-green-600 shadow-sm transition hover:scale-105"
                    aria-label="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleShareLink(file)}
                    disabled={actionLoadingId === file.id}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-orange-500 shadow-sm transition hover:scale-105"
                    aria-label="Share file"
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                  <a
                    href={getPublicLink(file)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-blue-600 shadow-sm transition hover:scale-105"
                    aria-label="Open public view"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default MyFiles
