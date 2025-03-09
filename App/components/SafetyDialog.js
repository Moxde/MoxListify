import React, {useEffect, useRef} from 'react';
import {Animated, View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Colors from '../constant/Colos';

// Safety Dialog Component für die Bestätigung von Aktionen
function SafetyDialog({yesBtnText, saeftyQuestion, yesBtn, noBtn, stylyesbtn}) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Animation für die Skalierung
  const opacityAnim = useRef(new Animated.Value(0)).current; // Animation für die Opazität

  // Startet die Animationen für die Skalierung und Opazität
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.safetycont,
        {opacity: opacityAnim, transform: [{scale: scaleAnim}]},
      ]}>
      <View style={styles.cont}>
        <Text style={styles.mainText}>{saeftyQuestion}</Text>
        <View style={styles.seph} />
        <View style={styles.btns}>
          <TouchableOpacity
            onPress={yesBtn}
            style={[styles.yesbtn, stylyesbtn]}>
            <Text style={styles.yesbtnText}>{yesBtnText}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={noBtn} style={styles.cancelbtn}>
            <Text style={styles.nobtnText}>Abbrechen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safetycont: {
    position: 'absolute',
    flex: 1,
    backgroundColor: Colors.transpertblc,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cont: {
    minHeight: 170,
    width: 350,
    backgroundColor: Colors.primarylight,
    borderRadius: 25,
    bottom: 50,
    borderColor: Colors.textwhite,
    borderWidth: 2,
    alignItems: 'center',
  },
  mainText: {
    fontSize: 18,
    color: Colors.textwhite,
    textAlign: 'center',
    padding: 20,
  },
  seph: {
    height: 3,
    width: '90%',
    backgroundColor: Colors.whitedarl,
    borderRadius: 25,
  },
  btns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 20,
  },
  cancelbtn: {
    width: '45%',
    height: 60,
    backgroundColor: Colors.bblack,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  yesbtn: {
    width: '45%',
    height: 60,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },
  yesbtnText: {
    fontSize: 20,
    color: Colors.textwhite,
    textAlign: 'center',
  },
  nobtnText: {
    fontSize: 20,
    color: Colors.textwhite,
    textAlign: 'center',
    borderRadius: 25,
  },
});

export default SafetyDialog;
