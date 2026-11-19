import { createFileRoute } from '@tanstack/react-router'
import { ListingDetail } from '../../plug/ListingDetail'

export const Route = createFileRoute('/plug/$id')({
  component: function Page() {
    const { id } = Route.useParams()
    return <ListingDetail id={id} />
  },
})
