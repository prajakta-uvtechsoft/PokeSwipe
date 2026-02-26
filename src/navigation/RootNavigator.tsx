import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { SwipeScreen } from '../screens/SwipeScreen';
import { LikedScreen } from '../screens/LikedScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Swipe" component={SwipeScreen} />
      <Stack.Screen name="Liked" component={LikedScreen} />
    </Stack.Navigator>
  );
}

