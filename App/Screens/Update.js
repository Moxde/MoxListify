import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Linking, ScrollView, Image} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Colors from '../constant/Colos';
import HomeOptions from '../components/HomeOptions';

function Update() {
  const [appVersion, setAppVersion] = useState(''); // State für App-Version
  const [latestVersion, setLatestVersion] = useState(''); // State für letzte Version
  const [updateDescription, setUpdateDescription] = useState(''); // State für Update-Beschreibung
  const [apkLink, setApkLink] = useState(''); // State für APK-Link
  const [hasSearchedForUpdate, setHasSearchedForUpdate] = useState(false); // State für Suche nach Update

  useEffect(() => {
    // Lokale App-Version dynamisch abrufen
    const fetchAppVersion = async () => {
      const version = await DeviceInfo.getVersion();
      setAppVersion(version);
    };

    // Update-Infos von GitHub abrufen
    const fetchUpdateInfo = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/repos/Moxde/MoxListify/releases/latest',
        ); // GitHub-Release-API aufrufen
        const data = await response.json();

        if (data && data.tag_name) {
          setLatestVersion(data.tag_name);
          setUpdateDescription(data.body);

          const apkAsset = data.assets.find(
            asset => asset.name === 'app-release.apk',
          ); // APK-Asset finden
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
  // Funktion zum Überprüfen von Updates
  const checkForUpdate = async () => {
    setHasSearchedForUpdate(true);
    await fetchUpdateInfo();
  };
  // Funktion zum Herunterladen von Updates
  const handleDownload = async () => {
    try {
      if (apkLink) {
        await Linking.openURL(apkLink);
      } else {
        console.error('Kein APK-Link verfügbar');
      }
    } catch (error) {
      console.error('Fehler beim Öffnen des Links:', error);
    }
  };
  // Text und Aktion für den Update-Button festlegen
  const buttonText = hasSearchedForUpdate
    ? appVersion !== latestVersion
      ? 'Update herunterladen'
      : 'Du hast die neueste Version!'
    : 'Nach Updates suchen';
  // Aktion für den Update-Button festlegen
  const buttonAction = hasSearchedForUpdate
    ? appVersion !== latestVersion
      ? handleDownload
      : null
    : checkForUpdate;

  return (
    <ScrollView style={styles.mainCont}>
      <Text style={styles.versionText}>Aktuelle Version: {appVersion}</Text>

      {hasSearchedForUpdate && (
        <View style={styles.versioncont}>
          {appVersion !== latestVersion ? (
            <>
              <Text style={styles.versionText1}>
                Neueste Version: {latestVersion}
              </Text>
              <Text style={styles.descText}>{updateDescription}</Text>
              <Screens />
            </>
          ) : (
            <Text style={styles.versionText1}>
              Du hast die neueste Version!
            </Text>
          )}
        </View>
      )}
      <View style={styles.btn}>
        <HomeOptions
          textStyle={styles.customHomeOption}
          text={buttonText}
          onPress={buttonAction}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainCont: {
    // Hauptcontainer-Styling für Update-Screen
    flex: 1,
    backgroundColor: Colors.backgroundbgrey,
    padding: 20,
  },
  versionText: {
    // Versionstext-Styling für App-Version
    fontSize: 23,
    color: Colors.textwhite,
    marginBottom: 10,
    letterSpacing: 1,
  },
  versionText1: {
    // Versionstext-Styling für Update-Status
    fontSize: 25,
    color: Colors.textwhite,
    marginBottom: 25,
    marginLeft: 10,
    marginTop: 20,
  },
  descText: {
    // Update-Beschreibung-Styling
    fontSize: 19,
    color: Colors.whitedarl,
    marginBottom: 20,
    marginLeft: 20,
  },
  versioncont: {
    // Update-Container-Styling
    backgroundColor: Colors.primarylight,
    borderRadius: 25,
    padding: 20,
  },
  btn: {
    // Button-Styling für Update-Button
    marginTop: 25,
    marginBottom: 100,
  },
  customHomeOption: {
    // Button-Text-Styling für Update-Button
    fontSize: 20,
  },
  contscreen: {
    // Scrollview-Styling für Screenshots
    flexDirection: 'row',
    height: 600,
    width: '100%',
    backgroundColor: Colors.backgroundbgrey,
    borderRadius: 25,
  },
  screenshot: {
    // Screenshot-Styling für Screenshots
    width: '340',
    height: 550,
    margin: 25,
    marginHorizontal: 0,
    resizeMode: 'contain',
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    backgroundColor: Colors.primarydark,
    borderRadius: 5,
  },
});

export default Update;

// Path: App/components/Screens.js
const Screenshots = [
  'https://raw.githubusercontent.com/Moxde/MoxListify/main/App/assets/Screenshots/screen1.png',
  'https://raw.githubusercontent.com/Moxde/MoxListify/main/App/assets/Screenshots/screen2.png',
  'https://raw.githubusercontent.com/Moxde/MoxListify/main/App/assets/Screenshots/screen3.png',
];

function Screens() {
  return (
    <View>
      {/* Scrollview für Screenshots */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.contscreen}>
        {Screenshots.map((image, index) => (
          <Image key={index} source={{uri: image}} style={styles.screenshot} />
        ))}
      </ScrollView>
    </View>
  );
}
