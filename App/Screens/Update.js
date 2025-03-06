import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking, ScrollView, Image } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Colors from '../constant/Colos';
import HomeOptions from '../components/HomeOptions';




function Update() {
    const [appVersion, setAppVersion] = useState('');
    const [latestVersion, setLatestVersion] = useState('');
    const [updateDescription, setUpdateDescription] = useState('');
    const [apkLink, setApkLink] = useState('');
    const [hasSearchedForUpdate, setHasSearchedForUpdate] = useState(false);

    useEffect(() => {
        // Lokale App-Version dynamisch abrufen
        const fetchAppVersion = async () => {
            const version = await DeviceInfo.getVersion(); 
            setAppVersion(version);
        };

        // Online-Version und Release-Link abrufen
        const fetchUpdateInfo = async () => {
            try {
                // GitHub Releases API für neueste Version
                const response = await fetch('https://api.github.com/repos/Moxde/MoxListify/releases/latest');
                const data = await response.json();

                if (data && data.tag_name) {
                    setLatestVersion(data.tag_name); // z.B. v1.0.2
                    setUpdateDescription(data.body); // Update-Beschreibung
                    
                    // Suche nach dem APK-Asset
                    const apkAsset = data.assets.find(asset => asset.name === 'app-release.apk');
                    if (apkAsset) {
                        setApkLink(apkAsset.browser_download_url); 
                    } else {
                        console.error('Kein APK-Asset gefunden');
                    }
                } else {
                    console.error('Keine Version gefunden');
                }
            } catch (error) {
                console.error('Fehler beim Laden der Update-Infos:', error);
            }
        };

        fetchAppVersion();
        fetchUpdateInfo();
    }, []);

    const checkForUpdate = async () => {
        setHasSearchedForUpdate(true); 
        await fetchUpdateInfo(); 
    };

    const handleDownload = async () => {
        try {
            if (apkLink) {
                // Versuche, den Link zu öffnen
                await Linking.openURL(apkLink);
            } else {
                console.error('Kein APK-Link verfügbar');
            }
        } catch (error) {
            console.error('Fehler beim Öffnen des Links:', error);
        }
    };

    
    const buttonText = hasSearchedForUpdate 
        ? (appVersion !== latestVersion ? "Update herunterladen" : "Du hast die neueste Version!")
        : "Nach Updates suchen";

    const buttonAction = hasSearchedForUpdate
        ? (appVersion !== latestVersion ? handleDownload : null)
        : checkForUpdate;

    return (
        <ScrollView style={styles.mainCont}>
            <Text style={styles.versionText}>Aktuelle Version: {appVersion}</Text>
            
            {hasSearchedForUpdate && ( 
                <View style={styles.versioncont}>
                    {appVersion !== latestVersion ? (
                        <>
                            <Text style={styles.versionText1}>Neueste Version: {latestVersion}</Text>
                            <Text style={styles.descText}>{updateDescription}</Text>
                            <Screens/>
                        </>
                        
                    ) : (
                        <Text style={styles.versionText1}>Du hast die neueste Version!</Text> 
                    )}
                </View>
            )}
            <View style={styles.btn}>
                <HomeOptions textStyle={styles.customHomeOption} text={buttonText} onPress={buttonAction} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    mainCont: {
        flex: 1,
        backgroundColor: Colors.backgroundbgrey,
        padding: 20,
    },
    versionText: {
        fontSize: 25,
        color: Colors.textwhite,
        marginBottom: 10,
    },
    versionText1: {
        fontSize: 25,
        color: Colors.textwhite,
        marginBottom: 25,
        marginLeft: 10,
        marginTop: 20,
    },
    descText: {
        fontSize: 19,
        color: Colors.whitedarl,
        marginBottom: 20,
        marginLeft: 20,
    },
    versioncont: {
        backgroundColor: Colors.primarylight,
        borderRadius: 25,
        padding: 20,
    },
    btn: {
        marginTop: 25,
        marginBottom:100
    },
    customHomeOption: {
        fontSize: 20
    },
    contscreen: {
        flexDirection: "row", 
        height: 600,
        width: "100%",
        backgroundColor: Colors.backgroundbgrey,
        borderRadius:25
    },
    screenshot: {
        width: "340",            
        height: 550,           
        margin:25,
        marginHorizontal:0,         
        resizeMode: "contain",
        borderColor:Colors.whitedarl,
        borderWidth:2,
        backgroundColor:Colors.primarydark,
        borderRadius:5
        }
});

export default Update;

const Screenshots = [
    'https://raw.githubusercontent.com/Moxde/MoxListify/1.0.5/App/assets/Screenshots/screen1.png',
    'https://raw.githubusercontent.com/Moxde/MoxListify/1.0.5/App/assets/Screenshots/screen2.png',
    'https://raw.githubusercontent.com/Moxde/MoxListify/1.0.5/App/assets/Screenshots/screen3.png'
];

function Screens (){
    return(
        <View >
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contscreen}>
            {Screenshots.map((image, index) => (
                                    <Image key={index} source={{ uri: image }} style={styles.screenshot} />
                                ))}
            </ScrollView>
        </View>
    )
}