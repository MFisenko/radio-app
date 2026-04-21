import { getLocales } from 'expo-localization'
import { I18n } from 'i18n-js'
import translations, { type Locale } from '../locales'

const FALLBACK_LANGUAGE = 'en' as Locale
/**
 * Get device locale with fallback to 'en'
 */
export function getDeviceLocale(): Locale {
	const deviceLanguage = getLocales()[0]?.languageCode ?? FALLBACK_LANGUAGE
	return (
		['en', 'ru'].includes(deviceLanguage) ? deviceLanguage : FALLBACK_LANGUAGE
	) as Locale
}

export const i18n = new I18n(translations)

// Set initial locale
i18n.locale = getDeviceLocale()
i18n.enableFallback = true
i18n.defaultLocale = 'en'
// i18n.locales = locales // FIXME: fix this add locales arr

export default i18n
