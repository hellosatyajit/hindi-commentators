import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

type VotingInfoModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function VotingInfoModal({ isOpen, onClose }: VotingInfoModalProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">How Voting Works</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="text-green-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.0017 21.9982H10.0475C9.03149 21.9982 7.32508 22.1082 7.32508 20.6026V13.5667C7.32508 13.0684 7.01695 12.7268 6.43689 12.7268H2.59948C1.43841 12.7268 2.24946 11.8116 2.66039 11.4193C3.07133 11.027 6.69819 7.22967 6.69819 7.22967C6.69819 7.22967 10.941 2.78849 11.4091 2.34169C11.8772 1.8949 12.1044 1.87739 12.5909 2.34169C13.0774 2.806 17.3018 7.22967 17.3018 7.22967C17.3018 7.22967 20.9287 11.027 21.3396 11.4193C21.7505 11.8116 22.5616 12.7268 21.4005 12.7268H17.5631C16.983 12.7268 16.6749 13.0684 16.6749 13.5667V20.6026C16.6749 22.1082 14.9685 21.9982 13.9525 21.9982H12.0017Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" fill="currentColor"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Upvote (Green)</p>
                  <p className="text-gray-600 text-sm">You think the commentator is good</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-red-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
                    <path d="M12.0017 21.9982H10.0475C9.03149 21.9982 7.32508 22.1082 7.32508 20.6026V13.5667C7.32508 13.0684 7.01695 12.7268 6.43689 12.7268H2.59948C1.43841 12.7268 2.24946 11.8116 2.66039 11.4193C3.07133 11.027 6.69819 7.22967 6.69819 7.22967C6.69819 7.22967 10.941 2.78849 11.4091 2.34169C11.8772 1.8949 12.1044 1.87739 12.5909 2.34169C13.0774 2.806 17.3018 7.22967 17.3018 7.22967C17.3018 7.22967 20.9287 11.027 21.3396 11.4193C21.7505 11.8116 22.5616 12.7268 21.4005 12.7268H17.5631C16.983 12.7268 16.6749 13.0684 16.6749 13.5667V20.6026C16.6749 22.1082 14.9685 21.9982 13.9525 21.9982H12.0017Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" fill="currentColor"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Downvote (Red)</p>
                  <p className="text-gray-600 text-sm">You think the commentator is bad</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <h3 className="font-medium text-gray-800 mb-2">How Ranking Works</h3>
                <p className="text-gray-600 text-sm">
                  Commentators are ranked based on their score, worst to better, with the lowest scores appearing first. 
                </p>
                <pre className='font-mono'>final score = upvotes - downvotes</pre>
                <p className="text-gray-600 text-sm mt-2">
                  A score near zero may indicate a commentator is considered neutral by the community - neither particularly good nor bad.
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="mt-6 w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Got it
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function useVotingInfoModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  useEffect(() => {
    const hasSeenModal = localStorage.getItem('has_seen_voting_info')
    
    if (!hasSeenModal) {
      setIsModalOpen(true)
      localStorage.setItem('has_seen_voting_info', 'true')
    }
  }, [])
  
  return {
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false)
  }
} 