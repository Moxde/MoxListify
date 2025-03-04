// Screens/HomeScreen.js
import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import Colors from "../constant/Colos";
import AppBar from '../components/AppBar';
import HomeOptions from '../components/HomeOptions';
import MainLogo from '../components/MainLogo';



function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={style.cont}>
      <AppBar navigation={navigation}/>
      
      <MainLogo />
      <View style={style.options}>
        <HomeOptions text="Rezept Hinzufügen" onPress={() => navigation.navigate("Recips")} />
        <HomeOptions text="Gespeicherte Rezepte" onPress={() => navigation.navigate("SavedRecips")} />
        <HomeOptions text="Einkaufsliste" onPress={() => navigation.navigate("ShoppingList")} />
        <HomeOptions text="Updates" onPress={() => navigation.navigate("Update")} />
      </View>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  cont: {
    flex: 1,
    backgroundColor: Colors.backgroundbgrey,
  },
  options: {
    alignItems: "center",
    marginTop: 30,
  }
});

export default HomeScreen;
