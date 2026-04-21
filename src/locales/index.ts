import en from './en.json'
import ru from './ru.json'

export const translations = {
	en,
	ru,
}

export type Locale = keyof typeof translations
export type TranslationKeys = typeof en

export default translations
