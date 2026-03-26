import {
	setAudioModeAsync,
	useAudioPlayer,
	useAudioPlayerStatus,
} from 'expo-audio'
import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const audioSource =
	'https://radio.dc.beltelecom.by/radiusfm/radiusfm.stream/playlist.m3u8'

export default function Index() {
	const [error, setError] = useState<string | null>(null)

	const player = useAudioPlayer(audioSource)
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

	const activateControls = () => {
		player.setActiveForLockScreen(
			true,
			{
				title: 'Radius FM',
				artist: 'Live Radio',
				albumTitle: 'Radio Stream',
			},
			{
				showSeekBackward: false,
				showSeekForward: false,
			},
		)
	}

	const handlePlay = () => {
		try {
			setError(null)
			activateControls()
			player.play()
		} catch (err) {
			setError(`Play failed: ${String(err)}`)
		}
	}

	const handlePause = () => {
		try {
			setError(null)
			player.pause()
		} catch (err) {
			setError(`Pause failed: ${String(err)}`)
		}
	}

	const handleStop = () => {
		try {
			setError(null)
			player.pause()
			player.setActiveForLockScreen(false)
		} catch (err) {
			setError(`Stop failed: ${String(err)}`)
		}
	}

	return (
		<SafeAreaView className='flex-1'>
			<View className='flex-1 justify-center px-4 py-10 gap-4'>
				<Text className='text-2xl text-center'>Radio Player</Text>

				{error ? (
					<Text className='text-red-500 text-center'>{error}</Text>
				) : (
					<Text className='text-center'>
						{status.playing ? 'Playing' : 'Paused'}
					</Text>
				)}

				<View className='justify-center items-center gap-4'>
					<Pressable
						onPress={handlePlay}
						className='px-3 py-2 bg-neutral-300 rounded-2xl'
					>
						<Text className='text-lg'>Play</Text>
					</Pressable>

					<Pressable
						onPress={handlePause}
						className='px-3 py-2 bg-neutral-300 rounded-2xl'
					>
						<Text className='text-lg'>Pause</Text>
					</Pressable>

					<Pressable
						onPress={handleStop}
						className='px-3 py-2 bg-neutral-300 rounded-2xl'
					>
						<Text className='text-lg'>Stop</Text>
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	)
}
