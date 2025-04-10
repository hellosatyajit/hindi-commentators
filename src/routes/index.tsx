import { createFileRoute } from '@tanstack/react-router'
import { CommentatorList } from '../components/CommentatorList'
import { VoteStats } from '../components/ProductInfo'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <VoteStats />
      <CommentatorList />
    </div>
  )
}
