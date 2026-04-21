import { useCallback, useEffect, useRef, useState } from 'react'

type UseRetryOptions = {
	maxAttempts: number
	baseDelayMs: number
	onAttempt: () => void
	onExhausted: () => void
}

type UseRetryReturn = {
	isRetrying: boolean
	attemptCount: number
	scheduleRetry: () => void
	cancelRetry: () => void
	resetRetry: () => void
}

export function useRetry({
	maxAttempts,
	baseDelayMs,
	onAttempt,
	onExhausted,
}: UseRetryOptions): UseRetryReturn {
	const [isRetrying, setIsRetrying] = useState(false)
	const attemptCountRef = useRef(0)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const isRetryingRef = useRef(false)

	// Keep callbacks in refs so the chained timeout always calls the latest version
	const onAttemptRef = useRef(onAttempt)
	const onExhaustedRef = useRef(onExhausted)
	onAttemptRef.current = onAttempt
	onExhaustedRef.current = onExhausted

	const cancelRetry = useCallback(() => {
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}
		isRetryingRef.current = false
		setIsRetrying(false)
	}, [])

	// Schedules the full retry chain. Each attempt automatically chains to the
	// next one so retries continue even when the network stays down (i.e. when
	// the player never reaches `playing: true` between attempts).
	// resetRetry() cancels the chain as soon as playback recovers.
	const scheduleRetry = useCallback(() => {
		if (isRetryingRef.current) return

		isRetryingRef.current = true
		setIsRetrying(true)

		function attemptAndChain() {
			if (attemptCountRef.current >= maxAttempts) {
				isRetryingRef.current = false
				setIsRetrying(false)
				onExhaustedRef.current()
				return
			}

			const delay = baseDelayMs * Math.pow(2, attemptCountRef.current)
			attemptCountRef.current += 1

			timeoutRef.current = setTimeout(() => {
				timeoutRef.current = null
				onAttemptRef.current()
				attemptAndChain()
			}, delay)
		}

		attemptAndChain()
	}, [maxAttempts, baseDelayMs])

	const resetRetry = useCallback(() => {
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}
		isRetryingRef.current = false
		attemptCountRef.current = 0
		setIsRetrying(false)
	}, [])

	useEffect(() => {
		return () => cancelRetry()
	}, [cancelRetry])

	return {
		isRetrying,
		get attemptCount() {
			return attemptCountRef.current
		},
		scheduleRetry,
		cancelRetry,
		resetRetry,
	}
}
