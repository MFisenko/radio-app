import { Ionicons } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'

type Props = {
	isPlaying: boolean
	onToggle: () => void
	onPrev: () => void
	onNext: () => void
	disabled?: boolean
	accentColor?: string
}

export default function PlayerControls({
	isPlaying,
	onToggle,
	onPrev,
	onNext,
	disabled,
	accentColor = '#6B21A8',
}: Props) {
	return (
		<View className='flex-row items-center justify-center gap-4'>
			<Pressable
				onPress={onPrev}
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
				<Ionicons name='play-skip-back' size={28} color={accentColor} />
			</Pressable>

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
					color={accentColor}
					style={isPlaying ? undefined : { marginLeft: 4 }}
				/>
			</Pressable>

			<Pressable
				onPress={onNext}
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
				<Ionicons name='play-skip-forward' size={28} color={accentColor} />
			</Pressable>
		</View>
	)
}
