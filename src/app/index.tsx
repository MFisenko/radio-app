import { Text, View } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'
import LivePingDot from '../components/shared/LivePingDot'
import PlayerControls from '../components/shared/PlayerControls'
import Vinyl from '../components/shared/Vinyl'
import { useRadioPlayer } from '../hooks/useRadioPlayer'
import { ERadioUiState } from '../models/player.model'

const STATUS_LABEL: Record<ERadioUiState, string> = {
	[ERadioUiState.IDLE]: 'READY',
	[ERadioUiState.LIVE_PLAYING]: 'LIVE',
	[ERadioUiState.BUFFER_PLAYING]: 'DELAYED',
	[ERadioUiState.PAUSED]: 'PAUSED',
	[ERadioUiState.STOPPED]: 'OFF',
}

const STATUS_TEXT_CLASS: Record<ERadioUiState, string> = {
	[ERadioUiState.IDLE]: 'text-neutral-400',
	[ERadioUiState.LIVE_PLAYING]: 'text-red-600',
	[ERadioUiState.BUFFER_PLAYING]: 'text-amber-600',
	[ERadioUiState.PAUSED]: 'text-amber-600',
	[ERadioUiState.STOPPED]: 'text-neutral-500',
}

export default function Index() {
	const { error, isPlaying, radioUiState, stop, toggle } = useRadioPlayer()

	return (
		<SafeAreaView className='flex-1' edges={['top', 'left', 'right']}>
			<View className='flex-1 p-5'>
				<View className='flex-1 justify-center gap-10'>
					<View className='items-center gap-2 pt-2'>
						<Text className='text-[11px] font-medium uppercase tracking-widest text-violet-600 font-mono'>
							Current status
						</Text>
						<View className='flex-row items-center gap-2'>
							<LivePingDot radioUiState={radioUiState} />
							<Text
								className={`text-lg font-bold uppercase tracking-widest font-mono ${STATUS_TEXT_CLASS[radioUiState]}`}
							>
								{STATUS_LABEL[radioUiState]}
							</Text>
						</View>
					</View>
					<View className='items-center gap-0 px-2'>
						<Text className='text-center text-3xl leading-tight text-neutral-800 font-mono'>
							Radius
						</Text>
						<Text className='text-center text-3xl leading-tight text-neutral-800 font-mono'>
							FM
						</Text>
					</View>
					<Vinyl isPlaying={isPlaying} />
					<Text className='px-4 text-center text-base text-neutral-600 font-mono'>
						Radio Stream
					</Text>
				</View>

				{error ? (
					<Text className='mb-2 text-center text-sm text-red-500'>{error}</Text>
				) : null}

				<PlayerControls isPlaying={isPlaying} onToggle={toggle} onStop={stop} />
			</View>
		</SafeAreaView>
	)
}
