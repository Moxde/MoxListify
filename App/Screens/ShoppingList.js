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
    // Tabelle erstellen
    db.execute(
      'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, amount INTEGER);'
    );
    
    // Daten laden
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
    <View style={style.mainCont}>
      <Searchcont searchText={searchText} setSearchText={setSearchText} />
      <View style={style.list}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <CardList 
            database={filteredList} 
            checkOn={checkOn || editMode}  
            toggleChecked={toggleChecked} 
            checkedItems={editMode ? [editItemId] : checkedItems} 
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

  useEffect(() => {
    if (editMode && editItemId !== null) {
      const itemToEdit = database.find(item => item.id === editItemId);
      if (itemToEdit) {
        setNewItemName(itemToEdit.name);
        setNewItemAmount(itemToEdit.amount.toString());
        setIsAdding(true);
      }
    }
  }, [editMode, editItemId]);

  const handleAddOrUpdateItem = async () => {
    if (!newItemName || !newItemAmount) {
      Alert.alert('Bitte füllen Sie alle Felder aus!');
      return;
    }

    const amount = parseInt(newItemAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Ungültige Menge');
      return;
    }

    try {
      if (editMode && editItemId !== null) {
        // Update
        db.execute(
          'UPDATE items SET name = ?, amount = ? WHERE id = ?',
          [newItemName, amount, editItemId]
        );
      } else {
        // Insert
        db.execute(
          'INSERT INTO items (name, amount) VALUES (?, ?)',
          [newItemName, amount]
        );
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
    setEditMode(false);
    setEditItemId(null);
  };

  return (
    <View style={style.optionList}>
      <View style={style.btns}>
        <TouchableOpacity onPress={() => setIsAdding(true)}>
          <Image source={require('../assets/img/addbtn.png')} style={style.addbtn} />
        </TouchableOpacity>
        <View style={style.seph} />
        <TouchableOpacity onPress={activateDeletion}>
          <Image source={require('../assets/img/deletbtn.png')} style={style.addbtn} />
        </TouchableOpacity>
        <View style={style.seph} />
        <TouchableOpacity onPress={() => setEditMode(true)}>
          <Image source={require('../assets/img/edit.png')} style={style.addbtn} />
        </TouchableOpacity>
      </View>
      
      <View style={style.sepv} />
      {deleteOn && (
        <View style={style.mainDel}>
          <TouchableOpacity style={style.deletbb} onPress={deleteSelectedItems}>
            <Text style={style.cancelDeltext}>Löschen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.dondel} onPress={cancelDeletion}>
            <Text style={style.cancelDeltext}>Abbrechen</Text>
          </TouchableOpacity>
        </View>
      )}
      {isAdding && (
        <View style={style.modalContainer}>
          <View style={style.modalContent}>
            <TextInput
              style={style.input}
              placeholder="Name des Artikels"
              placeholderTextColor={Colors.textwhite}
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <TextInput
              style={style.input}
              placeholder="Menge"
              placeholderTextColor={Colors.textwhite}
              value={newItemAmount}
              onChangeText={(text) => {
              const numbersOnly = text.replace(/[^0-9]/g, '');
              if (numbersOnly === '0') return;
              setNewItemAmount(numbersOnly);
                }}
              keyboardType="numeric"
              />
            <TouchableOpacity style={style.addItemButton} onPress={handleAddOrUpdateItem}>
              <Text style={style.addItemText}>{editMode ? 'Aktualisieren' : 'Hinzufügen'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeForm} style={style.closeButton}>
              <Text style={style.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}



function CardList({ database, checkOn, toggleChecked, checkedItems }) {
    
    const renderedItems = useMemo(() => {
      return database.map(item => (
        <View key={item.id} style={style.cardCont}>
         
          {checkOn && 
            <MyBoxCheck 
              id={item.id} 
              toggleChecked={toggleChecked} 
              isChecked={checkedItems.includes(item.id)} 
            />
          }
         
          <Text style={style.textCard}>{item.name}</Text>
          
          <Text style={style.amount}>{item.amount}x</Text>
        </View>
      ));
    }, [database, checkOn, checkedItems]);  
  
    
    return <View>{renderedItems}</View>;
  }


function MyBoxCheck({ id, toggleChecked, isChecked }) {
  return (
    <TouchableOpacity onPress={() => toggleChecked(id)} style={style.myCheck}>
      {isChecked && <View style={style.myChecked} />}
    </TouchableOpacity>
  );
}


function Deletbox({ deleteSelectedItems, canseldel }) {
  return (
    <View style={style.mainDel}>
      <TouchableOpacity onPress={deleteSelectedItems} style={style.deletbb}>
        <Text style={style.cancelDeltext}>Löschen</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={canseldel} style={style.dondel}>
        <Text style={style.cancelDeltext}>Abbrechen</Text>
      </TouchableOpacity>
    </View>
  );
}


function EditBox({ canseldel, handleAddOrUpdateItem }) {
    return (
      <View style={style.mainDel}>
        <TouchableOpacity onPress={handleAddOrUpdateItem} style={style.edittbb}>
          <Text style={style.cancelDeltext}>Aktualisieren</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={canseldel} style={style.dondel}>
          <Text style={style.cancelDeltext}>Abbrechen</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  

const style = StyleSheet.create({
    mainCont: {
        flex: 1,
        backgroundColor: Colors.backgroundbgrey,
    },
    optionList: {
        backgroundColor: Colors.primary,
        height: 150,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
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
        paddingLeft:50
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
        borderColor:Colors.textwhite,
        borderWidth: 2,
        
    },
    closeButton: {
        position: 'absolute',
        backgroundColor:Colors.primarydark,
        top:5,
        right: 10,
        padding: 10,
        borderRadius:100,
        height:50,
        width:50,
        
    },
    closeButtonText: {
        fontSize: 30,
        color: Colors.textwhite,
        fontWeight: 'bold',
        top:-5,
        right:-8
    },
    myCheck:{
        position:"absolute",
        height:27,
        width:27,
        backgroundColor:Colors.whitedarl,
        top:22,
        left:20,
        borderRadius:5,
        justifyContent:"center",
        alignItems:"center",
        borderColor:Colors.textwhite,
        borderWidth:1
        
        
    },
    myChecked:{
        textAlign:"center",
        fontSize:21,
        width:"100%",
        backgroundColor:Colors.greencheck,
        height:"100%",
        borderRadius:5,
        
    },
    mainDel:{
        flexDirection:"row",
        justifyContent:"space-between",
        backgroundColor:Colors.textwhite,
        height:78,
        width:"100%",
        bottom:80,
        borderColor:Colors.primary,
        borderTopRightRadius:35,
        borderTopLeftRadius:35,
        borderWidth:5
    },
    deletbb:{
        backgroundColor:Colors.reddelet,
        width:"50%",
        borderTopLeftRadius:25,
        borderRightWidth:2,
        borderColor:Colors.primary,
        justifyContent:"center",
        alignItems:"center",
    },
    dondel:{
        backgroundColor:Colors.bblack,
        width:"50%",
        borderTopRightRadius:25,
        borderLeftWidth:2,
        borderColor:Colors.primary,
        justifyContent:"center",
        alignItems:"center",
    },
    cancelDeltext:{
        color:Colors.textwhite,
        fontFamily:"monospace",
        fontSize:25,
    },
    edittbb:{
        backgroundColor:Colors.greencheck,
        width:"50%",
        borderTopLeftRadius:25,
        borderRightWidth:2,
        borderColor:Colors.primary,
        justifyContent:"center",
        alignItems:"center",
    }
});

export default ShoppingList;
