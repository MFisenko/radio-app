import {
	setAudioModeAsync,
	useAudioPlayer,
	useAudioPlayerStatus,
} from 'expo-audio'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { trackEvent } from '../firebase/config'
import { ERadioUiState } from '../models/player.model'
import { useRetry } from './useRetry'

export type RadioLockScreenMeta = {
	title: string
	artist: string
	albumTitle: string
}

const DEFAULT_LOCK_SCREEN: RadioLockScreenMeta = {
	title: 'Radio',
	artist: 'Live',
	albumTitle: 'Stream',
}

export type UseRadioPlayerOptions = {
	streamUrl: string
	lockScreenMeta?: RadioLockScreenMeta
}

export function useRadioPlayer(options: UseRadioPlayerOptions) {
	const { streamUrl, lockScreenMeta = DEFAULT_LOCK_SCREEN } = options

	const [error, setError] = useState<string | null>(null)
	const [isLiveEdge, setIsLiveEdge] = useState(true)
	const [stoppedByUser, setStoppedByUser] = useState(false)
	const [hasStartedPlayback, setHasStartedPlayback] = useState(false)

	const player = useAudioPlayer(streamUrl || null)
	const status = useAudioPlayerStatus(player)

	const playingRef = useRef(status.playing)
	playingRef.current = status.playing

	const streamUrlRef = useRef(streamUrl)
	streamUrlRef.current = streamUrl

	const pausedByUserRef = useRef(false)

	const streamUrlInitRef = useRef<string | null>(null)

	const retry = useRetry({
		maxAttempts: 3,
		baseDelayMs: 1000,
		onAttempt: () => {
			void trackEvent('stream_retry', { channel: lockScreenMeta.title })
			try {
				player.replace({ uri: streamUrlRef.current })
				player.play()
			} catch { /* наступна спроба через useEffect */ }
		},
		onExhausted: () => {
			void trackEvent('stream_retry_exhausted', { channel: lockScreenMeta.title })
			setError('Не вдалося підключитись. Перевірте інтернет-з\'єднання.')
		},
	})

	const radioUiState = useMemo((): ERadioUiState => {
		if (retry.isRetrying) return ERadioUiState.RECONNECTING
		const playing = status.playing
		if (playing && isLiveEdge) return ERadioUiState.LIVE_PLAYING
		if (playing && !isLiveEdge) return ERadioUiState.BUFFER_PLAYING
		if (!playing && stoppedByUser) return ERadioUiState.STOPPED
		if (!playing && hasStartedPlayback && !stoppedByUser)
			return ERadioUiState.PAUSED
		return ERadioUiState.IDLE
	}, [status.playing, isLiveEdge, stoppedByUser, hasStartedPlayback, retry.isRetrying])

	useEffect(() => {
		async function setup() {
			try {
				await setAudioModeAsync({
					playsInSilentMode: true,
					shouldPlayInBackground: true,
					interruptionMode: 'doNotMix',
				})
			} catch (err) {
				setError(`Audio setup failed: ${String(err)}`)
			}
		}

		setup()

		return () => {
			try {
				player.setActiveForLockScreen(false)
				player.pause()
			} catch {}
		}
	}, [player])

	// Detect stream failure and trigger retry
	const wasPlayingRef = useRef(false)
	useEffect(() => {
		const wasPlaying = wasPlayingRef.current
		wasPlayingRef.current = status.playing
		if (wasPlaying && !status.playing && !pausedByUserRef.current && hasStartedPlayback) {
			retry.scheduleRetry()
		}
	}, [status.playing, hasStartedPlayback])

	// Reset retry on successful playback
	useEffect(() => {
		if (status.playing) {
			retry.resetRetry()
		}
	}, [status.playing])

	const activateControls = useCallback(() => {
		player.setActiveForLockScreen(
			true,
			{
				title: lockScreenMeta.title,
				artist: lockScreenMeta.artist,
				albumTitle: lockScreenMeta.albumTitle,
			},
			{
				showSeekBackward: false,
				showSeekForward: false,
			},
		)
	}, [player, lockScreenMeta])

	useEffect(() => {
		if (streamUrlInitRef.current === null) {
			streamUrlInitRef.current = streamUrl
			return
		}
		if (streamUrlInitRef.current === streamUrl) {
			return
		}
		streamUrlInitRef.current = streamUrl

		retry.cancelRetry()
		retry.resetRetry()

		const resume = playingRef.current
		try {
			setError(null)
			player.pause()
			player.replace(streamUrl)
			setIsLiveEdge(true)
			setStoppedByUser(false)
			if (resume) {
				activateControls()
				player.play()
			}
		} catch (err) {
			setError(`Switch stream failed: ${String(err)}`)
		}
	}, [streamUrl, player, activateControls])

	const play = useCallback(() => {
		try {
			void trackEvent('playback_play', { channel: lockScreenMeta.title })
			setError(null)
			setStoppedByUser(false)
			setHasStartedPlayback(true)
			pausedByUserRef.current = false
			activateControls()
			player.play()
		} catch (err) {
			setError(`Play failed: ${String(err)}`)
		}
	}, [player, activateControls, lockScreenMeta.title])

	const pause = useCallback(() => {
		try {
			setError(null)
			setIsLiveEdge(false)
			setStoppedByUser(false)
			pausedByUserRef.current = true
			player.pause()
		} catch (err) {
			setError(`Pause failed: ${String(err)}`)
		}
	}, [player])

	const stop = useCallback(() => {
		try {
			if (!hasStartedPlayback && !status.playing) {
				return
			}
			void trackEvent('playback_stop', { channel: lockScreenMeta.title })
			setError(null)
			retry.cancelRetry()
			retry.resetRetry()
			player.setActiveForLockScreen(false)
			pausedByUserRef.current = true
			player.pause()
			player.replace(streamUrl)
			setStoppedByUser(true)
			setIsLiveEdge(true)
			setHasStartedPlayback(true)
		} catch (err) {
			setError(`Stop failed: ${String(err)}`)
		}
	}, [player, hasStartedPlayback, status.playing, streamUrl, lockScreenMeta.title])

	/** Play, or full stop (not buffer pause) when already playing. */
	const toggle = useCallback(() => {
		if (status.playing) {
			stop()
		} else {
			play()
		}
	}, [status.playing, play, stop])

	return {
		player,
		status,
		error,
		radioUiState,
		isPlaying: status.playing,
		isLiveEdge,
		isReconnecting: retry.isRetrying,
		play,
		pause,
		stop,
		toggle,
	}
}
