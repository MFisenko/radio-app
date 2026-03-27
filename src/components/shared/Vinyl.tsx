import { Image } from 'expo-image'
import { useEffect, useRef } from 'react'
import { View } from 'react-native'

const DEFAULT_MS_PER_TURN = 12000

type Props = {
	isPlaying: boolean
	size?: number
	msPerTurn?: number
}

export default function Vinyl({
	isPlaying,
	size = 280,
	msPerTurn = DEFAULT_MS_PER_TURN,
}: Props) {
	const discRef = useRef<View>(null)
	const rotationDeg = useRef(0)
	const rafId = useRef<number | null>(null)
	const lastT = useRef<number | null>(null)

	useEffect(() => {
		if (!isPlaying) {
			if (rafId.current != null) {
				cancelAnimationFrame(rafId.current)
				rafId.current = null
			}
			lastT.current = null
			return
		}

		const tick = (t: number) => {
			if (lastT.current == null) {
				lastT.current = t
			} else {
				const rawDt = t - lastT.current
				const dt = Math.min(rawDt, 64)
				lastT.current = t

				rotationDeg.current += (dt / msPerTurn) * 360
				rotationDeg.current %= 360

				discRef.current?.setNativeProps({
					style: {
						transform: [{ rotate: `${rotationDeg.current}deg` }],
					},
				})
			}
			rafId.current = requestAnimationFrame(tick)
		}

		rafId.current = requestAnimationFrame(tick)

		return () => {
			if (rafId.current != null) {
				cancelAnimationFrame(rafId.current)
				rafId.current = null
			}
			lastT.current = null
		}
	}, [isPlaying, msPerTurn])

	return (
		<View
			className='items-center justify-center'
			style={{
				shadowColor: '#f9a8d4',
				shadowOffset: { width: 0, height: 0 },
				shadowOpacity: 0.85,
				shadowRadius: 40,
				elevation: 20,
			}}
		>
			<View
				ref={discRef}
				style={{
					width: size,
					height: size,
					borderRadius: size / 2,
					overflow: 'hidden',
					borderWidth: 3,
					borderColor: '#fff',
					backgroundColor: '#fff',
					transform: [{ rotate: '0deg' }],
				}}
			>
				<Image
					source={require('../../../assets/vinyl.webp')}
					style={{ width: '100%', height: '100%' }}
					contentFit='cover'
					transition={200}
				/>
			</View>
		</View>
	)
}
