import React from 'react';
import {Image, View, StyleSheet} from 'react-native';

import Colors from '../constant/Colos';

// Appbar für die Hauptseite der App
function AppBar() {
  return (
    <View style={style.cont}>
      <Image source={require('../assets/img/logo1.png')} style={style.img} />
    </View>
  );
}

const style = StyleSheet.create({
  cont: {
    backgroundColor: Colors.primary,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
  },
  img: {
    marginTop: 50,
    height: 200,
    width: 200,
    resizeMode: 'contain',
  },
});

export default AppBar;
