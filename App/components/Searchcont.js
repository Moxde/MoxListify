import React, {useState, useRef} from 'react';
import {
  Animated,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from 'react-native';
import Colors from '../constant/Colos';

// suche Leiste für Rezepte und Einkaufsliste
function Searchcont({searchText, setSearchText}) {
  const [active, setActive] = useState(false); // state für aktive Suche
  const containerWidth = useRef(new Animated.Value(66)).current; // Animation für Breite der Suche
  const inputOpacity = useRef(new Animated.Value(0)).current; // Animation für Opazität der Suche
  // Funktion für Suche ein-/ausblenden
  const toggleInput = () => {
    if (!active) {
      setActive(true);
      Animated.parallel([
        Animated.timing(containerWidth, {
          toValue: 400,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(inputOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      setActive(false);
      setSearchText('');
      Animated.parallel([
        Animated.timing(containerWidth, {
          toValue: 66,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(inputOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  return (
    <Animated.View style={[styles.searchC, {width: containerWidth}]}>
      <Animated.View style={{flex: 1, opacity: inputOpacity}}>
        <TextInput
          placeholder="Suche..."
          placeholderTextColor={Colors.textwhite}
          style={styles.searchin}
          value={searchText}
          onChangeText={setSearchText}
          editable={active}
        />
      </Animated.View>
      <TouchableOpacity onPress={toggleInput}>
        <Image
          source={require('../assets/img/search.png')}
          style={styles.searchlogo}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  searchC: {
    // Maincontainer für Suche
    position: 'absolute',
    borderColor: Colors.whitedarl,
    borderWidth: 3,
    height: 53,
    marginHorizontal: 15,
    marginVertical: 9,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  searchlogo: {
    // Styling für Suche-Logo
    height: 30,
    width: 30,
  },
  searchin: {
    // Styling für Suchfeld
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textwhite,
    padding: 10,
    letterSpacing: 4,
  },
});

export default Searchcont;
