import AsyncStorage from '@react-native-async-storage/async-storage'
import { StatusBar } from 'expo-status-bar'
import { colorScheme } from 'nativewind'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { View } from 'react-native'

const STORAGE_KEY = 'radio-app-current-theme'

type ThemeContextType = {
	theme: 'light' | 'dark'
	toggleTheme: () => void
}

// todo: initial theme should be set from the device theme
export const ThemeContext = createContext<ThemeContextType>({
	theme: 'light',
	toggleTheme: () => {},
})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
	const [isLoading, setIsLoading] = useState(true)

	// Initialize theme from storage
	useEffect(() => {
		const loadTheme = async () => {
			try {
				const savedTheme = await AsyncStorage.getItem(STORAGE_KEY)
				if (savedTheme === 'light' || savedTheme === 'dark') {
					setCurrentTheme(savedTheme)
					colorScheme.set(savedTheme)
				}
			} catch (error) {
				console.error('Failed to load theme:', error)
			} finally {
				setIsLoading(false)
			}
		}

		loadTheme()
	}, [])

	useEffect(() => {
		if (!isLoading) {
			colorScheme.set(currentTheme)
		}
	}, [currentTheme, isLoading])

	const toggleTheme = async () => {
		const newTheme = currentTheme === 'light' ? 'dark' : 'light'
		setCurrentTheme(newTheme)
		colorScheme.set(newTheme)
		try {
			await AsyncStorage.setItem(STORAGE_KEY, newTheme)
		} catch (error) {
			console.error('Failed to save theme:', error)
		}
	}

	if (isLoading) {
		return null
	}

	return (
		<ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
			<StatusBar style={currentTheme === 'dark' ? 'light' : 'dark'} />
			<View className='flex-1 bg-background dark:bg-background-dark'>
				{children}
			</View>
		</ThemeContext.Provider>
	)
}

export const useTheme = () => {
	const context = useContext(ThemeContext)
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
