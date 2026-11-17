import type { ReactNode } from 'react'
import {
  AgreementDetailPreview,
  ConfirmDeliveryPreview,
  CreateOrderPreview,
  OrderLinkPreview,
  SignInPreview,
} from './trade'
import {
  ApproveMilestonePreview,
  NewContractPreview,
  ReviewTermsPreview,
  SubmitEvidencePreview,
} from './contract'
import { AdminDisputesPreview, MyAgreementsPreview, ReceiptPreview } from './lists'

// Registry of screens. router.tsx builds one route per entry, and the gallery at "/" lists them.
//
// To add or replace a screen: edit ONLY your own line below. One line per screen keeps
// parallel edits from conflicting. Replace `render` with your screen component, for example
//   render: () => <OrderLinkPage />
// Screens read route params with `useParams({ strict: false })` from '@tanstack/react-router'.

export interface ScreenEntry {
  id: string
  /** TanStack Router path, with `$param` segments. */
  path: string
  title: string
  /** Real URL used by the gallery link, with mock ids filled in. */
  sample: string
  /** Wide layout (admin screens). */
  wide?: boolean
  render: () => ReactNode
}

export const screens: ScreenEntry[] = [
  { id: 'S1', path: '/signin', sample: '/signin', title: 'Sign in', render: () => <SignInPreview /> },
  { id: 'S2', path: '/o/$agreementId', sample: '/o/ord-awaiting_payment', title: 'Order link page', render: () => <OrderLinkPreview /> },
  { id: 'S3', path: '/orders/new', sample: '/orders/new', title: 'Create order', render: () => <CreateOrderPreview /> },
  { id: 'S4', path: '/agreements/$id', sample: '/agreements/ord-funded', title: 'Agreement detail', render: () => <AgreementDetailPreview /> },
  { id: 'S5', path: '/agreements/$id/confirm', sample: '/agreements/ord-delivered/confirm', title: 'Confirm or report delivery', render: () => <ConfirmDeliveryPreview /> },
  { id: 'S6', path: '/contracts/new', sample: '/contracts/new', title: 'New contract (AI)', render: () => <NewContractPreview /> },
  { id: 'S7', path: '/agreements/$id/terms', sample: '/agreements/con-001/terms', title: 'Review and edit terms', render: () => <ReviewTermsPreview /> },
  { id: 'S8', path: '/milestones/$id/evidence', sample: '/milestones/ms-1/evidence', title: 'Submit milestone evidence', render: () => <SubmitEvidencePreview /> },
  { id: 'S9', path: '/milestones/$id/review', sample: '/milestones/ms-1/review', title: 'Approve milestone', render: () => <ApproveMilestonePreview /> },
  { id: 'S10', path: '/agreements', sample: '/agreements', title: 'My agreements', render: () => <MyAgreementsPreview /> },
  { id: 'S11', path: '/admin/disputes', sample: '/admin/disputes', title: 'Admin: disputes', wide: true, render: () => <AdminDisputesPreview /> },
  { id: 'S12', path: '/agreements/$id/receipt', sample: '/agreements/ord-completed/receipt', title: 'Receipt', render: () => <ReceiptPreview /> },
]
