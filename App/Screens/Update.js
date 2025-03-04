import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import Colors from '../constant/Colos'

function Update() {
    const [appVersion, setAppVersion] = useState('')

    useEffect(() => {
        // Hole die aktuelle App-Version
        const fetchAppVersion = async () => {
            const version = await DeviceInfo.getVersion()
            setAppVersion(version)
        }

        fetchAppVersion()
    }, [])

    return (
        <View style={style.mainCont}>
            <Text style={style.versionText}>Aktuelle Version: {appVersion}</Text>
        </View>
    )
}

const style = StyleSheet.create({
    mainCont: {
        flex: 1,
        backgroundColor: Colors.backgroundbgrey,
        
    },
    versionText: {
        fontSize: 25,
        color: Colors.textwhite,
        marginTop:"5%",
        marginLeft:"5%",
    }
})

export default Update
