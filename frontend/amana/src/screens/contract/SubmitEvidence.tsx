import { useState } from 'react'
import { Banner, Button, Card, ConfirmDialog, FileUpload, KeyValues, PageTitle, TextArea, TextField, formatNaira } from '../../ui'
import type { PickedFile } from '../../ui'
import { milestoneHomepage } from '../../mocks/data'
import { EVIDENCE_LIMITS_TEXT, EVIDENCE_LIMITS, formatBytes, isGithubPrUrl, validateEvidenceFile } from './amounts'

export interface SubmitEvidenceProps {
  milestoneTitle: string
  amount: number
  clientName: string
  prUrl: string
  onPrUrlChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
  files: PickedFile[]
  onPickFiles: (files: FileList) => void
  onRemoveFile: (name: string) => void
  /** Error from the file checks (type, size, count). */
  fileError?: string
  onSubmit: () => void
  submitting?: boolean
  /** Evidence was accepted by the backend. */
  submitted?: boolean
}

// S8. Freelancer submits evidence for one milestone. Evidence is immutable once attached.
export function SubmitEvidence({
  milestoneTitle,
  amount,
  clientName,
  prUrl,
  onPrUrlChange,
  notes,
  onNotesChange,
  files,
  onPickFiles,
  onRemoveFile,
  fileError,
  onSubmit,
  submitting,
  submitted,
}: SubmitEvidenceProps) {
  const [confirming, setConfirming] = useState(false)
  const [attempted, setAttempted] = useState(false)

  const prProvided = prUrl.trim() !== ''
  const prValid = !prProvided || isGithubPrUrl(prUrl)
  const hasEvidence = (prProvided && prValid) || files.length > 0

  const prError = prProvided && !prValid ? 'Use a link like https://github.com/owner/repo/pull/12' : undefined
  const missingError = attempted && !hasEvidence ? 'Add a GitHub pull request link or at least one screenshot.' : undefined

  const handleSubmit = () => {
    setAttempted(true)
    if (hasEvidence && prValid && !fileError) setConfirming(true)
  }

  if (submitted) {
    return (
      <div className="grid gap-4">
        <PageTitle title="Evidence submitted" />
        <Banner tone="success" title="Submitted for checking">
          {clientName} can now review "{milestoneTitle}". Any automated checks are running. We will notify you at every
          step. Your evidence is locked and cannot be changed.
        </Banner>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <PageTitle title="Submit evidence" subtitle="Show that this milestone is done. Your client reviews it before payment is released." />

      <Card title="Milestone">
        <KeyValues
          items={[
            ['Milestone', milestoneTitle],
            ['Payment', formatNaira(amount)],
            ['Client', clientName],
          ]}
        />
      </Card>

      <Card title="Evidence">
        <TextField
          label="GitHub pull request link"
          hint="Optional if you add a screenshot. Automated checks read the result from this pull request."
          type="url"
          inputMode="url"
          placeholder="https://github.com/owner/repo/pull/12"
          value={prUrl}
          error={prError}
          onChange={onPrUrlChange}
        />
        <FileUpload
          label="Screenshots or documents"
          limits={EVIDENCE_LIMITS_TEXT}
          files={files}
          onPick={onPickFiles}
          onRemove={onRemoveFile}
          error={fileError}
        />
        <TextArea
          label="Notes for your client"
          hint="Optional. Explain what was done and how to check it."
          value={notes}
          onChange={onNotesChange}
        />
        {missingError && (
          <p role="alert" className="text-sm font-semibold text-danger">
            {missingError}
          </p>
        )}
      </Card>

      <Banner tone="warning" title="Evidence cannot be changed after you submit">
        Once attached, evidence is locked for everyone. Check your link and files first.
      </Banner>

      <Button variant="primary" block loading={submitting} onClick={handleSubmit}>
        Submit evidence
      </Button>

      <ConfirmDialog
        open={confirming}
        title="Submit this evidence?"
        confirmLabel="Submit evidence"
        loading={submitting}
        onConfirm={() => {
          setConfirming(false)
          onSubmit()
        }}
        onCancel={() => setConfirming(false)}
      >
        <p>
          You are submitting evidence for <strong>{milestoneTitle}</strong>
          {prProvided && prValid ? ', a pull request link' : ''}
          {files.length > 0 ? `, and ${files.length} ${files.length === 1 ? 'file' : 'files'}` : ''}.
        </p>
        <p>It cannot be edited or deleted afterwards. If something is wrong, tell your client in the notes.</p>
      </ConfirmDialog>
    </div>
  )
}

// Dev gallery wrapper: drives the screen from mocks with local state. Not used in production.
export function SubmitEvidencePreview() {
  const [prUrl, setPrUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [files, setFiles] = useState<(PickedFile & { raw: File })[]>([])
  const [fileError, setFileError] = useState<string | undefined>()
  const [submitted, setSubmitted] = useState(false)

  const pick = (list: FileList) => {
    const next = [...files]
    let error: string | undefined
    for (const file of Array.from(list)) {
      const problem = validateEvidenceFile(file)
      if (problem) error = problem
      else if (next.length >= EVIDENCE_LIMITS.maxFiles) error = `You can add up to ${EVIDENCE_LIMITS.maxFiles} files.`
      else if (!next.some((f) => f.name === file.name)) next.push({ name: file.name, sizeLabel: formatBytes(file.size), raw: file })
    }
    setFiles(next)
    setFileError(error)
  }

  return (
    <SubmitEvidence
      milestoneTitle={milestoneHomepage.title}
      amount={milestoneHomepage.amount}
      clientName="Grace Eze"
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
      onSubmit={() => setSubmitted(true)}
      submitted={submitted}
    />
  )
}
