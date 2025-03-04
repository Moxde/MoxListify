import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import Colors from '../constant/Colos';
import HomeOptions from '../components/HomeOptions';

function Update() {
    const [appVersion, setAppVersion] = useState('');
    const [latestVersion, setLatestVersion] = useState('');
    const [updateDescription, setUpdateDescription] = useState('');
    const [hasSearchedForUpdate, setHasSearchedForUpdate] = useState(false); // Neuer Zustand

    useEffect(() => {
        // Lokale App-Version abrufen
        const fetchAppVersion = async () => {
            const version = '1.0.0'; // Hier später die echte Version abrufen
            setAppVersion(version);
        };

        // Online-Version abrufen
        const fetchUpdateInfo = async () => {
            try {
                const response = await fetch('https://raw.githubusercontent.com/Moxde/Shoppinglist/main/update.json');
                const data = await response.json();
                setLatestVersion(data.version);
                setUpdateDescription(data.description);
            } catch (error) {
                console.error('Fehler beim Laden der Update-Infos:', error);
            }
        };

        fetchAppVersion();
        fetchUpdateInfo(); // fetchUpdateInfo beim Initialisieren
    }, []);

    const checkForUpdate = async () => {
        setHasSearchedForUpdate(true); // Setze Zustand, wenn nach Update gesucht wird
        await fetchUpdateInfo(); // Manuell nach Updates suchen
    };

    const handleDownload = async () => {
        try {
            
            const result = await Linking.openURL('https://github.com/Moxde/Shoppinglist/releases/download/v1.0.1/app-release.apk');
            if (!result) {
                console.error('Fehler beim Öffnen des Links');
            }
        } catch (error) {
            console.error('Fehler beim Öffnen des Links:', error);
        }
    };

    return (
        <View style={styles.mainCont}>
            <Text style={styles.versionText}>Aktuelle Version: {appVersion}</Text>
            
            {hasSearchedForUpdate && ( // Version-Info nur anzeigen, wenn nach Update gesucht wurde
                <View style={styles.versioncont}>
                    <Text style={styles.versionText1}>Neueste Version: {latestVersion}</Text>
                    <Text style={styles.descText}>{updateDescription}</Text>
                </View>
            )}

            <HomeOptions text="Nach Updates suchen" onPress={checkForUpdate} />
            {appVersion !== latestVersion && hasSearchedForUpdate && (
                <HomeOptions text="Update herunterladen" onPress={handleDownload} />
            )}
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
});

export default Update;
