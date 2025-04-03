import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';

import HomeScreen from './screens/HomeScreen';
import RegisterProductScreen from './screens/RegisterProductScreen';
import SearchProductScreen from './screens/SearchProductScreen';
import InventoryScreen from './screens/InventoryScreen';

// Crear stack con los tipos
const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Registrar Producto" component={RegisterProductScreen} />
        <Stack.Screen name="Buscar Producto" component={SearchProductScreen} />
        <Stack.Screen name="Inventario" component={InventoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
