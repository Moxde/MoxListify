import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  Text,
  TextInput,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Colors from '../constant/Colos';
import Searchcont from '../components/Searchcont';
import SafetyDialog from '../components/SafetyDialog';
import {open} from 'react-native-quick-sqlite';
import AlertDialog from '../components/AlertDialog';
import SuccessAnimation from '../components/SuccessAnimation';

//
const db = open({
  name: 'shopping.db',
  location: 'default',
}); // Datenbank öffnen

function ShoppingList() {
  const [database, setDatabase] = useState([]); // State für Datenbank
  const [searchText, setSearchText] = useState(''); // State für Suchbegriff
  const [checkOn, setCheckOn] = useState(false); // State für Checkbox
  const [deleteOn, setDeleteOn] = useState(false); // State für Delete-Button
  const [checkedItems, setCheckedItems] = useState([]); // State für ausgewählte Items
  const [editMode, setEditMode] = useState(false); // State für Edit-Modus
  const [editItemId, setEditItemId] = useState(null); // State für Edit-Item-ID
  const [showSafetyDialog, setShowSafetyDialog] = useState(false); // State für Safety-Dialog
  const [showAlertDialog, setShowAlertDialog] = useState(false); // State für Alert-Dialog
  const [showSuccess, setShowSuccess] = useState(false); // State für Success-Animation

  // useEffect-Hook für Initialisierung der Datenbank
  useEffect(() => {
    db.execute(
      'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, amount REAL);',
    );
    const result = db.execute('PRAGMA table_info(items)');
    const columns = result.rows._array;
    const unitExists = columns.some(col => col.name === 'unit');
    if (!unitExists) {
      try {
        db.execute("ALTER TABLE items ADD COLUMN unit TEXT DEFAULT 'KG'");
      } catch (error) {
        Alert.alert(
          'Migration Fehler',
          "Konnte die Spalte 'unit' nicht hinzufügen.",
        );
      }
    }
    const {rows} = db.execute('SELECT * FROM items');
    setDatabase(rows._array);
  }, []);
  // useMemo-Hook für gefilterte Liste
  const filteredList = useMemo(
    () =>
      database.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()),
      ),
    [database, searchText],
  );
  // Funktion zum Laden der Items
  const loadItems = () => {
    const {rows} = db.execute('SELECT * FROM items');
    setDatabase(rows._array);
  };
  // Funktion für Checkbox-Event
  const activateDeletion = () => {
    setCheckOn(true);
    setDeleteOn(true);
  };
  // Funktion zum Abbrechen der Löschung
  const cancelDeletion = () => {
    setCheckOn(false);
    setDeleteOn(false);
    setCheckedItems([]);
  };
  // Funktion zum Löschen ausgewählter Items
  const deleteSelectedItems = async () => {
    try {
      checkedItems.forEach(id => {
        db.execute('DELETE FROM items WHERE id = ?', [id]);
      });
      loadItems();
      cancelDeletion();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (error) {
      Alert.alert('Fehler beim Löschen');
    }
  };
  // Funktion zum Aktivieren/Deaktivieren der Checkbox
  const toggleChecked = id => {
    if (editMode) {
      setEditItemId(id);
    } else {
      setCheckedItems(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
      );
    }
  };
  // Funktion zum Bestätigen des Löschens
  const confirmDelete = () => {
    if (checkedItems.length === 0) {
      setShowAlertDialog(true);
    } else {
      setShowSafetyDialog(true);
    }
  };

  return (
    <View style={styles.mainCont}>
      <Searchcont searchText={searchText} setSearchText={setSearchText} />{' '}
      {/* Suchfeld */}
      <View style={styles.list}>
        {' '}
        {/* wenn Liste leer ist  */}
        {database.length === 0 ? (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>Einkaufsliste ist leer.</Text>
          </View>
        ) : (
          <ScrollView keyboardShouldPersistTaps="handled">
            {' '}
            {/* zeigt die Liste dynmaisch an */}
            <CardList
              database={filteredList}
              checkOn={checkOn || editMode}
              toggleChecked={toggleChecked}
              checkedItems={editMode ? [editItemId] : checkedItems}
              deleteOn={deleteOn}
            />
          </ScrollView>
        )}
      </View>
      {/* Optionlist zeigt die Buttons zum löschen / bearbeiten / hinzufügen */}
      <OptionList
        setDatabase={setDatabase}
        activateDeletion={activateDeletion}
        cancelDeletion={cancelDeletion}
        deleteOn={deleteOn}
        deleteSelectedItems={confirmDelete}
        editMode={editMode}
        setEditMode={setEditMode}
        editItemId={editItemId}
        setEditItemId={setEditItemId}
        database={database}
        setCheckOn={setCheckOn}
        loadItems={loadItems}
      />
      {/* SafetyDialog zeigt die Sicherheitsfrage */}
      {showSafetyDialog && (
        <SafetyDialog
          yesBtnText="Löschen"
          saeftyQuestion="Möchten Sie diese Artikel wirklich löschen?"
          yesBtn={() => {
            deleteSelectedItems();
            setShowSafetyDialog(false);
          }}
          noBtn={() => setShowSafetyDialog(false)}
          stylyesbtn={{backgroundColor: Colors.reddelet}}
        />
      )}
      {/* AlertDialog zeigt die Fehlermeldung */}
      {showAlertDialog && (
        <AlertDialog
          yesBtn={() => {
            setShowAlertDialog(false);
          }}
          dialogtext="Sie müssen mindestens 1 Artikel wählen"
        />
      )}
      {/* SuccessAnimation zeigt die Erfolgsmeldung */}
      {showSuccess && (
        <View style={styles.overlay}>
          <SuccessAnimation />
        </View>
      )}
    </View>
  );
}

// OptionList zeigt die Buttons zum löschen / bearbeiten / hinzufügen
function OptionList({
  setDatabase,
  activateDeletion,
  cancelDeletion,
  deleteOn,
  deleteSelectedItems,
  editMode,
  setEditMode,
  editItemId,
  setEditItemId,
  database,
  setCheckOn,
  loadItems,
}) {
  const [isAdding, setIsAdding] = useState(false); // State für Hinzufügen-Formular
  const [newItemName, setNewItemName] = useState(''); // State für neuen Artikel-Namen
  const [newItemAmount, setNewItemAmount] = useState(''); // State für neue Artikel-Menge
  const [newItemUnit, setNewItemUnit] = useState(''); // State für neue Artikel-Einheit
  const [showAlertDialog, setShowAlertDialog] = useState(false); // State für Fehlermeldung
  // useEffect-Hook für Edit-Modus
  useEffect(() => {
    if (editMode && editItemId !== null) {
      const itemToEdit = database.find(item => item.id === editItemId);
      if (itemToEdit) {
        setNewItemName(itemToEdit.name);
        setNewItemAmount(itemToEdit.amount.toString());
        setNewItemUnit(itemToEdit.unit || 'KG');
        setIsAdding(true);
      }
    }
  }, [editMode, editItemId]);
  // funktion zum hinzufügen / aktualisieren eines Artikels
  const handleAddOrUpdateItem = async () => {
    if (!newItemName || !newItemAmount || !newItemUnit) {
      setShowAlertDialog(true);
      return;
    }

    try {
      if (editMode && editItemId !== null) {
        db.execute(
          'UPDATE items SET name = ?, amount = ?, unit = ? WHERE id = ?',
          [
            newItemName,
            parseInputAmount(newItemAmount, newItemUnit),
            newItemUnit,
            editItemId,
          ],
        );
      } else {
        const existingRecord = database.find(
          item =>
            item.name.toLowerCase() === newItemName.toLowerCase() &&
            (newItemUnit === 'G' ||
            newItemUnit === 'KG' ||
            newItemUnit === 'ML' ||
            newItemUnit === 'L'
              ? item.unit === 'G' ||
                item.unit === 'KG' ||
                item.unit === 'ML' ||
                item.unit === 'L'
              : item.unit === newItemUnit),
        );

        if (existingRecord) {
          let updatedAmount, updatedUnit;
          const isWeight = ['KG', 'G'].includes(existingRecord.unit);
          const isVolume = ['L', 'ML'].includes(existingRecord.unit);

          const existingInBase =
            existingRecord.unit === 'KG'
              ? existingRecord.amount * 1000
              : existingRecord.unit === 'L'
              ? existingRecord.amount * 1000
              : existingRecord.amount;

          const newInBase = parseInputToBaseUnits(newItemAmount, newItemUnit);

          const totalBase = existingInBase + newInBase;

          if (totalBase >= 1000 && (isWeight || isVolume)) {
            updatedUnit = isWeight ? 'KG' : 'L';
            updatedAmount = parseFloat((totalBase / 1000).toFixed(3));
          } else {
            updatedUnit = isWeight ? 'G' : 'ML';
            updatedAmount = totalBase;
          }

          db.execute('UPDATE items SET amount = ?, unit = ? WHERE id = ?', [
            updatedAmount,
            updatedUnit,
            existingRecord.id,
          ]);
        } else {
          const amountInput = parseInputAmount(newItemAmount, newItemUnit);
          db.execute(
            'INSERT INTO items (name, amount, unit) VALUES (?, ?, ?)',
            [newItemName, amountInput, newItemUnit],
          );
        }
      }

      loadItems();
      closeForm();
    } catch (error) {
      Alert.alert('Datenbankfehler');
    }
  };
  // Funktion zum Parsen der Eingabe in Basiseinheiten
  const parseInputToBaseUnits = (amount, unit) => {
    if (['KG', 'L'].includes(unit)) {
      if (amount.includes(',')) {
        const [kg, g] = amount.split(',');

        return (
          parseInt(kg || 0) * 1000 +
          parseInt((g || '000').padStart(3, '0').slice(0, 3))
        );
      }
      return parseFloat(amount.replace(',', '.')) * 1000;
    }
    return parseFloat(amount.replace(',', '.'));
  };

  const parseInputAmount = (amount, unit) => {
    const baseUnits = parseInputToBaseUnits(amount, unit);
    return ['KG', 'L'].includes(unit)
      ? parseFloat((baseUnits / 1000).toFixed(3))
      : baseUnits;
  };
  // Funktion zum Schließen des Hinzufügen-Formulars
  const closeForm = () => {
    setIsAdding(false);
    setNewItemName('');
    setNewItemAmount('');
    setNewItemUnit('');
    setEditMode(false);
    setEditItemId(null);
  };

  return (
    <View style={styles.optionList}>
      <View style={styles.btns}>
        <TouchableOpacity onPress={() => setIsAdding(true)}>
          {' '}
          {/* Button zum Hinzufügen */}
          <Image
            source={require('../assets/img/addbtn.png')}
            style={styles.addbtn}
          />
        </TouchableOpacity>
        <View style={styles.seph} /> {/* Separator */}
        <TouchableOpacity onPress={activateDeletion}>
          {' '}
          {/* Button zum Löschen */}
          <Image
            source={require('../assets/img/deletbtn.png')}
            style={styles.addbtn}
          />
        </TouchableOpacity>
        <View style={styles.seph} /> {/* Separator */}
        {/* Button zum Bearbeiten */}
        <TouchableOpacity
          onPress={() => {
            if (editMode) {
              setEditMode(false);
              setEditItemId(null);
            } else {
              setEditMode(true);
            }
          }}>
          <Image
            source={require('../assets/img/edit.png')}
            style={styles.addbtn}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.sepv} /> {/* Separator */}
      {/* Löschen-Button */}
      {deleteOn && (
        <View style={styles.mainDel}>
          <TouchableOpacity
            style={styles.deletbb}
            onPress={deleteSelectedItems}>
            <Text style={styles.cancelDeltext}>Löschen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dondel} onPress={cancelDeletion}>
            <Text style={styles.cancelDeltext}>Abbrechen</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Hinzufügen -Button */}
      {isAdding && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Name des Artikels"
              placeholderTextColor={Colors.textwhite}
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <View style={styles.amountUnitContainer}>
              <TextInput
                style={styles.inputAmount}
                placeholder="Menge"
                placeholderTextColor={Colors.textwhite}
                value={newItemAmount}
                onChangeText={text => {
                  const numbersOnly = text.replace(/[^0-9,\.]/g, '');
                  if (numbersOnly === '0') return;
                  setNewItemAmount(numbersOnly);
                }}
                keyboardType="numeric"
              />
              <View style={styles.inputUnitContainer}>
                <Picker
                  selectedValue={newItemUnit}
                  style={styles.inputUnit}
                  onValueChange={itemValue => setNewItemUnit(itemValue)}>
                  <Picker.Item label="" value="" />
                  <Picker.Item label="Kilogramm" value="KG" />
                  <Picker.Item label="Gramm" value="G" />
                  <Picker.Item label="Milliliter" value="ML" />
                  <Picker.Item label="Liter" value="L" />
                  <Picker.Item label="Esslöffel" value="EL" />
                  <Picker.Item label="Stück" value="St" />
                </Picker>
              </View>
            </View>
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={handleAddOrUpdateItem}>
              <Text style={styles.addItemText}>
                {editMode ? 'Aktualisieren' : 'Hinzufügen'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeForm} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* AlertDialog zeigt die Fehlermeldung */}
      {showAlertDialog && (
        <AlertDialog
          yesBtn={() => setShowAlertDialog(false)}
          dialogtext="Bitte füllen Sie alle Felder aus!"
          styEX={styles.styExx}
        />
      )}
    </View>
  );
}

// CardList zeigt die Liste der Artikel
function CardList({database, checkOn, toggleChecked, checkedItems, deleteOn}) {
  const renderedItems = useMemo(() => {
    return database.map(item => (
      <View key={item.id} style={styles.cardCont}>
        {/* Checkbox */}
        {checkOn && (
          <MyBoxCheck
            id={item.id}
            toggleChecked={toggleChecked}
            isChecked={checkedItems.includes(item.id)}
            deleteOn={deleteOn}
          />
        )}
        <Text style={styles.textCard}>{item.name}</Text> {/* Artikel-Name */}
        <Text style={styles.amount}>
          {' '}
          {/* Artikel-Menge */}
          {item.amount} {item.unit} {/* Artikel-Einheit */}
        </Text>
      </View>
    ));
  }, [database, checkOn, checkedItems, deleteOn]);
  {
    /* Liste der Artikel */
  }
  return <View>{renderedItems}</View>;
}

// MyBoxCheck zeigt die Checkbox
function MyBoxCheck({id, toggleChecked, isChecked, deleteOn}) {
  return (
    <TouchableOpacity onPress={() => toggleChecked(id)} style={styles.myCheck}>
      {isChecked && (
        <View
          style={[
            styles.myChecked,
            deleteOn && {backgroundColor: Colors.reddelet},
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

// deletbox zeigt die Lösch-Buttons
function Deletbox({deleteSelectedItems, canseldel}) {
  return (
    <View style={styles.mainDel}>
      <TouchableOpacity onPress={deleteSelectedItems} style={styles.deletbb}>
        <Text style={styles.cancelDeltext}>Löschen</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={canseldel} style={styles.dondel}>
        <Text style={styles.cancelDeltext}>Abbrechen</Text>
      </TouchableOpacity>
    </View>
  );
}

// EditBox zeigt die Bearbeiten-Buttons
function EditBox({canseldel, handleAddOrUpdateItem}) {
  return (
    <View style={styles.mainDel}>
      <TouchableOpacity onPress={handleAddOrUpdateItem} style={styles.edittbb}>
        <Text style={styles.cancelDeltext}>Aktualisieren</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={canseldel} style={styles.dondel}>
        <Text style={styles.cancelDeltext}>Abbrechen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mainCont: {
    // Hauptcontainer-Styling für ShoppingList-Screen
    flex: 1,
    backgroundColor: Colors.backgroundbgrey,
  },
  optionList: {
    // Optionen-Container-Styling für ShoppingList-Screen
    backgroundColor: Colors.primary,
    height: 150,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    borderColor: Colors.primarylight,
    borderWidth: 2,
    bottom: -10,
  },
  sepv: {
    // Separator-Styling für ShoppingList-Screen
    backgroundColor: Colors.whitedarl,
    width: 600,
    height: 3,
  },
  seph: {
    // Separator-Styling für ShoppingList-Screen
    backgroundColor: Colors.whitedarl,
    width: 3,
    height: 35,
  },
  addbtn: {
    // Hinzufügen-Button-Styling für ShoppingList-Screen
    height: 40,
    width: 40,
  },
  btns: {
    // Button-Styling für ShoppingList-Screen
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    marginHorizontal: 50,
  },
  list: {
    //  Liste-Styling für ShoppingList-Screen
    marginHorizontal: 9,
    marginTop: 75,
    height: 565,
    marginBottom: 10,
    borderRadius: 25,
    flex: 1,
  },
  cardCont: {
    // Card-Styling für CardList
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    minHeight: 80,
    borderRadius: 25,
    justifyContent: 'space-between',
    margin: 5,
    paddingLeft: 50,
    borderColor: Colors.primarylight,
    borderWidth: 2,
  },
  textCard: {
    // Text-Styling für CardList
    color: Colors.textwhite,
    fontFamily: 'monospace',
    fontSize: 20,
    top: 20,
    left: 20,
  },
  amount: {
    // Text-Styling für CardList
    color: Colors.textwhite,
    top: 20,
    right: 20,
    fontSize: 25,
    fontFamily: 'monospace',
  },
  input: {
    // Input-Styling für CardList
    height: 70,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: 300,
    letterSpacing: 1,
    fontSize: 16,
    color: Colors.textwhite,
  },
  amountUnitContainer: {
    // AmountUnitContainer-Styling für OptionList
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  inputAmount: {
    // InputAmount-Styling für OptionList
    height: 70,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '48%',
    letterSpacing: 1,
    fontSize: 16,
    color: Colors.textwhite,
    right: 20,
  },
  inputUnitContainer: {
    // InputUnitContainer-Styling für OptionList
    height: 70,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '65%',
    justifyContent: 'center',
    right: 9,
  },
  inputUnit: {
    // InputUnit-Styling für OptionList
    height: 70,
    color: Colors.textwhite,
  },
  addItemButton: {
    // AddItemButton-Styling für OptionList
    backgroundColor: Colors.greencheck,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  addItemText: {
    // Text-Styling für AddItemButton für OptionList
    color: Colors.textwhite,
    fontFamily: 'monospace',
    fontSize: 19,
    fontWeight: 'bold',
  },
  modalContainer: {
    // Modal-Container-Styling für OptionList
    position: 'absolute',
    top: -900,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
  },
  modalContent: {
    // Modal-Inhalt-Styling für OptionList
    backgroundColor: Colors.primary,
    padding: 60,
    borderRadius: 25,
    width: '90%',
    alignItems: 'center',
    borderColor: Colors.textwhite,
    borderWidth: 2,
  },
  closeButton: {
    // Schließen-Button-Styling für OptionList
    position: 'absolute',
    backgroundColor: Colors.reddark,
    marginTop: 8,
    right: 10,
    padding: 10,
    borderRadius: 25,
    height: 45,
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    // Schließen Button Text-Styling für OptionList
    fontSize: 26,
    color: Colors.textwhite,
    fontWeight: 'bold',
    top: -5,
  },
  myCheck: {
    // MyCheck-Styling für MyBoxCheck
    position: 'absolute',
    height: 27,
    width: 27,
    backgroundColor: Colors.whitedarl,
    top: 22,
    left: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.textwhite,
    borderWidth: 1,
  },
  myChecked: {
    // Checked-Styling für MyBoxCheck
    textAlign: 'center',
    fontSize: 21,
    width: '100%',
    backgroundColor: Colors.greencheck,
    height: '100%',
    borderRadius: 5,
  },
  mainDel: {
    // Main-Delete-Styling für DeleteBox
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.textwhite,
    height: 78,
    width: '100%',
    bottom: 80,
    borderColor: Colors.primary,
    borderTopRightRadius: 35,
    borderTopLeftRadius: 35,
    borderWidth: 5,
  },
  deletbb: {
    // Delete-Button-Styling für DeleteBox
    backgroundColor: Colors.reddelet,
    width: '50%',
    borderTopLeftRadius: 25,
    borderRightWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dondel: {
    // Delete-Button-Styling für DeleteBox
    backgroundColor: Colors.bblack,
    width: '50%',
    borderTopRightRadius: 25,
    borderLeftWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelDeltext: {
    // Text-Styling für DeleteBox
    color: Colors.textwhite,
    fontFamily: 'monospace',
    fontSize: 25,
  },
  edittbb: {
    // Edit-Button-Styling für EditBox
    backgroundColor: Colors.greencheck,
    width: '50%',
    borderTopLeftRadius: 25,
    borderRightWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  styExx: {
    // Styling für AlertDialog
    top: -400,
  },
  overlay: {
    // Overlay-Styling für SuccessAnimation
    position: 'absolute',
    top: -120,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emptyListContainer: {
    // Container-Styling für leere Liste
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 20,
    color: Colors.textwhite,
    fontFamily: 'monospace',
  },
  addReipss: {
    // add recipe button styling
    height: 70,
    width: 250,
    backgroundColor: Colors.greencheck,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 20,
  },
  addReipssText: {
    // Text-Styling für AddReipss
    color: Colors.textwhite,
    fontSize: 20,
    fontFamily: 'monospace',
  },
});

export default ShoppingList;
