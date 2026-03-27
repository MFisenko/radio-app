import { Ionicons } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'

type Props = {
	isPlaying: boolean
	onPress: () => void
	disabled?: boolean
}

const PURPLE = '#6B21A8'

export default function PlayerControls({
	isPlaying,
	onPress,
	disabled,
}: Props) {
	return (
		<View className='items-center pb-6 pt-2'>
			<Pressable
				onPress={onPress}
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
					color={PURPLE}
					style={isPlaying ? undefined : { marginLeft: 4 }}
				/>
			</Pressable>
		</View>
	)
}
