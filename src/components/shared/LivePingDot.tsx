import { useEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'

import { ERadioUiState } from '../../models/player.model'

const DEFAULT_SIZE = 10

const STATUS_STYLES: Record<
	ERadioUiState,
	{ color: string; pulseEnabled: boolean }
> = {
	[ERadioUiState.IDLE]: { color: '#9ca3af', pulseEnabled: false },
	[ERadioUiState.LIVE_PLAYING]: { color: '#ef4444', pulseEnabled: true },
	[ERadioUiState.BUFFER_PLAYING]: { color: '#f59e0b', pulseEnabled: true },
	[ERadioUiState.PAUSED]: { color: '#f59e0b', pulseEnabled: false },
	[ERadioUiState.STOPPED]: { color: '#6b7280', pulseEnabled: false },
	[ERadioUiState.RECONNECTING]: { color: '#f59e0b', pulseEnabled: true },
}

export type LivePingDotProps = {
	/** Drives color and whether the pulse ring animates. */
	radioUiState: ERadioUiState
	size?: number
	/** Optional color override (rare). */
	color?: string
}

export default function LivePingDot({
	radioUiState,
	size = DEFAULT_SIZE,
	color: colorOverride,
}: LivePingDotProps) {
	const preset = STATUS_STYLES[radioUiState]
	const color = colorOverride ?? preset.color
	const pulseEnabled = preset.pulseEnabled

	const anim = useRef(new Animated.Value(0)).current

	useEffect(() => {
		if (!pulseEnabled) {
			anim.setValue(0)
			return
		}

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
	}, [anim, pulseEnabled])

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
			{pulseEnabled ? (
				<Animated.View
					pointerEvents='none'
					style={{
						position: 'absolute',
						width: size,
						height: size,
						borderRadius: size / 2,
						backgroundColor: color,
						transform: [{ scale: ringScale }],
						opacity: ringOpacity,
					}}
				/>
			) : null}
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
