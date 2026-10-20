import { useState } from 'react'
import { signInWithApple, signInWithGoogle } from './socialAuth'
import toast from 'react-hot-toast'

// Google / Apple sign-in handlers with their own loading state.
export function useSocialAuth({ axios, onToken }) {
  const [socialLoading, setSocialLoading] = useState(null)

  const handleGoogle = async () => {
    if (socialLoading) return
    setSocialLoading('google')
    try {
      onToken(await signInWithGoogle({ axios }))
    } catch (error) {
      toast.error(error.message || 'Google sign-in failed')
    } finally {
      setSocialLoading(null)
    }
  }

  const handleApple = async () => {
    if (socialLoading) return
    setSocialLoading('apple')
    try {
      onToken(await signInWithApple({ axios }))
    } catch (error) {
      if (error?.error !== 'popup_closed_by_user') {
        toast.error(error.message || 'Apple sign-in failed')
      }
    } finally {
      setSocialLoading(null)
    }
  }

  return { socialLoading, handleGoogle, handleApple }
}

export default useSocialAuth
