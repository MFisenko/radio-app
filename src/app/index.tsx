import { Text, View } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'
import LivePingDot from '../components/shared/LivePingDot'
import PlayerControls from '../components/shared/PlayerControls'
import Vinyl from '../components/shared/Vinyl'
import { useRadioPlayer } from '../hooks/useRadioPlayer'

export default function Index() {
	const { error, isPlaying, toggle } = useRadioPlayer()

	return (
		<SafeAreaView className='flex-1' edges={['top', 'left', 'right']}>
			<View className='flex-1 px-6'>
				<View className='items-center gap-2 pt-2'>
					<Text className='text-[11px] font-medium uppercase tracking-[0.2em] text-violet-600'>
						Current status
					</Text>
					<View className='flex-row items-center gap-2'>
						<LivePingDot />
						<Text className='text-lg font-bold uppercase tracking-wider text-red-600'>
							Live
						</Text>
					</View>
				</View>

				<View className='flex-1 justify-center gap-10'>
					<View className='items-center gap-0 px-2'>
						<Text className='text-center text-[32px] font-bold leading-tight text-neutral-800'>
							Radius
						</Text>
						<Text className='text-center text-[32px] font-bold leading-tight text-neutral-800'>
							FM
						</Text>
					</View>
					<Vinyl isPlaying={isPlaying} />
					<Text className='px-4 text-center text-base text-neutral-600 font-mono'>
						Beltelecom · live stream
					</Text>
				</View>

				{error ? (
					<Text className='mb-2 text-center text-sm text-red-500'>{error}</Text>
				) : null}

				<PlayerControls isPlaying={isPlaying} onPress={toggle} />
			</View>
		</SafeAreaView>
	)
}
