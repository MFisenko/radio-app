export type RadioStream = { url: string }

export const RADIO_CHANNELS_REMOTE_KEY = 'radio_channels_config'

export type RadioChannel = {
	id: number
	name: string
	name_be: string
	name_en: string
	alt_name: string
	info: string
	info_be: string
	info_en: string
	position: number
	color: string
	public_channel: boolean
	postfix: string
	media_postfix: string
	icon: string
	use_site_media: boolean
	pics_path: string
	hooks_path: string
	placeholder_path: string
	placeholder: string
	available_streams: RadioStream[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function isRadioStream(value: unknown): value is RadioStream {
	return isRecord(value) && typeof value.url === 'string' && value.url.length > 0
}

function isRadioChannel(value: unknown): value is RadioChannel {
	return (
		isRecord(value) &&
		typeof value.id === 'number' &&
		typeof value.name === 'string' &&
		typeof value.name_be === 'string' &&
		typeof value.name_en === 'string' &&
		typeof value.alt_name === 'string' &&
		typeof value.info === 'string' &&
		typeof value.info_be === 'string' &&
		typeof value.info_en === 'string' &&
		typeof value.position === 'number' &&
		typeof value.color === 'string' &&
		typeof value.public_channel === 'boolean' &&
		typeof value.postfix === 'string' &&
		typeof value.media_postfix === 'string' &&
		typeof value.icon === 'string' &&
		typeof value.use_site_media === 'boolean' &&
		typeof value.pics_path === 'string' &&
		typeof value.hooks_path === 'string' &&
		typeof value.placeholder_path === 'string' &&
		typeof value.placeholder === 'string' &&
		Array.isArray(value.available_streams) &&
		value.available_streams.every(isRadioStream)
	)
}

export function sortRadioChannels(channels: RadioChannel[]): RadioChannel[] {
	return [...channels].sort((a, b) => a.position - b.position)
}

export function parseRadioChannelsConfig(value: string): RadioChannel[] | null {
	try {
		const parsed = JSON.parse(value) as unknown
		if (!Array.isArray(parsed) || !parsed.every(isRadioChannel)) {
			return null
		}

		return sortRadioChannels(parsed)
	} catch {
		return null
	}
}

export function getChannelStreamUrl(channel: RadioChannel): string {
	return channel.available_streams[0]?.url ?? ''
}

/** #RRGGBB for RN shadows / vector icons. Strips alpha from Android #AARRGGBB. */
export function channelAccentHex(color: string): string {
	const h = color.trim()
	if (h.length === 9 && h.startsWith('#')) {
		return `#${h.slice(3, 9)}`
	}
	if (h.length === 7 && h.startsWith('#')) {
		return h
	}
	return '#6b21a8'
}

/** Screen background gradient stops from the same `color` as the rest of the UI. */
export function channelGradientColors(color: string): [string, string, string] {
	const hex = channelAccentHex(color)
	const r = Number.parseInt(hex.slice(1, 3), 16)
	const g = Number.parseInt(hex.slice(3, 5), 16)
	const b = Number.parseInt(hex.slice(5, 7), 16)
	return [
		`rgba(${r},${g},${b},0.32)`,
		'#f1f5f9',
		`rgba(${r},${g},${b},0.4)`,
	]
}

export const config: RadioChannel[] = [
	{
		id: 1,
		name: 'Эфир Unistar',
		name_be: 'Эфір Unistar',
		name_en: 'Unistar On-Air',
		alt_name: 'unistar_main',
		info: 'Хит за хитом',
		info_be: 'Хіт за хітом',
		info_en: 'Hit by Hit',
		position: 1,
		color: '#FFcf0068',
		public_channel: true,
		postfix: 'main',
		media_postfix: 'main',
		icon: '',
		use_site_media: true,
		pics_path: 'https://unistar.by/upload/music/photos/',
		hooks_path: 'https://unistar.by/upload/music/mp3/',
		placeholder_path: 'https://unistar.by/app/assets/logo_main.png',
		placeholder:
			'gs://unistar-7e64d.appspot.com/mobile-app-assets/placeholders/logo_main.jpg',
		available_streams: [
			{
				url: 'https://stream.usp.unistar.by/hls/unistar_main/master.m3u8',
			},
		],
	},
	{
		id: 2,
		name: 'Свежие хиты',
		name_be: 'Cвежыя хіты',
		name_en: 'Fresh Hits',
		alt_name: 'unistar_top',
		info: 'Хит-парадная музыка',
		info_be: 'Хіт-парадная музыка',
		info_en: 'Chart Hits',
		position: 2,
		color: '#FF001eca',
		public_channel: true,
		postfix: 'top',
		media_postfix: 'main',
		icon: '',
		use_site_media: true,
		pics_path: 'https://unistar.by/upload/music/photos/',
		hooks_path: 'https://unistar.by/upload/music/mp3/',
		placeholder_path: 'https://unistar.by/app/assets/logo_top.jpg',
		placeholder:
			'gs://unistar-7e64d.appspot.com/mobile-app-assets/placeholders/logo_top.jpg',
		available_streams: [
			{
				url: 'https://stream.usp.unistar.by/hls/unistar_top/master.m3u8',
			},
		],
	},
	{
		id: 3,
		name: 'Офисный канал',
		name_be: 'Офісны канал',
		name_en: 'Office Channel',
		alt_name: 'unistar_office',
		info: 'Спокойная музыка',
		info_be: 'Спакойная музыка',
		info_en: 'Cozy Music',
		position: 3,
		color: '#FF329800',
		public_channel: true,
		postfix: 'office',
		media_postfix: 'main',
		icon: '',
		use_site_media: true,
		pics_path: 'https://unistar.by/upload/music/photos/',
		hooks_path: 'https://unistar.by/upload/music/mp3/',
		placeholder_path: 'https://unistar.by/app/assets/logo_office.jpg',
		placeholder:
			'gs://unistar-7e64d.appspot.com/mobile-app-assets/placeholders/logo_office.jpg',
		available_streams: [
			{
				url: 'https://stream.usp.unistar.by/hls/unistar_office/master.m3u8',
			},
		],
	},
	{
		id: 4,
		name: 'Двухтысячные',
		name_be: 'Двухтысячныя',
		name_en: 'Zeroes',
		alt_name: 'unistar_best',
		info: 'Хиты на все времена',
		info_be: 'Хіты на ўсе часы',
		info_en: 'Forever Hits',
		position: 4,
		color: '#FFff9331',
		public_channel: true,
		postfix: 'best',
		media_postfix: 'main',
		icon: '',
		use_site_media: true,
		pics_path: 'https://unistar.by/upload/music/photos/',
		hooks_path: 'https://unistar.by/upload/music/mp3/',
		placeholder_path: 'https://unistar.by/app/assets/logo_best.jpg',
		placeholder:
			'gs://unistar-7e64d.appspot.com/mobile-app-assets/placeholders/logo_best.jpg',
		available_streams: [
			{
				url: 'https://stream.usp.unistar.by/hls/unistar_best/master.m3u8',
			},
		],
	},
	{
		id: 5,
		name: 'Мой рок-н-ролл',
		name_be: 'Мой рок-н-рол',
		name_en: "My Rock 'n' Roll",
		alt_name: 'unistar_rock',
		info: 'Гитарные хиты',
		info_be: 'Гітарныя хіты',
		info_en: 'Guitar Hits',
		position: 5,
		public_channel: true,
		color: '#FF3d0dbb',
		postfix: 'rock',
		media_postfix: 'main',
		icon: '',
		use_site_media: true,
		pics_path: 'https://unistar.by/upload/music/photos/',
		hooks_path: 'https://unistar.by/upload/music/mp3/',
		placeholder_path: 'https://unistar.by/app/assets/logo_rock.jpg',
		placeholder:
			'gs://unistar-7e64d.appspot.com/mobile-app-assets/placeholders/logo_rock.jpg',
		available_streams: [
			{
				url: 'https://stream.usp.unistar.by/hls/unistar_rock/master.m3u8',
			},
		],
	},
	{
		id: 6,
		name: 'В темпе',
		name_be: 'У тэмпе',
		name_en: 'In Tempo',
		alt_name: 'unistar_fast',
		info: 'Энергичные хиты',
		info_be: 'Энергічныя хіты',
		info_en: 'Energetic Hits',
		position: 6,
		color: '#FFb20000',
		public_channel: true,
		postfix: 'fast',
		media_postfix: 'main',
		icon: '',
		use_site_media: true,
		pics_path: 'https://unistar.by/upload/music/photos/',
		hooks_path: 'https://unistar.by/upload/music/mp3/',
		placeholder_path: 'https://unistar.by/app/assets/logo_tempo.jpg',
		placeholder:
			'gs://unistar-7e64d.appspot.com/mobile-app-assets/placeholders/logo_tempo.jpg',
		available_streams: [
			{
				url: 'https://stream.usp.unistar.by/hls/unistar_fast/master.m3u8',
			},
		],
	},
	{
		id: 7,
		name: 'Каверы',
		name_be: 'Каверы',
		name_en: 'Covers',
		alt_name: 'unistar_covers',
		info: 'Новые версии хитов',
		info_be: 'Новыя версіі хітоў',
		info_en: 'New Versions of Hits',
		position: 7,
		color: '#FF008093',
		public_channel: true,
		postfix: 'covers',
		media_postfix: 'main',
		icon: '',
		use_site_media: true,
		pics_path: 'https://unistar.by/upload/music/photos/',
		hooks_path: 'https://unistar.by/upload/music/mp3/',
		placeholder_path: 'https://unistar.by/app/assets/logo_covers_en.jpg',
		placeholder:
			'gs://unistar-7e64d.appspot.com/mobile-app-assets/placeholders/logo_covers_en.jpg',
		available_streams: [
			{
				url: 'https://stream.usp.unistar.by/hls/unistar_covers/master.m3u8',
			},
		],
	},
	{
		id: 8,
		name: 'Rap-хиты',
		name_be: 'Rap-хіты',
		name_en: 'Rap Hits',
		alt_name: 'unistar_rap',
		info: 'Пульс большого города',
		info_be: 'Пульс вялікага горада',
		info_en: 'Big City Pulse',
		position: 8,
		color: '#FFD1A700',
		public_channel: true,
		postfix: 'rap',
		media_postfix: 'main',
		icon: '',
		use_site_media: true,
		pics_path: 'https://unistar.by/upload/music/photos/',
		hooks_path: 'https://unistar.by/upload/music/mp3/',
		placeholder_path: 'https://unistar.by/app/assets/logo_rap.jpg',
		placeholder:
			'gs://unistar-7e64d.appspot.com/mobile-app-assets/placeholders/logo_rap.jpg',
		available_streams: [
			{
				url: 'https://stream.usp.unistar.by/hls/unistar_rap/master.m3u8',
			},
		],
	},
]

export const DEFAULT_RADIO_CHANNELS = sortRadioChannels(config)
