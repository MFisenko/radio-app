import { getApp } from '@react-native-firebase/app'
import {
	getAnalytics as rnGetAnalytics,
	logEvent,
} from '@react-native-firebase/analytics'
import {
	getCrashlytics as rnGetCrashlytics,
	setCrashlyticsCollectionEnabled,
	log as crashlyticsLog,
	recordError,
} from '@react-native-firebase/crashlytics'
import {
	getRemoteConfig as rnGetRemoteConfig,
	setDefaults,
	fetch,
	activate,
	fetchAndActivate,
	getValue,
	onConfigUpdate,
} from '@react-native-firebase/remote-config'
import {
	DEFAULT_RADIO_CHANNELS,
	RADIO_CHANNELS_REMOTE_KEY,
	parseRadioChannelsConfig,
	type RadioChannel,
} from '../config'

// Firebase default app auto-initializes natively from
// GoogleService-Info.plist / google-services.json

// Analytics instance
export const getAnalytics = () => {
	return rnGetAnalytics(getApp())
}

// Optional helper for logging analytics events
export const trackEvent = async (
	name: string,
	params?: Record<string, unknown>
) => {
	await logEvent(getAnalytics(), name, params)
}

// Enable Crashlytics collection
export const initCrashlytics = async () => {
	const instance = rnGetCrashlytics()
	await setCrashlyticsCollectionEnabled(instance, true)
	return instance
}

// Crashlytics instance
export const getCrashlytics = () => {
	return rnGetCrashlytics()
}

// Optional helpers for Crashlytics
export const logCrashMessage = (message: string) => {
	crashlyticsLog(getCrashlytics(), message)
}

export const reportError = (error: unknown) => {
	const err = error instanceof Error ? error : new Error(String(error))
	recordError(getCrashlytics(), err)
}

// Remote Config init with defaults
export const initRemoteConfig = async () => {
	const rc = rnGetRemoteConfig(getApp())

	await setDefaults(rc, {
		[RADIO_CHANNELS_REMOTE_KEY]: JSON.stringify(DEFAULT_RADIO_CHANNELS),
	})

	return rc
}

// Remote Config instance
export const getRemoteConfig = () => {
	return rnGetRemoteConfig(getApp())
}

// Fetch + activate Remote Config
export const fetchAndActivateRemoteConfig = async () => {
	try {
		const rc = getRemoteConfig()
		await fetchAndActivate(rc)
	} catch (error) {
		console.error('Remote config fetch error:', error)
	}
}

// Optional: separate fetch and activate if you want more control
export const fetchRemoteConfig = async () => {
	try {
		const rc = getRemoteConfig()
		await fetch(rc)
		await activate(rc)
	} catch (error) {
		console.error('Remote config fetch error:', error)
	}
}

// Optional: read a Remote Config value
export const getRemoteString = (key: string) => {
	return getValue(getRemoteConfig(), key).asString()
}

export const getRemoteBoolean = (key: string) => {
	return getValue(getRemoteConfig(), key).asBoolean()
}

export const getRemoteNumber = (key: string) => {
	return getValue(getRemoteConfig(), key).asNumber()
}

export type RemoteRadioChannelsResult = {
	channels: RadioChannel[]
	source: 'remote' | 'default' | 'static'
	isValid: boolean
}

export const subscribeToRemoteConfigUpdates = (onUpdate: () => void): (() => void) => {
	const rc = getRemoteConfig()
	return onConfigUpdate(rc, {
		next: async () => {
			try {
				await activate(rc)
				onUpdate()
			} catch (error) {
				console.error('Remote config update activation error:', error)
			}
		},
		error: (error) => {
			console.error('Remote config update stream error:', error)
		},
		complete: () => {},
	})
}

export const getRemoteRadioChannels = (): RemoteRadioChannelsResult => {
	const value = getValue(getRemoteConfig(), RADIO_CHANNELS_REMOTE_KEY)
	const channels = parseRadioChannelsConfig(value.asString())

	return {
		channels: channels ?? DEFAULT_RADIO_CHANNELS,
		source: value.getSource(),
		isValid: channels !== null,
	}
}