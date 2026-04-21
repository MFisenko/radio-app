import AsyncStorage from '@react-native-async-storage/async-storage'
import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from 'react'
import { getDeviceLocale, i18n } from '../lib/i18n'
import type { Locale } from '../locales'

type LocaleContextType = {
	locale: Locale
	setLocale: (locale: Locale) => Promise<void>
	t: (key: string, params?: Record<string, string>) => string
}

const STORAGE_KEY = 'radio-app-current-locale'

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>('en')
	const [isLoading, setIsLoading] = useState(true)

	// Initialize locale from storage or device
	useEffect(() => {
		const initLocale = async () => {
			try {
				// Try to get saved locale from storage
				const savedLocale = await AsyncStorage.getItem(STORAGE_KEY)

				if (savedLocale && ['en', 'uk'].includes(savedLocale)) {
					setLocaleState(savedLocale as Locale)
					i18n.locale = savedLocale
				} else {
					// Use device locale
					const initialLocale = getDeviceLocale()
					setLocaleState(initialLocale)
					i18n.locale = initialLocale
					await AsyncStorage.setItem(STORAGE_KEY, initialLocale)
				}
			} catch (error) {
				console.error('Failed to load locale:', error)
				setLocaleState('en')
				i18n.locale = 'en'
			} finally {
				setIsLoading(false)
			}
		}

		initLocale()
	}, [])

	const setLocale = async (newLocale: Locale) => {
		try {
			setLocaleState(newLocale)
			i18n.locale = newLocale
			await AsyncStorage.setItem(STORAGE_KEY, newLocale)
		} catch (error) {
			console.error('Failed to save locale:', error)
		}
	}

	const t = (key: string, params?: Record<string, string>) => {
		return i18n.t(key, params)
	}

	if (isLoading) {
		// TODO: Add a loading spinner
		return null
	}

	return (
		<LocaleContext.Provider value={{ locale, setLocale, t }}>
			{children}
		</LocaleContext.Provider>
	)
}

export function useLocale() {
	const context = useContext(LocaleContext)
	if (!context) {
		throw new Error('useLocale must be used within LocaleProvider')
	}
	return context
}
