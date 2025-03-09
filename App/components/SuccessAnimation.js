
import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import successAnimation from '../assets/Lottie/Successfully Done.json';
import Colors from '../constant/Colos';

export default function SuccessAnimation() {
  return (
    <View style={styles.container}>
      <LottieView
        source={successAnimation}
        autoPlay
        loop={false} 
        style={{ width: 150, height: 150 }}
        speed={2.5}
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
    backgroundColor: Colors.whitedarl,
    borderRadius: 10,
    borderColor: Colors.primary,
    borderWidth: 3,
    
  },
});
