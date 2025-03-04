import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info'; // Importiere die DeviceInfo-Bibliothek
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
            const version = await DeviceInfo.getVersion(); // Holt die aktuelle Version
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
                        setApkLink(apkAsset.browser_download_url); // APK-Download-Link
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
        setHasSearchedForUpdate(true); // Zustand, wenn nach Update gesucht wird
        await fetchUpdateInfo(); // Manuell nach Updates suchen
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

    // Bestimmen des Button-Textes und der Funktionalität
    const buttonText = hasSearchedForUpdate 
        ? (appVersion !== latestVersion ? "Update herunterladen" : "Du hast die neueste Version!")
        : "Nach Updates suchen";

    const buttonAction = hasSearchedForUpdate
        ? (appVersion !== latestVersion ? handleDownload : null)
        : checkForUpdate;

    return (
        <View style={styles.mainCont}>
            <Text style={styles.versionText}>Aktuelle Version: {appVersion}</Text>
            
            {hasSearchedForUpdate && ( 
                <View style={styles.versioncont}>
                    {appVersion !== latestVersion ? (
                        <>
                            <Text style={styles.versionText1}>Neueste Version: {latestVersion}</Text>
                            <Text style={styles.descText}>{updateDescription}</Text>
                        </>
                    ) : (
                        <Text style={styles.versionText1}>Du hast die neueste Version!</Text> 
                    )}
                </View>
            )}
            <View style={styles.btn}>
                <HomeOptions textStyle={styles.customHomeOption} text={buttonText} onPress={buttonAction} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainCont: {
        flex: 1,
        backgroundColor: Colors.backgroundbgrey,
        padding: 20,
    },
    versionText: {
        fontSize: 20,
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
        marginTop: 100
    },
    customHomeOption: {
        fontSize: 25
    }
});

export default Update;
