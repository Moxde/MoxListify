import React from 'react'
import { View,StyleSheet } from 'react-native'
import Colors from '../constant/Colos'


function Recips (){
    return(
        <View style={style.mainCont}>
         <Searchcont/>   
        </View>
    )
}

const style = StyleSheet.create ({

    mainCont:{
        flex:1,
        backgroundColor:Colors.backgroundbgrey
    }
})

export default Recips