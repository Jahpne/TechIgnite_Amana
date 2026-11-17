import { Button, Card, KeyValues, PageTitle, Timeline, formatNaira } from '../../ui'
import type { Receipt as ReceiptData } from '../../mocks/data'
import { receipt as mockReceipt } from '../../mocks/data'

export interface ReceiptProps {
  receipt: ReceiptData
  onPrint?: () => void
  // Shown only when provided, for example a share sheet or copy-link action.
  onShare?: () => void
}

// S12. Printable summary for both parties. Chrome is hidden when printing.
export function Receipt({ receipt, onPrint, onShare }: ReceiptProps) {
  return (
    <div className="grid gap-4">
      <PageTitle title="Receipt" subtitle="Agreement completed. Keep this for your records." />

      <Card className="print:border-0 print:p-0 print:shadow-none">
        <div className="grid gap-1 border-b border-dashed border-line pb-3">
          <span className="text-sm text-muted">{receipt.title}</span>
          <span className="text-3xl font-extrabold tabular-nums">{formatNaira(receipt.amount)}</span>
          <span className="text-sm text-muted">Completed {receipt.completedAt}</span>
        </div>

        <KeyValues
          items={[
            ['Agreement', receipt.agreementId],
            ['Paid by', receipt.payer],
            ['Paid to', receipt.payee],
            ['Paga reference', <span key="p" className="font-mono text-sm">{receipt.pagaReference}</span>],
            ['Payout reference', <span key="o" className="font-mono text-sm">{receipt.payoutReference}</span>],
          ]}
        />

        <section aria-labelledby="receipt-events" className="grid gap-2">
          <h2 id="receipt-events" className="text-base font-semibold">What happened</h2>
          <Timeline entries={receipt.events} />
        </section>

      </Card>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="primary" onClick={onPrint ?? (() => window.print())}>Print receipt</Button>
        {onShare && <Button onClick={onShare}>Share</Button>}
      </div>
    </div>
  )
}

export function ReceiptPreview() {
  return <Receipt receipt={mockReceipt} onShare={() => undefined} />
}
