import {
	JetBrainsMono_400Regular,
	JetBrainsMono_500Medium,
	JetBrainsMono_700Bold,
	useFonts,
} from '@expo-google-fonts/jetbrains-mono'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { initCrashlytics } from '../firebase/config'
import './globals.css'

void SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
	const [fontsLoaded, fontError] = useFonts({
		JetBrainsMono: JetBrainsMono_400Regular,
		JetBrainsMonoMedium: JetBrainsMono_500Medium,
		JetBrainsMonoBold: JetBrainsMono_700Bold,
	})

	useEffect(() => {
		void initCrashlytics()
	}, [])

	useEffect(() => {
		if (fontsLoaded || fontError) {
			void SplashScreen.hideAsync()
		}
	}, [fontsLoaded, fontError])

	if (!fontsLoaded && !fontError) {
		return null
	}

	return (
		<SafeAreaProvider>
			<View className='flex-1 font-sans'>
				<Stack screenOptions={{ headerShown: false }} />
			</View>
		</SafeAreaProvider>
	)
}
