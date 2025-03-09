import React from 'react';
import {View, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import successAnimation from '../assets/Lottie/successg.json';
import Colors from '../constant/Colos';

// Erfolgsmeldung Animation für grünen Haken
export default function SuccessAnimationgren() {
  return (
    <View style={styles.container}>
      <LottieView // Animation für grünen Haken
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
