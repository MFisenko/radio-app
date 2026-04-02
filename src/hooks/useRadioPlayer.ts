import {
	setAudioModeAsync,
	useAudioPlayer,
	useAudioPlayerStatus,
} from 'expo-audio'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ERadioUiState } from '../models/player.model'

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

	const player = useAudioPlayer(streamUrl)
	const status = useAudioPlayerStatus(player)

	const playingRef = useRef(status.playing)
	playingRef.current = status.playing

	const streamUrlInitRef = useRef<string | null>(null)

	const radioUiState = useMemo((): ERadioUiState => {
		const playing = status.playing
		if (playing && isLiveEdge) return ERadioUiState.LIVE_PLAYING
		if (playing && !isLiveEdge) return ERadioUiState.BUFFER_PLAYING
		if (!playing && stoppedByUser) return ERadioUiState.STOPPED
		if (!playing && hasStartedPlayback && !stoppedByUser)
			return ERadioUiState.PAUSED
		return ERadioUiState.IDLE
	}, [
		status.playing,
		isLiveEdge,
		stoppedByUser,
		hasStartedPlayback,
	])

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
			setError(null)
			setStoppedByUser(false)
			setHasStartedPlayback(true)
			activateControls()
			player.play()
		} catch (err) {
			setError(`Play failed: ${String(err)}`)
		}
	}, [player, activateControls])

	const pause = useCallback(() => {
		try {
			setError(null)
			setIsLiveEdge(false)
			setStoppedByUser(false)
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
			setError(null)
			player.setActiveForLockScreen(false)
			player.pause()
			player.replace(streamUrl)
			setStoppedByUser(true)
			setIsLiveEdge(true)
			setHasStartedPlayback(true)
		} catch (err) {
			setError(`Stop failed: ${String(err)}`)
		}
	}, [player, hasStartedPlayback, status.playing, streamUrl])

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
		play,
		pause,
		stop,
		toggle,
	}
}
