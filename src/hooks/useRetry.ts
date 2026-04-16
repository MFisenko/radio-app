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

	const cancelRetry = useCallback(() => {
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}
		setIsRetrying(false)
	}, [])

	const scheduleRetry = useCallback(() => {
		if (attemptCountRef.current >= maxAttempts) {
			setIsRetrying(false)
			onExhausted()
			return
		}

		const delay = baseDelayMs * Math.pow(2, attemptCountRef.current)
		attemptCountRef.current += 1
		setIsRetrying(true)

		timeoutRef.current = setTimeout(() => {
			onAttempt()
		}, delay)
	}, [maxAttempts, baseDelayMs, onAttempt, onExhausted])

	const resetRetry = useCallback(() => {
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}
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
