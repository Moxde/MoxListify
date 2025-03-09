import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Recips from './Screens/Recips';
import SavedRecips from './Screens/SavedRecips';
import ShoppingList from './Screens/ShoppingList';
import Update from './Screens/Update';
import HomeScreen from './Screens/HomeScreen';
import AppBarS from './components/AppBarS';

const Stack = createStackNavigator(); // Stack-Navigator erstellen für Navigation

// Navigation-Container erstellen und Stack-Navigator mit Screens verknüpfen
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Recips"
          component={Recips}
          options={{
            title: 'Rezept Hinzufügen',
            header: () => <AppBarS scName={'Rezept Hinzufügen'} />,
          }}
        />
        <Stack.Screen
          name="SavedRecips"
          component={SavedRecips}
          options={{
            title: 'Gespeicherte Rezepte',
            header: () => <AppBarS scName={'Gespeicherte Rezepte'} />,
          }}
        />
        <Stack.Screen
          name="ShoppingList"
          component={ShoppingList}
          options={{
            title: 'Einkaufsliste',
            header: () => <AppBarS scName={'Einkaufsliste'} />,
          }}
        />
        <Stack.Screen
          name="Update"
          component={Update}
          options={{
            title: 'Updates',
            header: () => <AppBarS scName={'Updates'} />,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
