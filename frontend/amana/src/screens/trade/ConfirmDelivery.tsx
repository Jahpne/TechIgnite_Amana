import { useState } from 'react'
import {
  Banner,
  Button,
  Card,
  ConfirmDialog,
  DisputeBanner,
  ErrorState,
  EvidenceList,
  FileUpload,
  LoadingState,
  PageTitle,
  TextArea,
  formatNaira,
} from '../../ui'
import type { AgreementStatus, AgreementView, PickedFile } from '../../ui'
import { makeTrade } from '../../mocks/data'
import { PreviewPanel, SelectControl } from './controls'
import { MAX_PHOTO_BYTES, formatSize } from './shared'

export interface ReportPayload {
  reason: string
  photos: File[]
}

export interface ConfirmDeliveryProps {
  agreement: AgreementView
  /** Shown when auto-release is configured (P1), for example "16 Nov, 15:45". */
  autoReleaseAt?: string
  actionLoading?: boolean
  loading?: boolean
  error?: string
  onRetry?: () => void
  onConfirm: () => void
  onReport: (payload: ReportPayload) => void
}

export function ConfirmDelivery({
  agreement: a,
  autoReleaseAt,
  actionLoading,
  loading,
  error,
  onRetry,
  onConfirm,
  onReport,
}: ConfirmDeliveryProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string>()
  const [photos, setPhotos] = useState<File[]>([])
  const [photoError, setPhotoError] = useState<string>()

  if (loading) return <LoadingState label="Loading delivery…" />
  if (error) return <ErrorState title="We could not load this delivery" message={error} onRetry={onRetry} />

  const delivery = a.evidence.filter((e) => e.kind === 'chowdeck')
  const picked: PickedFile[] = photos.map((f) => ({ name: f.name, sizeLabel: formatSize(f.size) }))

  const pickPhotos = (list: FileList) => {
    const next: File[] = [...photos]
    let problem: string | undefined
    for (const f of Array.from(list)) {
      if (!f.type.startsWith('image/')) problem = `${f.name} is not an image. Upload a photo.`
      else if (f.size > MAX_PHOTO_BYTES) problem = `${f.name} is larger than 5 MB.`
      else next.push(f)
    }
    setPhotos(next)
    setPhotoError(problem)
  }

  const submitReport = () => {
    if (reason.trim().length < 10) {
      setReasonError('Tell us what went wrong in at least a sentence.')
      return
    }
    onReport({ reason: reason.trim(), photos })
  }

  const header = <PageTitle title="Confirm delivery" subtitle={`${a.title} from ${a.payee.name}`} />

  if (a.status === 'DISPUTED') {
    return (
      <div className="grid gap-4">
        {header}
        <DisputeBanner />
        <Card title="Delivery evidence">
          <EvidenceList items={a.evidence} />
        </Card>
      </div>
    )
  }

  if (a.status === 'COMPLETED') {
    return (
      <div className="grid gap-4">
        {header}
        <Banner tone="success" title="Receipt confirmed">
          You confirmed delivery and the seller has been paid {formatNaira(a.total)}.
        </Banner>
      </div>
    )
  }

  if (a.status !== 'DELIVERED') {
    return (
      <div className="grid gap-4">
        {header}
        <Banner tone="info" title="Nothing to confirm yet">
          You can confirm once Chowdeck reports the item as delivered.
        </Banner>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {header}

      <Card title="Delivery evidence">
        <EvidenceList items={delivery} />
        {autoReleaseAt && (
          <p className="text-sm text-muted">
            If you do not respond, payment is released automatically on {autoReleaseAt}, unless you report a problem.
          </p>
        )}
      </Card>

      {!reporting && (
        <Card title="Did you receive your item?">
          <Button variant="primary" block loading={actionLoading} onClick={() => setConfirmOpen(true)}>
            Confirm receipt
          </Button>
          <Button variant="danger" block onClick={() => setReporting(true)}>
            Report a problem
          </Button>
        </Card>
      )}

      {reporting && (
        <Card title="Report a problem">
          <form
            className="grid gap-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              submitReport()
            }}
          >
            <TextArea
              label="What went wrong?"
              value={reason}
              onChange={(v) => {
                setReason(v)
                setReasonError(undefined)
              }}
              error={reasonError}
              hint="The seller and an Amana admin will see this. Payment stays locked until it is reviewed."
            />
            <FileUpload
              label="Photo (optional)"
              limits="Images only, up to 5 MB each."
              files={picked}
              onPick={pickPhotos}
              onRemove={(name) => setPhotos((list) => list.filter((f) => f.name !== name))}
              error={photoError}
            />
            <Button variant="danger" block type="submit" loading={actionLoading}>
              Submit report and lock payment
            </Button>
            <Button block onClick={() => setReporting(false)}>
              Back
            </Button>
          </form>
        </Card>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Release payment to the seller?"
        confirmLabel={`Release ${formatNaira(a.total)}`}
        loading={actionLoading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          onConfirm()
        }}
      >
        <p>
          You are confirming that you received <strong>{a.title}</strong>. Amana will pay{' '}
          <strong>{formatNaira(a.total)}</strong> to {a.payee.name}.
        </p>
        <p>This cannot be undone. If something is wrong, choose Cancel and report a problem instead.</p>
      </ConfirmDialog>
    </div>
  )
}

type View = 'normal' | 'loading' | 'error'

const statusOptions: { value: AgreementStatus; label: string }[] = [
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'IN_DELIVERY', label: 'In delivery (not yet)' },
  { value: 'DISPUTED', label: 'Disputed' },
  { value: 'COMPLETED', label: 'Completed' },
]

export function ConfirmDeliveryPreview() {
  const [status, setStatus] = useState<AgreementStatus>('DELIVERED')
  const [view, setView] = useState<View>('normal')

  return (
    <div className="grid gap-4">
      <PreviewPanel>
        <SelectControl label="State" value={status} options={statusOptions} onChange={setStatus} />
        <SelectControl
          label="View"
          value={view}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'loading', label: 'Loading' },
            { value: 'error', label: 'Error' },
          ]}
          onChange={setView}
        />
      </PreviewPanel>
      <ConfirmDelivery
        key={status}
        agreement={makeTrade(status)}
        autoReleaseAt="16 Nov, 15:45"
        loading={view === 'loading'}
        error={view === 'error' ? 'The server did not respond. Check your connection and try again.' : undefined}
        onRetry={() => setView('normal')}
        onConfirm={() => setStatus('COMPLETED')}
        onReport={() => setStatus('DISPUTED')}
      />
    </div>
  )
}
