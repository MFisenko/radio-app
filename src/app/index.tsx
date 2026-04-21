import { Image } from 'expo-image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'
import LivePingDot from '../components/shared/LivePingDot'
import PlayerControls from '../components/shared/PlayerControls'
import Vinyl from '../components/shared/Vinyl'
import {
	DEFAULT_RADIO_CHANNELS,
	type RadioChannel,
	channelAccentHex,
	channelGradientColors,
	getChannelStreamUrl,
} from '../config'
import { crash } from '@react-native-firebase/crashlytics'
import {
	fetchAndActivateRemoteConfig,
	getCrashlytics,
	getRemoteRadioChannels,
	initRemoteConfig,
	trackEvent,
} from '../firebase/config'
import { useRadioPlayer } from '../hooks/useRadioPlayer'
import { ERadioUiState } from '../models/player.model'

const STATUS_LABEL: Record<ERadioUiState, string> = {
	[ERadioUiState.IDLE]: 'READY',
	[ERadioUiState.LIVE_PLAYING]: 'LIVE',
	[ERadioUiState.BUFFER_PLAYING]: 'DELAYED',
	[ERadioUiState.PAUSED]: 'PAUSED',
	[ERadioUiState.STOPPED]: 'OFF',
	[ERadioUiState.RECONNECTING]: 'RECONNECTING',
}

const STATUS_TEXT_CLASS: Record<ERadioUiState, string> = {
	[ERadioUiState.IDLE]: 'text-neutral-400',
	[ERadioUiState.LIVE_PLAYING]: 'text-red-600',
	[ERadioUiState.BUFFER_PLAYING]: 'text-amber-600',
	[ERadioUiState.PAUSED]: 'text-amber-600',
	[ERadioUiState.STOPPED]: 'text-neutral-500',
	[ERadioUiState.RECONNECTING]: 'text-amber-500',
}

const CONFIG_SOURCE_LABEL: Record<'loading' | 'remote' | 'default' | 'static' | 'error', string> = {
	loading: 'Loading config',
	remote: 'Remote Config live',
	default: 'Remote Config default',
	static: 'Bundled fallback',
	error: 'Remote Config error',
}

const CONFIG_SOURCE_CLASS: Record<'loading' | 'remote' | 'default' | 'static' | 'error', string> = {
	loading: 'text-neutral-500',
	remote: 'text-emerald-700',
	default: 'text-amber-700',
	static: 'text-neutral-600',
	error: 'text-red-700',
}

export default function Index() {
	const [channels, setChannels] = useState<RadioChannel[]>(DEFAULT_RADIO_CHANNELS)
	const [channelIndex, setChannelIndex] = useState(0)
	const [configSource, setConfigSource] = useState<
		'loading' | 'remote' | 'default' | 'static' | 'error'
	>('loading')
	const [bootstrapError, setBootstrapError] = useState<string | null>(null)
	const [isFetching, setIsFetching] = useState(false)
	const channel = channels[channelIndex] ?? channels[0]

	// Initialize Firebase services
	useEffect(() => {
		let mounted = true

		async function bootstrap() {
			await initRemoteConfig()
			await fetchAndActivateRemoteConfig()
			if (!mounted) {
				return
			}

			const remoteChannels = getRemoteRadioChannels()
			setChannels(remoteChannels.channels)
			setConfigSource(
				remoteChannels.isValid ? remoteChannels.source : 'error'
			)
			setBootstrapError(
				remoteChannels.isValid
					? null
					: 'Remote Config payload is invalid. Using bundled channels.'
			)
			await trackEvent('app_open')
		}

		bootstrap().catch(error => {
			console.error('Firebase bootstrap error:', error)
			if (!mounted) {
				return
			}

			setConfigSource('error')
			setBootstrapError('Remote Config request failed. Using bundled channels.')
		})

		return () => {
			mounted = false
		}
	}, [])

	useEffect(() => {
		if (channelIndex < channels.length) {
			return
		}

		setChannelIndex(0)
	}, [channelIndex, channels.length])

	const streamUrl = useMemo(
		() => getChannelStreamUrl(channel),
		[channel],
	)

	const lockScreenMeta = useMemo(
		() => ({
			title: channel.name_be,
			artist: channel.info_be,
			albumTitle: 'Unistar',
		}),
		[channel],
	)

	const { error, isPlaying, isReconnecting, radioUiState, toggle } = useRadioPlayer({
		streamUrl,
		lockScreenMeta,
	})

	const surfaceColors = useMemo(
		() => channelGradientColors(channel.color),
		[channel.color],
	)

	const refetchConfig = useCallback(async () => {
		setIsFetching(true)
		setConfigSource('loading')
		try {
			await fetchAndActivateRemoteConfig(true)
			const remoteChannels = getRemoteRadioChannels()
			setChannels(remoteChannels.channels)
			setConfigSource(remoteChannels.isValid ? remoteChannels.source : 'error')
			setBootstrapError(
				remoteChannels.isValid
					? null
					: 'Remote Config payload is invalid. Using bundled channels.'
			)
		} catch {
			setConfigSource('error')
			setBootstrapError('Remote Config request failed. Using bundled channels.')
		} finally {
			setIsFetching(false)
		}
	}, [])

	const goPrevChannel = useCallback(() => {
		setChannelIndex(i => (i === 0 ? channels.length - 1 : i - 1))
	}, [channels.length])

	const goNextChannel = useCallback(() => {
		setChannelIndex(i => (i === channels.length - 1 ? 0 : i + 1))
	}, [channels.length])

	return (
		<SafeAreaView className='flex-1' edges={['top', 'bottom']}>
			<View className='flex-1 pt-5 px-5'>
				<View className='flex-1 justify-center gap-12'>
					<View className='items-center gap-2'>
						<Text className='text-[10px] font-medium uppercase tracking-widest text-neutral-400 font-mono'>
							Config source
						</Text>
						<Text
							className={`text-[11px] font-medium uppercase tracking-widest font-mono ${CONFIG_SOURCE_CLASS[configSource]}`}
						>
							{CONFIG_SOURCE_LABEL[configSource]}
						</Text>
						<Text className='text-[10px] font-medium uppercase tracking-widest text-neutral-400 font-mono'>
							{channels.length} channels loaded
						</Text>
						{__DEV__ && (
							<View className='flex-row gap-2'>
								<Pressable
									onPress={refetchConfig}
									pointerEvents={isFetching ? 'none' : 'auto'}
									className={`px-3 py-1 rounded bg-blue-100 active:opacity-70 ${isFetching ? 'opacity-40' : ''}`}
								>
									<Text className='text-[10px] font-mono text-blue-600 uppercase tracking-widest'>
										{isFetching ? 'Fetching...' : 'Fetch Config'}
									</Text>
								</Pressable>
								<Pressable
									onPress={() => crash(getCrashlytics())}
									className='px-3 py-1 rounded bg-red-100 active:opacity-70'
								>
									<Text className='text-[10px] font-mono text-red-600 uppercase tracking-widest'>
										Test Crash
									</Text>
								</Pressable>
							</View>
						)}
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
							{channel.name_be}
						</Text>
						<Text className='text-center text-base text-neutral-600 font-mono'>
							{channel.info_be}
						</Text>
					</View>
					<Vinyl
						coverUri={channel.placeholder_path}
						glowColor={channelAccentHex(channel.color)}
					/>

					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerClassName='gap-4 px-2 items-center'
					>
						{channels.map((ch, i) => {
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

				{bootstrapError ? (
					<Text className='mb-2 text-center text-sm text-amber-700'>
						{bootstrapError}
					</Text>
				) : null}

				{error ? (
					<Text className='mb-2 text-center text-sm text-red-600'>{error}</Text>
				) : null}

				<PlayerControls
					isPlaying={isPlaying}
					onToggle={toggle}
					onPrev={goPrevChannel}
					onNext={goNextChannel}
					accentColor={channelAccentHex(channel.color)}
					disabled={isReconnecting}
				/>
			</View>
		</SafeAreaView>
	)
}
