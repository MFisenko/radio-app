import {
	setAudioModeAsync,
	useAudioPlayer,
	useAudioPlayerStatus,
} from 'expo-audio'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { ERadioUiState } from '../models/player.model'

const AUDIO_SOURCE =
	'https://radio.dc.beltelecom.by/radiusfm/radiusfm.stream/playlist.m3u8'

const LOCK_SCREEN_META = {
	title: 'Radius FM',
	artist: 'Live Radio',
	albumTitle: 'Radio Stream',
} as const

export function useRadioPlayer() {
	const [error, setError] = useState<string | null>(null)
	/** After pause: audio is from the buffer, not the live edge. */
	const [isLiveEdge, setIsLiveEdge] = useState(true)
	/** User pressed Stop: fully disconnected; next Play is live again. */
	const [stoppedByUser, setStoppedByUser] = useState(false)
	/** Playback has started at least once this session (idle vs paused-after-listening). */
	const [hasStartedPlayback, setHasStartedPlayback] = useState(false)

	const player = useAudioPlayer(AUDIO_SOURCE)
	const status = useAudioPlayerStatus(player)

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
			{ ...LOCK_SCREEN_META },
			{
				showSeekBackward: false,
				showSeekForward: false,
			},
		)
	}, [player])

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

	/** Full stop: next Play is live again (HLS source reload). */
	const stop = useCallback(() => {
		try {
			if (!hasStartedPlayback && !status.playing) {
				return
			}
			setError(null)
			player.setActiveForLockScreen(false)
			player.pause()
			player.replace(AUDIO_SOURCE)
			setStoppedByUser(true)
			setIsLiveEdge(true)
			setHasStartedPlayback(true)
		} catch (err) {
			setError(`Stop failed: ${String(err)}`)
		}
	}, [player, hasStartedPlayback, status.playing])

	const toggle = useCallback(() => {
		if (status.playing) {
			pause()
		} else {
			play()
		}
	}, [status.playing, play, pause])

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
