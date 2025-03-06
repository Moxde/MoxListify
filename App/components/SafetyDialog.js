import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Colors from '../constant/Colos'

function SafetyDialog ({yesBtnText,saeftyQuestion, yesBtn, noBtn, stylyesbtn }){
    return(
        <View style={styles.safetycont}>
            <View style={styles.cont}>
                <Text style={styles.mainText}>{saeftyQuestion}</Text>
                <View style={styles.seph} />
                <View style={styles.btns}>
                <TouchableOpacity onPress={yesBtn} style={[styles.yesbtn, stylyesbtn]}>
                    <Text style={styles.yesbtnText}>{yesBtnText}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={noBtn} style={styles.cancelbtn}>
                    <Text style={styles.nobtnText}>Abbrechen</Text>
                </TouchableOpacity>
            </View>   
            </View>
            
        </View>
    )
}

const styles = StyleSheet.create({
    safetycont :{
        position:"absolute",
        flex:1,
        backgroundColor:Colors.transpertblc,
        height:"100%",
        width:"100%",
        justifyContent:"center",
        alignItems:"center",

    },
    cont:{
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
    cancelbtn:{
        width:"45%",
        height:60,
        backgroundColor:Colors.bblack,
        marginTop:10,
        alignItems:"center",
        justifyContent:"center",
        marginHorizontal:1,
        borderColor:Colors.whitedarl,
        borderWidth:2,
        borderTopRightRadius:25,
        borderBottomRightRadius:25,
    },
    yesbtn:{
        width:"45%",
        height:60,
        
        marginTop:10,
        alignItems:"center",
        justifyContent:"center",
        marginHorizontal:2,
        borderColor:Colors.whitedarl,
        borderWidth:2,
        borderTopLeftRadius:25,
        borderBottomLeftRadius:25
    },
    yesbtnText:{
        fontSize:20,
        color:Colors.textwhite,
        textAlign:"center",
        
    },
    nobtnText:{
        fontSize:20,
        color:Colors.textwhite,
        textAlign:"center",
        borderRadius:25
    }

})

export default SafetyDialog