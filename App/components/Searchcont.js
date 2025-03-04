import React from 'react'
import { View,TextInput, TouchableOpacity,Image,StyleSheet } from 'react-native';
import Colors from '../constant/Colos';


function Searchcont({ searchText, setSearchText }) {
    return (
      <View style={style.searchC}>
        <TextInput
          placeholder="Suche..."
          placeholderTextColor={Colors.textwhite}
          style={style.searchin}
          value={searchText}
          onChangeText={setSearchText} // Direkt State aktualisieren
        />
        <TouchableOpacity>
          <Image source={require('../assets/img/search.png')} style={style.searchlogo} />
        </TouchableOpacity>
      </View>
    );
  }

  const style = StyleSheet.create ({
    searchC: {
        position: 'absolute',
        borderColor: Colors.whitedarl,
        borderWidth: 3,
        height: 53,
        width: 400,
        marginHorizontal: 15,
        marginVertical: 9,
        borderRadius: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    searchlogo: {
        height: 30,
        width: 30,
        top: 7,
    },
    searchin: {
        fontFamily: 'monospace',
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textwhite,
    },
  })

  export default Searchcont