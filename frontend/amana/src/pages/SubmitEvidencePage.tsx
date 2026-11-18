import { useState } from 'react'
import { useSubmitEvidence } from '../hooks/actions'
import { errorMessage } from '../hooks/errors'
import { useAgreement } from '../hooks/agreements'
import { EVIDENCE_LIMITS, formatBytes, validateEvidenceFile } from '../screens/contract/amounts'
import { SubmitEvidence } from '../screens/contract/SubmitEvidence'
import { Banner, ErrorState, LoadingState } from '../ui'
import type { PickedFile } from '../ui'

// S8. The freelancer submits a GitHub pull request link and notes.
// The backend only takes image LINKS, not file uploads, so picked files are not sent.
export function SubmitEvidencePage({ id, milestoneId }: { id: string; milestoneId: string }) {
  const a = useAgreement(id)
  const submit = useSubmitEvidence(id, milestoneId)
  const [prUrl, setPrUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [files, setFiles] = useState<PickedFile[]>([])
  const [fileError, setFileError] = useState<string>()

  if (a.isPending) return <LoadingState label="Loading milestone…" />
  if (a.error || !a.view || !a.raw) {
    return <ErrorState message={errorMessage(a.error)} onRetry={() => void a.refetch()} />
  }
  const milestone = a.view.milestones.find((m) => m.id === milestoneId)
  if (!milestone) return <ErrorState title="Milestone not found" message="This milestone is not part of this agreement." />
  if (a.raw.viewerRole !== 'payee') {
    return <ErrorState title="Only the freelancer can do this" message="Submitting evidence is the freelancer's step." />
  }

  const pick = (list: FileList) => {
    const next = [...files]
    let error: string | undefined
    for (const file of Array.from(list)) {
      const problem = validateEvidenceFile(file)
      if (problem) error = problem
      else if (next.length >= EVIDENCE_LIMITS.maxFiles) error = `You can add up to ${EVIDENCE_LIMITS.maxFiles} files.`
      else if (!next.some((f) => f.name === file.name)) next.push({ name: file.name, sizeLabel: formatBytes(file.size) })
    }
    setFiles(next)
    setFileError(error)
  }

  const send = () => {
    if (files.length > 0) {
      setFileError('Screenshot upload is not available yet. Remove the files and paste image links in the notes instead.')
      return
    }
    submit.mutate({
      type: prUrl.trim() ? 'GITHUB' : 'UPLOAD',
      prUrl: prUrl.trim() || undefined,
      note: notes.trim() || undefined,
      screenshots: [],
    })
  }

  return (
    <div className="grid gap-4">
      {submit.error && (
        <Banner tone="danger" title="We could not submit the evidence">
          {errorMessage(submit.error)}
        </Banner>
      )}
      <SubmitEvidence
        milestoneTitle={milestone.title}
        amount={milestone.amount}
        clientName={a.view.payer.name}
        prUrl={prUrl}
        onPrUrlChange={setPrUrl}
        notes={notes}
        onNotesChange={setNotes}
        files={files}
        onPickFiles={pick}
        onRemoveFile={(name) => {
          setFiles((f) => f.filter((x) => x.name !== name))
          setFileError(undefined)
        }}
        fileError={fileError}
        onSubmit={send}
        submitting={submit.isPending}
        submitted={submit.isSuccess}
      />
    </div>
  )
}
