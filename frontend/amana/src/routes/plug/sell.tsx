import { createFileRoute } from '@tanstack/react-router'
import { Sell } from '../../plug/Sell'

export const Route = createFileRoute('/plug/sell')({ component: Sell })
