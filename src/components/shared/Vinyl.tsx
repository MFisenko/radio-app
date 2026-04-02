import { Image } from 'expo-image'
import { View } from 'react-native'

type Props = {
	coverUri?: string | null
	glowColor?: string
}

export default function Vinyl({ coverUri, glowColor = '#f9a8d4' }: Props) {
	return (
		<View
			className='items-center justify-center'
			style={{
				shadowColor: glowColor,
				shadowOffset: { width: 0, height: 0 },
				shadowOpacity: 0.85,
				shadowRadius: 40,
				elevation: 20,
			}}
		>
			<View
				style={{
					width: 280,
					height: 280,
					borderRadius: 64,
					overflow: 'hidden',
					borderWidth: 3,
					borderColor: '#fff',
					backgroundColor: '#fff',
				}}
			>
				{coverUri ? (
					<Image
						source={{ uri: coverUri }}
						style={{ width: '100%', height: '100%' }}
						contentFit='cover'
					/>
				) : (
					<Image
						source={require('../../../assets/vinyl.webp')}
						style={{ width: '100%', height: '100%' }}
						contentFit='cover'
					/>
				)}
			</View>
		</View>
	)
}
