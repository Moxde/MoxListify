import React from 'react'
import { View,StyleSheet } from 'react-native'
import Colors from '../constant/Colos'
import Searchcont from '../components/Searchcont'
import HomeOptions from '../components/HomeOptions'

function SavedRecips (){
    return(
        <View style={style.mainCont}>
            
        </View>
    )
}

const style = StyleSheet.create ({

    mainCont:{
        flex:1,
        backgroundColor:Colors.backgroundbgrey,
        flexDirection:"row"
    }
})

export default SavedRecips