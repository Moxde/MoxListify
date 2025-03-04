import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

function Update() {
    const [appVersion, setAppVersion] = useState('');
    const [latestVersion, setLatestVersion] = useState('');
    const [updateDescription, setUpdateDescription] = useState('');

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
        fetchUpdateInfo();
    }, []);

    return (
        <View style={styles.mainCont}>
            <Text style={styles.versionText}>Aktuelle Version: {appVersion}</Text>
            <Text style={styles.versionText}>Neueste Version: {latestVersion}</Text>
            <Text style={styles.descText}>{updateDescription}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    mainCont: {
        flex: 1,
        backgroundColor: '#333',
        padding: 20,
    },
    versionText: {
        fontSize: 20,
        color: '#fff',
        marginBottom: 10,
    },
    descText: {
        fontSize: 16,
        color: '#bbb',
    }
});

export default Update;
