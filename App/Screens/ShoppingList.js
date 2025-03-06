import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Text, 
  TextInput 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Colors from '../constant/Colos';
import Searchcont from '../components/Searchcont';
import { open } from 'react-native-quick-sqlite';

const db = open({
  name: 'shopping.db',
  location: 'default'
});

function ShoppingList() {
  const [database, setDatabase] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [checkOn, setCheckOn] = useState(false);
  const [deleteOn, setDeleteOn] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  useEffect(() => {
    
    db.execute(
      'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, amount REAL);'
    );
    
    const result = db.execute("PRAGMA table_info(items)");
    const columns = result.rows._array;
    const unitExists = columns.some(col => col.name === 'unit');
    if (!unitExists) {
      try {
        db.execute("ALTER TABLE items ADD COLUMN unit TEXT DEFAULT 'KG'");
      } catch (error) {
        Alert.alert("Migration Fehler", "Konnte die Spalte 'unit' nicht hinzufügen.");
      }
    }
    
    const { rows } = db.execute('SELECT * FROM items');
    setDatabase(rows._array);
  }, []);

  const filteredList = useMemo(() =>
    database.filter(item =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    ),
    [database, searchText]
  );

  const loadItems = () => {
    const { rows } = db.execute('SELECT * FROM items');
    setDatabase(rows._array);
  };

  const activateDeletion = () => {
    setCheckOn(true);
    setDeleteOn(true);
  };

  const cancelDeletion = () => {
    setCheckOn(false);
    setDeleteOn(false);
    setCheckedItems([]);
  };

  const deleteSelectedItems = async () => {
    try {
      checkedItems.forEach(id => {
        db.execute('DELETE FROM items WHERE id = ?', [id]);
      });
      loadItems();
      cancelDeletion();
    } catch (error) {
      Alert.alert('Fehler beim Löschen');
    }
  };

  const toggleChecked = (id) => {
    if (editMode) {
      setEditItemId(id);
    } else {
      setCheckedItems(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    }
  };

  return (
    <View style={styles.mainCont}>
      <Searchcont searchText={searchText} setSearchText={setSearchText} />
      <View style={styles.list}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <CardList 
            database={filteredList} 
            checkOn={checkOn || editMode}  
            toggleChecked={toggleChecked} 
            checkedItems={editMode ? [editItemId] : checkedItems} 
            deleteOn={deleteOn}  
          />
        </ScrollView>
      </View>
      <OptionList 
        setDatabase={setDatabase} 
        activateDeletion={activateDeletion} 
        cancelDeletion={cancelDeletion}
        deleteOn={deleteOn} 
        deleteSelectedItems={deleteSelectedItems}
        editMode={editMode}
        setEditMode={setEditMode}
        editItemId={editItemId}
        setEditItemId={setEditItemId}
        database={database}
        setCheckOn={setCheckOn}
        loadItems={loadItems}
      />
    </View>
  );
}

function OptionList({ setDatabase, activateDeletion, cancelDeletion, deleteOn, deleteSelectedItems, editMode, setEditMode, editItemId, setEditItemId, database, setCheckOn, loadItems }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('KG');

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

  const handleAddOrUpdateItem = async () => {
    if (!newItemName || !newItemAmount) {
      Alert.alert('Bitte füllen Sie alle Felder aus!');
      return;
    }

    try {
      if (editMode && editItemId !== null) {
        // Update-Modus: Direkte Aktualisierung ohne Zusammenführen
        db.execute(
          'UPDATE items SET name = ?, amount = ?, unit = ? WHERE id = ?',
          [newItemName, parseFloat(newItemAmount), newItemUnit, editItemId]
        );
      } else {
        // Beim Hinzufügen: Prüfen, ob es bereits einen Eintrag mit gleichem Artikel gibt.
        // Für G und KG werden Einträge zusammengeführt; für EL und St. wird exakt verglichen.
        const existingRecord = database.find(item => 
          item.name.toLowerCase() === newItemName.toLowerCase() && 
          ((newItemUnit === "G" || newItemUnit === "KG") 
            ? (item.unit === "G" || item.unit === "KG")
            : item.unit === newItemUnit)
        );

        if (existingRecord) {
          let updatedAmount;
          let updatedUnit;
          if (newItemUnit === "KG") {
            let newGrams;
            // Wenn der Eingabestring ein Komma enthält, wird nur der Nachkommateil als Gramm interpretiert.
            if (newItemAmount.includes(',')) {
              newGrams = parseInt(newItemAmount.split(',')[1], 10);
            } else {
              newGrams = parseFloat(newItemAmount) * 1000;
            }
            const existingGrams = (existingRecord.unit === "KG" ? existingRecord.amount * 1000 : existingRecord.amount);
            const totalGrams = existingGrams + newGrams;
            updatedUnit = "KG";
            if (totalGrams % 1000 !== 0) {
              updatedAmount = parseFloat((totalGrams / 1000).toFixed(3));
            } else {
              updatedAmount = totalGrams / 1000;
            }
          } else if (newItemUnit === "G") {
            const existingGrams = (existingRecord.unit === "KG" ? existingRecord.amount * 1000 : existingRecord.amount);
            const newGrams = parseFloat(newItemAmount);
            const totalGrams = existingGrams + newGrams;
            if (totalGrams < 1000) {
              updatedUnit = "G";
              updatedAmount = totalGrams;
            } else {
              updatedUnit = "KG";
              if (totalGrams % 1000 !== 0) {
                updatedAmount = parseFloat((totalGrams / 1000).toFixed(3));
              } else {
                updatedAmount = totalGrams / 1000;
              }
            }
          } else {
            // Für EL und St.
            updatedUnit = newItemUnit;
            updatedAmount = existingRecord.amount + parseFloat(newItemAmount);
          }
          db.execute(
            'UPDATE items SET amount = ?, unit = ? WHERE id = ?',
            [updatedAmount, updatedUnit, existingRecord.id]
          );
        } else {
          // Kein bestehender Eintrag – neuen Artikel einfügen.
          let amountInput;
          if (newItemUnit === "KG") {
            amountInput = parseFloat(newItemAmount.replace(',', '.'));
          } else {
            amountInput = parseFloat(newItemAmount);
          }
          db.execute(
            'INSERT INTO items (name, amount, unit) VALUES (?, ?, ?)',
            [newItemName, amountInput, newItemUnit]
          );
        }
      }
      loadItems();
      closeForm();
    } catch (error) {
      Alert.alert('Datenbankfehler');
    }
  };

  const closeForm = () => {
    setIsAdding(false);
    setNewItemName('');
    setNewItemAmount('');
    setNewItemUnit('KG');
    setEditMode(false);
    setEditItemId(null);
  };

  return (
    <View style={styles.optionList}>
      <View style={styles.btns}>
        <TouchableOpacity onPress={() => setIsAdding(true)}>
          <Image source={require('../assets/img/addbtn.png')} style={styles.addbtn} />
        </TouchableOpacity>
        <View style={styles.seph} />
        <TouchableOpacity onPress={activateDeletion}>
          <Image source={require('../assets/img/deletbtn.png')} style={styles.addbtn} />
        </TouchableOpacity>
        <View style={styles.seph} />
        <TouchableOpacity onPress={() => setEditMode(true)}>
          <Image source={require('../assets/img/edit.png')} style={styles.addbtn} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.sepv} />
      {deleteOn && (
        <View style={styles.mainDel}>
          <TouchableOpacity style={styles.deletbb} onPress={deleteSelectedItems}>
            <Text style={styles.cancelDeltext}>Löschen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dondel} onPress={cancelDeletion}>
            <Text style={styles.cancelDeltext}>Abbrechen</Text>
          </TouchableOpacity>
        </View>
      )}
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
                onChangeText={(text) => {
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
                  onValueChange={(itemValue) => setNewItemUnit(itemValue)}
                >
                  <Picker.Item label="KG" value="KG" />
                  <Picker.Item label="G" value="G" />
                  <Picker.Item label="EL" value="EL" />
                  <Picker.Item label="St." value="St" />
                </Picker>
              </View>
            </View>
            <TouchableOpacity style={styles.addItemButton} onPress={handleAddOrUpdateItem}>
              <Text style={styles.addItemText}>{editMode ? 'Aktualisieren' : 'Hinzufügen'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeForm} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function CardList({ database, checkOn, toggleChecked, checkedItems, deleteOn }) {
  const renderedItems = useMemo(() => {
    return database.map(item => (
      <View key={item.id} style={styles.cardCont}>
        {checkOn && 
          <MyBoxCheck 
            id={item.id} 
            toggleChecked={toggleChecked} 
            isChecked={checkedItems.includes(item.id)}
            deleteOn={deleteOn} 
          />
        }
        <Text style={styles.textCard}>{item.name}</Text>
        <Text style={styles.amount}>{item.amount} {item.unit}</Text>
      </View>
    ));
  }, [database, checkOn, checkedItems, deleteOn]);  

  return <View>{renderedItems}</View>;
}

function MyBoxCheck({ id, toggleChecked, isChecked, deleteOn }) {
  return (
    <TouchableOpacity onPress={() => toggleChecked(id)} style={styles.myCheck}>
      {isChecked && (
        <View 
          style={[
            styles.myChecked, 
            deleteOn && { backgroundColor: Colors.reddelet } 
          ]} 
        />
      )}
    </TouchableOpacity>
  );
}

function Deletbox({ deleteSelectedItems, canseldel }) {
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

function EditBox({ canseldel, handleAddOrUpdateItem }) {
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
    flex: 1,
    backgroundColor: Colors.backgroundbgrey,
  },
  optionList: {
    backgroundColor: Colors.primary,
    height: 150,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    borderColor:Colors.primarylight,
    borderWidth: 2,
    bottom:-10
  },
  sepv: {
    backgroundColor: Colors.whitedarl,
    width: 600,
    height: 3,
  },
  seph: {
    backgroundColor: Colors.whitedarl,
    width: 3,
    height: 35,
  },
  addbtn: {
    height: 40,
    width: 40,
  },
  btns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    marginHorizontal: 50,
    
  },
  list: {
    marginHorizontal: 9,
    marginTop: 75,
    height: 565,
    marginBottom: 10,
    borderRadius: 25,
    flex: 1,
  },
  cardCont: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    minHeight: 80,
    borderRadius: 25,
    justifyContent: 'space-between',
    margin: 5,
    paddingLeft: 50,
    borderColor:Colors.primarylight,
    borderWidth: 2,

  },
  textCard: {
    color: Colors.textwhite,
    fontFamily: 'monospace',
    fontSize: 20,
    top: 20,
    left: 20,
  },
  amount: {
    color: Colors.textwhite,
    top: 20,
    right: 20,
    fontSize: 25,
    fontFamily: 'monospace',
  },
  input: {
    height: 70,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: 300,
    fontFamily: 'monospace',
    fontSize: 16,
    color: Colors.textwhite,
  },
  amountUnitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  inputAmount: {
    height: 70,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '48%',
    fontFamily: 'monospace',
    fontSize: 16,
    color: Colors.textwhite,
  },
  inputUnitContainer: {
    height: 70,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '48%',
    justifyContent: 'center',
  },
  inputUnit: {
    height: 70,
    color: Colors.textwhite,
  },
  addItemButton: {
    backgroundColor: Colors.primarydark,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  addItemText: {
    color: Colors.textwhite,
    fontFamily: 'monospace',
    fontSize: 19,
    fontWeight: 'bold',
  },
  modalContainer: {
    position: 'absolute',
    top: -800,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 12, 12, 0.8)', 
  },
  modalContent: {
    backgroundColor: Colors.primary,
    padding: 60,
    borderRadius: 25,
    width: '90%',
    alignItems: 'center',
    borderColor: Colors.textwhite,
    borderWidth: 2,
  },
  closeButton: {
    position: 'absolute',
    backgroundColor: Colors.primarydark,
    top: 5,
    right: 10,
    padding: 10,
    borderRadius: 100,
    height: 50,
    width: 50,
  },
  closeButtonText: {
    fontSize: 30,
    color: Colors.textwhite,
    fontWeight: 'bold',
    top: -5,
    right: -8
  },
  myCheck: {
    position: "absolute",
    height: 27,
    width: 27,
    backgroundColor: Colors.whitedarl,
    top: 22,
    left: 20,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    borderColor: Colors.textwhite,
    borderWidth: 1
  },
  myChecked: {
    textAlign: "center",
    fontSize: 21,
    width: "100%",
    backgroundColor: Colors.greencheck,
    height: "100%",
    borderRadius: 5,
  },
  mainDel: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.textwhite,
    height: 78,
    width: "100%",
    bottom: 80,
    borderColor: Colors.primary,
    borderTopRightRadius: 35,
    borderTopLeftRadius: 35,
    borderWidth: 5
  },
  deletbb: {
    backgroundColor: Colors.reddelet,
    width: "50%",
    borderTopLeftRadius: 25,
    borderRightWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  dondel: {
    backgroundColor: Colors.bblack,
    width: "50%",
    borderTopRightRadius: 25,
    borderLeftWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelDeltext: {
    color: Colors.textwhite,
    fontFamily: "monospace",
    fontSize: 25,
  },
  edittbb: {
    backgroundColor: Colors.greencheck,
    width: "50%",
    borderTopLeftRadius: 25,
    borderRightWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  }
});

export default ShoppingList;
