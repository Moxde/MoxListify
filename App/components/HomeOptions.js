import React, {useRef} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  Dimensions,
} from 'react-native';
import Colors from '../constant/Colos';

const {width} = Dimensions.get('window');

// HomeOptions Component für die Startseite der App
function HomeOptions({text, onPress, textStyle}) {
  const scaleValue = useRef(new Animated.Value(1)).current; // Animate Value für die Skalierung
  const bgColor = useRef(new Animated.Value(0)).current; // Animate Value für die Hintergrundfarbe

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const interpolatedColor = bgColor.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.primary, Colors.primarydark],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{scale: scaleValue}],
          backgroundColor: interpolatedColor,
        },
      ]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={0.9}>
        <Text style={[styles.text, textStyle]}>{text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    height: 70,
    width: width * 0.9,
    maxWidth: 390,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.textwhite,
    borderRadius: 30,
    overflow: 'hidden',
  },
  text: {
    color: Colors.textwhite,
    fontSize: 27,
    textAlign: 'center',
    fontFamily: 'monospace',
    padding: 15,
  },
});

export default HomeOptions;
