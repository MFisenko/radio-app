import { Image } from 'expo-image'
import { useCallback, useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'
import LivePingDot from '../components/shared/LivePingDot'
import PlayerControls from '../components/shared/PlayerControls'
import Vinyl from '../components/shared/Vinyl'
import {
	channelAccentHex,
	channelGradientColors,
	config,
	getChannelStreamUrl,
} from '../config'
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

const CHANNELS = [...config].sort((a, b) => a.position - b.position)

export default function Index() {
	const [channelIndex, setChannelIndex] = useState(0)
	const channel = CHANNELS[channelIndex]

	const streamUrl = useMemo(
		() => getChannelStreamUrl(CHANNELS[channelIndex]),
		[channelIndex],
	)

	const lockScreenMeta = useMemo(
		() => ({
			title: CHANNELS[channelIndex].name_en,
			artist: CHANNELS[channelIndex].info_en,
			albumTitle: 'Unistar',
		}),
		[channelIndex],
	)

	const { error, isPlaying, radioUiState, toggle } = useRadioPlayer({
		streamUrl,
		lockScreenMeta,
	})

	const surfaceColors = useMemo(
		() => channelGradientColors(channel.color),
		[channel.color],
	)

	const goPrevChannel = useCallback(() => {
		setChannelIndex(i => (i === 0 ? CHANNELS.length - 1 : i - 1))
	}, [])

	const goNextChannel = useCallback(() => {
		setChannelIndex(i => (i === CHANNELS.length - 1 ? 0 : i + 1))
	}, [])

	return (
		<SafeAreaView className='flex-1' edges={['top', 'bottom']}>
			<View className='flex-1 pt-5 px-5'>
				<View className='flex-1 justify-center gap-10'>
					<View className='items-center gap-2'>
						<Text className='text-[11px] font-medium uppercase tracking-widest text-neutral-500 font-mono'>
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
					<View className='items-center gap-1 px-2'>
						<Text
							className='text-center text-3xl leading-tight text-neutral-900 font-mono'
							numberOfLines={2}
						>
							{channel.name_en}
						</Text>
						<Text className='text-center text-base text-neutral-600 font-mono'>
							{channel.info_en}
						</Text>
					</View>
					<Vinyl
						coverUri={channel.placeholder_path}
						glowColor={channelAccentHex(channel.color)}
					/>
					<Text className='px-4 text-center text-sm text-neutral-500 font-mono'>
						Unistar · HLS stream
					</Text>

					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerClassName='gap-4 px-2 items-center'
					>
						{CHANNELS.map((ch, i) => {
							const selected = i === channelIndex
							return (
								<Pressable
									key={ch.id}
									onPress={() => setChannelIndex(i)}
									className='overflow-hidden rounded-3xl active:opacity-90 border-2'
									style={{
										borderColor: selected ? '#fff' : 'transparent',
									}}
								>
									<Image
										source={{ uri: ch.placeholder_path }}
										style={{
											width: 76,
											height: 76,
											borderRadius: 16,
										}}
										contentFit='cover'
									/>
								</Pressable>
							)
						})}
					</ScrollView>
				</View>

				{error ? (
					<Text className='mb-2 text-center text-sm text-red-600'>{error}</Text>
				) : null}

				<PlayerControls
					isPlaying={isPlaying}
					onToggle={toggle}
					onPrev={goPrevChannel}
					onNext={goNextChannel}
					accentColor={channelAccentHex(channel.color)}
				/>
			</View>
		</SafeAreaView>
	)
}
