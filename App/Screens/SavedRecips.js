import React from 'react'
import { View,StyleSheet } from 'react-native'
import Colors from '../constant/Colos'
import Searchcont from '../components/Searchcont'

function SavedRecips (){
    return(
        <View style={style.mainCont}>
            <Searchcont/>
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

export default SavedRecips