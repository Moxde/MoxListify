import React from 'react'
import { View, Text,StyleSheet,TouchableOpacity } from 'react-native'
import Colors from '../constant/Colos'

function AlertDialog({ yesBtn, dialogtext, styEX }) {
    return (
      <View style={[styles.alertDialog, styEX]}>
        <View style={styles.alertDialogContent}>
          <Text style={styles.mainText}>
            {dialogtext}
          </Text>
          <View style={styles.seph} />
          <View style={styles.btns}>
            <TouchableOpacity onPress={yesBtn} style={styles.yesbtn}>
              <Text style={styles.yesbtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

const styles = StyleSheet.create({
    alertDialog: {
        position:"absolute",
        flex:1,
        backgroundColor:Colors.transpertblc,
        height:"100%",
        width:"100%",
        justifyContent:"center",
        alignItems:"center",
    },
    alertDialogContent:{
        minHeight:170,
        width:350,
        backgroundColor:Colors.primarylight,
        borderRadius:25,
        bottom:50,
        borderColor:Colors.textwhite,
        borderWidth:2,
        alignItems:"center"
    },
    mainText:{
        fontSize:18,
        color:Colors.textwhite,
        textAlign:"center",
        padding:20,
        fontFamily:"monospace"
    },
    seph:{
        height:3,
        width:"90%",
        backgroundColor:Colors.whitedarl,
        borderRadius:25,
        
    },
    btns:{
        flexDirection:"row",
        justifyContent:"space-between",
        marginHorizontal:10,
        marginVertical:20
    },
    yesbtn:{
        width:"45%",
        height:60,
        backgroundColor:Colors.bblack,
        marginTop:10,
        alignItems:"center",
        justifyContent:"center",
        marginHorizontal:2,
        borderColor:Colors.whitedarl,
        borderWidth:2,
        borderRadius:25,
       
    },
    yesbtnText:{
        fontSize:20,
        color:Colors.textwhite,
        textAlign:"center",
        letterSpacing:1
        
        
    }
})

export default AlertDialog