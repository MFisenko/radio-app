import { Ionicons } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'

type Props = {
	isPlaying: boolean
	onToggle: () => void
	onStop: () => void
	disabled?: boolean
}

export default function PlayerControls({
	isPlaying,
	onToggle,
	onStop,
	disabled,
}: Props) {
	return (
		<View className='flex-row items-center justify-center gap-8 pb-6 pt-2'>
			<Pressable
				onPress={onToggle}
				disabled={disabled}
				className='h-20 w-20 items-center justify-center rounded-full bg-white active:opacity-90'
				style={{
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 8 },
					shadowOpacity: 0.12,
					shadowRadius: 16,
					elevation: 10,
				}}
			>
				<Ionicons
					name={isPlaying ? 'pause' : 'play'}
					size={40}
					color='#6B21A8'
					style={isPlaying ? undefined : { marginLeft: 4 }}
				/>
			</Pressable>

			<Pressable
				onPress={onStop}
				disabled={disabled}
				className='h-14 w-14 items-center justify-center rounded-full bg-white active:opacity-90'
				style={{
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.1,
					shadowRadius: 10,
					elevation: 6,
				}}
				hitSlop={8}
			>
				<Ionicons name='stop' size={28} color='#6b7280' />
			</Pressable>
		</View>
	)
}
