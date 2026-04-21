import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { cn } from '../../../lib/utils'
import { Locale } from '../../../locales'
import { useLocale } from '../../../providers/LocaleProvider'
import { useTheme } from '../../../providers/ThemeProvider'

export function ChangeLanguage() {
	const { theme } = useTheme()

	const { t, setLocale, locale } = useLocale()
	const [showLanguageMenu, setShowLanguageMenu] = useState(false)

	const handleLanguageChange = async (newLocale: Locale) => {
		await setLocale(newLocale)
		setShowLanguageMenu(false)
	}

	return (
		<View className='relative'>
			<Pressable
				onPress={() => setShowLanguageMenu(!showLanguageMenu)}
				className='mt-4 flex-row items-center gap-2 px-4 py-2 rounded-full bg-background dark:bg-background-dark active:opacity-80'
			>
				<Ionicons
					name='language'
					size={20}
					color={theme === 'dark' ? '#fff' : '#262626'}
				/>
				<Text className='font-medium text-foreground dark:text-foreground-dark'>
					{/* TODO: rewrite this to support more langs dynamically */}
					{locale === 'en' ? t('enums.locales.en') : t('enums.locales.ru')}
				</Text>
				<Ionicons
					className={cn(
						'transition-transform duration-300',
						showLanguageMenu && 'rotate-180',
					)}
					name='chevron-up'
					size={16}
					color={theme === 'dark' ? '#fff' : '#262626'}
				/>
			</Pressable>

			{/* Language Menu */}
			{showLanguageMenu && (
				<View className='absolute top-full inset-x-0 mt-2 bg-white  rounded-2xl overflow-hidden border border-border shadow-lg z-50'>
					{/* TODO: map dynamic languages */}
					<Pressable
						onPress={() => handleLanguageChange('en')}
						className='p-3 flex-row items-center justify-between active:bg-background dark:active:bg-background-dark/70 dark:bg-background-dark bg-background gap-4'
					>
						<Text className='font-medium text-foreground dark:text-foreground-dark'>
							{t('enums.locales.en')}
						</Text>
						{locale === 'en' && (
							<Ionicons
								name='checkmark'
								size={16}
								color={theme === 'dark' ? '#fff' : '#262626'}
							/>
						)}
					</Pressable>

					<View className='h-px bg-border' />

					<Pressable
						onPress={() => handleLanguageChange('ru')}
						className='p-3 flex-row items-center justify-between active:bg-background dark:bg-background-dark dark:active:bg-background-dark/70  bg-background gap-4'
					>
						<Text className='font-medium text-foreground dark:text-foreground-dark'>
							{t('enums.locales.ru')}
						</Text>
						{locale === 'ru' && (
							<Ionicons
								name='checkmark'
								size={16}
								color={theme === 'dark' ? '#fff' : '#262626'}
							/>
						)}
					</Pressable>
				</View>
			)}
		</View>
	)
}
