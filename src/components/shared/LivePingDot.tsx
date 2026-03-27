import { useEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'

const DEFAULT_SIZE = 10
const DEFAULT_COLOR = '#ef4444'

export type LivePingDotProps = {
	color?: string
	pulseColor?: string
	size?: number
}

export default function LivePingDot({
	color = DEFAULT_COLOR,
	pulseColor,
	size = DEFAULT_SIZE,
}: LivePingDotProps) {
	const ringColor = pulseColor ?? color
	const anim = useRef(new Animated.Value(0)).current

	useEffect(() => {
		const loop = Animated.loop(
			Animated.timing(anim, {
				toValue: 1,
				duration: 1400,
				easing: Easing.out(Easing.quad),
				useNativeDriver: true,
			}),
		)
		loop.start()
		return () => {
			loop.stop()
			anim.setValue(0)
		}
	}, [anim])

	const ringScale = anim.interpolate({
		inputRange: [0, 1],
		outputRange: [1, 2.4],
	})
	const ringOpacity = anim.interpolate({
		inputRange: [0, 1],
		outputRange: [0.55, 0],
	})

	return (
		<View
			className='items-center justify-center'
			style={{ width: size * 2.6, height: size * 2.6 }}
		>
			<Animated.View
				pointerEvents='none'
				style={{
					position: 'absolute',
					width: size,
					height: size,
					borderRadius: size / 2,
					backgroundColor: ringColor,
					transform: [{ scale: ringScale }],
					opacity: ringOpacity,
				}}
			/>
			<View
				style={{
					width: size,
					height: size,
					borderRadius: size / 2,
					backgroundColor: color,
				}}
			/>
		</View>
	)
}
