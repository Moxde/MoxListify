import React from 'react';
import {View, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import successAnimation from '../assets/Lottie/Successrot.json';
import Colors from '../constant/Colos';

// Erfolgsmeldung Animation für roten Haken
export default function SuccessAnimation() {
  return (
    <View style={styles.container}>
      <LottieView
        source={successAnimation}
        autoPlay
        loop={false}
        style={{width: 150, height: 150}}
        speed={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    width: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primarylight,
    borderRadius: 25,
    borderColor: Colors.textwhite,
    borderWidth: 3,
  },
});
