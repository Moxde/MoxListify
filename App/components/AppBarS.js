import React  from 'react';
import { Image, View, StyleSheet, TouchableOpacity,Text,Pressable} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '../constant/Colos';

function AppBarS({scName}) {
  const navigation = useNavigation(); // Navigation Hook hier aufrufen

 
    return (
      <View style={style.mainCont}>
        <View style={style.cont}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} accessible={true} accessibilityLabel="Zurück zur Startseite">
          <Image source={require('../assets/img/backButton.png')} style={style.backimg} />
          </TouchableOpacity>
          <TouchableOpacity >
           <Image source={require('../assets/img/logo1.png')} style={style.img} />
          </TouchableOpacity>
        </View>
        <View style={style.cont1}>
          <Text style={style.mainText}>
              {scName}
          </Text>
        </View>
      
      </View>
    );
  }



const style = StyleSheet.create({
  cont: {
    backgroundColor: Colors.primary,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: "row",
    
    
  
  },
  img: {
    marginTop: 50,
    height: 200,
    width: 200,
    resizeMode: 'contain',
    
  },
  backimg: {
    position: "absolute",
    height: 60,
    width:60,
    resizeMode: "contain",
    right:40,
    top:5,
  
    
  },
  cont1:{
    backgroundColor:Colors.backgroundbgrey,
    borderBottomColor:Colors.textwhite,
    
    
  },
  mainText:{
    color: Colors.textwhite,
    fontSize:30,
    fontFamily:"monospace",
    backgroundColor:Colors.primary,
    textAlign:"center",
    fontWeight:"bold",
    borderBottomRightRadius:35,
    borderBottomLeftRadius:35,
    paddingBottom:15,
    
    
    },
    
    
});

export default AppBarS