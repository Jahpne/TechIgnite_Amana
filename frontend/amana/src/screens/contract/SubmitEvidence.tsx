import { useState } from 'react'
import { Banner, Button, Card, ConfirmDialog, FileUpload, KeyValues, PageTitle, TextArea, TextField, formatNaira } from '../../ui'
import type { PickedFile } from '../../ui'
import { EVIDENCE_LIMITS_TEXT, isGithubPrUrl, isWorkLink } from './amounts'

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
  const prValid = !prProvided || isWorkLink(prUrl)
  const hasEvidence = (prProvided && prValid) || files.length > 0
  // A pull request is just a link we happen to recognise: it unlocks the
  // automatic test check. Everything else is reviewed by the client.
  const isPullRequest = prProvided && prValid && isGithubPrUrl(prUrl)

  const prError = prProvided && !prValid ? 'Use a full link starting with https://' : undefined
  const missingError = attempted && !hasEvidence ? 'Add a link to your work, or at least one file.' : undefined

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
          label="Link to your work"
          hint="A published page, a design file, a shared folder — anything your client can open. Optional if you upload files instead."
          type="url"
          inputMode="url"
          placeholder="https://"
          value={prUrl}
          error={prError}
          onChange={onPrUrlChange}
        />
        {isPullRequest && (
          <p className="flex items-start gap-2 text-sm text-success">
            <span aria-hidden="true">✓</span>
            <span>
              That is a GitHub pull request, so the automated test result will be checked for you as well as your
              client's review.
            </span>
          </p>
        )}
        <FileUpload
          label="Photos, screenshots or documents"
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
          {prProvided && prValid ? ', a link to your work' : ''}
          {files.length > 0 ? `, and ${files.length} ${files.length === 1 ? 'file' : 'files'}` : ''}.
        </p>
        <p>It cannot be edited or deleted afterwards. If something is wrong, tell your client in the notes.</p>
      </ConfirmDialog>
    </div>
  )
}
