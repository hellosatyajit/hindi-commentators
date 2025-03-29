import { useState } from 'react'
import { Route } from '../routes/__root'
import type { CommentatorWithVotes } from '../hooks/useCommentators'
import { getSupabaseClient } from '../utils/supabase'
import NumberFlow from '@number-flow/react'
import { motion } from 'motion/react'

type Props = {
    commentator: CommentatorWithVotes
    rank: number
    onVote: (commentatorId: string, voteType: 1 | -1) => void
}

export function CommentatorCard({ commentator, rank, onVote }: Props) {
    const { user } = Route.useRouteContext()
    const [isVoting, setIsVoting] = useState(false);
    const [prevRank, setPrevRank] = useState(rank);
    const hasRankChanged = prevRank !== rank;

    if (hasRankChanged) {
        setPrevRank(rank);
    }

    const handleVote = async (voteType: 1 | -1) => {
        if (!user || commentator.is_active === false) return

        setIsVoting(true)
        try {
            onVote(commentator.id, voteType)

            const supabase = getSupabaseClient()
            const channel = supabase.channel('votes_channel')

            const { error: insertError } = await supabase
                .from('votes')
                .upsert({
                    user_id: user.id,
                    commentator_id: commentator.id,
                    vote_type: voteType,
                })

            if (insertError?.code === '23505') {
                await supabase
                    .from('votes')
                    .update({ vote_type: voteType })
                    .eq('user_id', user.id)
                    .eq('commentator_id', commentator.id)
            }

            await channel.send({
                type: 'broadcast',
                event: 'vote_update',
                payload: {
                    user_id: user.id,
                    commentator_id: commentator.id,
                    vote_type: voteType
                }
            })

        } catch (error) {
            console.error('Error voting:', error)
            if (commentator.user_vote === 1 || commentator.user_vote === -1) {
                onVote(commentator.id, commentator.user_vote)
            }
        } finally {
            setIsVoting(false)
        }
    }

    return (
        <div className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors rounded-lg ${!commentator.is_active ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="flex-shrink-0 relative">
                <img
                    src={commentator.image_url || '/default-avatar.png'}
                    alt={commentator.name}
                    className="w-12 h-12 rounded-full object-cover"
                />
                <motion.div
                    className="absolute -top-2 -left-2 bg-gray-200 text-gray-600 text-xs p-1 rounded leading-none"
                    key={`rank-${rank}`}
                    initial={{ scale: hasRankChanged ? 1.2 : 1 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                    }}
                >
                    #{rank}
                </motion.div>
            </div>

            <div className="flex-grow">
                <p className="text-base sm:text-xl text-gray-900 leading-relaxed">
                    {commentator.name}
                </p>
                <p className="text-sm text-gray-900 leading-relaxed">
                    {commentator.description}
                </p>
            </div>

            <motion.div
                className="flex items-center gap-2"
                layout
            >
                <motion.button
                    onClick={() => handleVote(1)}
                    disabled={isVoting || !user || !commentator.is_active}
                    className={`text-green-500 ${(!user || !commentator.is_active) && 'opacity-50 cursor-not-allowed'}`}
                    title={user ? 'Upvote' : 'Login to vote'}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.1 }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0017 21.9982H10.0475C9.03149 21.9982 7.32508 22.1082 7.32508 20.6026V13.5667C7.32508 13.0684 7.01695 12.7268 6.43689 12.7268H2.59948C1.43841 12.7268 2.24946 11.8116 2.66039 11.4193C3.07133 11.027 6.69819 7.22967 6.69819 7.22967C6.69819 7.22967 10.941 2.78849 11.4091 2.34169C11.8772 1.8949 12.1044 1.87739 12.5909 2.34169C13.0774 2.806 17.3018 7.22967 17.3018 7.22967C17.3018 7.22967 20.9287 11.027 21.3396 11.4193C21.7505 11.8116 22.5616 12.7268 21.4005 12.7268H17.5631C16.983 12.7268 16.6749 13.0684 16.6749 13.5667V20.6026C16.6749 22.1082 14.9685 21.9982 13.9525 21.9982H12.0017Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" fill={commentator.user_vote === 1 ? 'currentColor' : ''}></path></svg>
                </motion.button>
                <motion.span
                    className="text-gray-700 font-medium"
                    key={commentator.total_votes}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                >
                    <NumberFlow value={commentator.total_votes} />
                </motion.span>
                <motion.button
                    onClick={() => handleVote(-1)}
                    disabled={isVoting || !user || !commentator.is_active}
                    className={`text-red-500 ${(!user || !commentator.is_active) && 'opacity-50 cursor-not-allowed'}`}
                    title={user ? 'Downvote' : 'Login to vote'}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.1 }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='rotate-180'><path d="M12.0017 21.9982H10.0475C9.03149 21.9982 7.32508 22.1082 7.32508 20.6026V13.5667C7.32508 13.0684 7.01695 12.7268 6.43689 12.7268H2.59948C1.43841 12.7268 2.24946 11.8116 2.66039 11.4193C3.07133 11.027 6.69819 7.22967 6.69819 7.22967C6.69819 7.22967 10.941 2.78849 11.4091 2.34169C11.8772 1.8949 12.1044 1.87739 12.5909 2.34169C13.0774 2.806 17.3018 7.22967 17.3018 7.22967C17.3018 7.22967 20.9287 11.027 21.3396 11.4193C21.7505 11.8116 22.5616 12.7268 21.4005 12.7268H17.5631C16.983 12.7268 16.6749 13.0684 16.6749 13.5667V20.6026C16.6749 22.1082 14.9685 21.9982 13.9525 21.9982H12.0017Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" fill={commentator.user_vote === -1 ? 'currentColor' : ''}></path></svg>
                </motion.button>
            </motion.div>
        </div>
    )
} 