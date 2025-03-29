import { useCommentators } from '../hooks/useCommentators'
import { motion } from 'motion/react'
import NumberFlow from '@number-flow/react'
import { VotingInfoModal, useVotingInfoModal } from './VotingInfoModal'

export function VoteStats() {
    const { totalVotes, loading } = useCommentators()
    const { isModalOpen, openModal, closeModal } = useVotingInfoModal()

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4">
                <div className="p-4 bg-white rounded-lg">
                    <div className="flex justify-between">
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/3"></div>
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/4"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="max-w-3xl mx-auto sm:px-4">
                <motion.div
                    className="p-4 bg-white rounded-lg"
                    initial={{ opacity: 0, }}
                    animate={{ opacity: 1, }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex justify-between items-center">
                        <div
                            className="bg-white rounded-lg flex items-center gap-2"
                        >
                            <h2 className="text-gray-800">Total Votes Cast:</h2>
                            <p className=" font-bold text-gray-900">
                                <NumberFlow value={totalVotes} />
                            </p>
                        </div>

                        <button
                            onClick={openModal}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            aria-label="How voting works"
                            title="How voting works"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            How voting works
                        </button>
                    </div>
                </motion.div>
            </div>

            <VotingInfoModal isOpen={isModalOpen} onClose={closeModal} />
        </>
    )
} 