import {
	setAudioModeAsync,
	useAudioPlayer,
	useAudioPlayerStatus,
} from 'expo-audio'
import { useCallback, useEffect, useState } from 'react'

const AUDIO_SOURCE =
	'https://radio.dc.beltelecom.by/radiusfm/radiusfm.stream/playlist.m3u8'

const LOCK_SCREEN_META = {
	title: 'Radius FM',
	artist: 'Live Radio',
	albumTitle: 'Radio Stream',
} as const

export function useRadioPlayer() {
	const [error, setError] = useState<string | null>(null)
	const player = useAudioPlayer(AUDIO_SOURCE)
	const status = useAudioPlayerStatus(player)

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
			activateControls()
			player.play()
		} catch (err) {
			setError(`Play failed: ${String(err)}`)
		}
	}, [player, activateControls])

	const pause = useCallback(() => {
		try {
			setError(null)
			player.pause()
		} catch (err) {
			setError(`Pause failed: ${String(err)}`)
		}
	}, [player])

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
		isPlaying: status.playing,
		play,
		pause,
		toggle,
	}
}
