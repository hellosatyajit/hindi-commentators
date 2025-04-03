import { useCommentators } from '../hooks/useCommentators'
import { CommentatorCard } from './CommentatorCard'
import { motion, AnimatePresence } from 'motion/react'

export function CommentatorList() {
  const { commentators, loading, error, updateCommentatorVote } = useCommentators()

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-2 py-4 sm:p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white px-2 py-4 sm:p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/3"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 rounded bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
                  <div className="h-8 w-8 rounded bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>Error loading commentators</p>
        <p className="text-sm">{error.message}</p>
      </div>
    )
  }

  const sortedCommentators = [...commentators].sort((a, b) => {
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }
    return a.vote_sum - b.vote_sum;
  });

  return (
    <div className="max-w-3xl mx-auto px-2 py-4 sm:p-4">
      <motion.div
        className="divide-y divide-gray-100"
        layout
      >
        <AnimatePresence>
          {sortedCommentators.map((commentator, index) => (
            <motion.div
              key={commentator.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 1
              }}
            >
              <CommentatorCard
                commentator={commentator}
                rank={index + 1}
                onVote={updateCommentatorVote}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
} 