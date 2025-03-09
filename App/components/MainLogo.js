import React from 'react';
import {View, StyleSheet, Image, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

// Hauptlogo der App für die Startseite
function MainLogo() {
  return (
    <View>
      <Image
        source={require('../assets/img/mainLogo.png')}
        style={styles.logo}
        accessible={true}
        accessibilityLabel="App Logo"
        accessibilityRole="image"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    height: width * 0.5,
    width: width * 0.8,
    maxWidth: 401,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginVertical: 20,
  },
});

export default MainLogo;
