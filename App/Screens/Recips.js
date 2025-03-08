import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, TextInput, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Colors from '../constant/Colos';
import AlertDialog from '../components/AlertDialog';

function Recips() {
  const [showItemBox, setShowItemBox] = useState(false);
  const [ingredients, setIngredients] = useState([]);

  const addIngredient = (newIngredient) => {
    setIngredients(prev => [...prev, newIngredient]);
  };

  return (
    <View style={style.mainCont}>
      <RecipesAndIngredientDisplay
        setShowItemBox={setShowItemBox}
        ingredients={ingredients}
        setIngredients={setIngredients}
      />
      {showItemBox && (
        <Itembox
          handleClose={() => setShowItemBox(false)}
          onAddIngredient={addIngredient}
        />
      )}
    </View>
  );
}

function RecipesAndIngredientDisplay({ setShowItemBox, ingredients, setIngredients }) {
  const [text, setText] = useState('');
  const [active, setActive] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const textInputRef = useRef(null);

  const handleActivate = () => {
    setActive(true);
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 100);
  };

  const handleSubmit = () => {
    if (text.trim() !== '') {
      setConfirmed(true);
      setActive(false);
    }
  };

  const handleClear = () => {
    setText('');
    setConfirmed(false);
    setActive(false);
  };

  return (
    <View style={style.displaycont}>
      <View style={[style.reciepDisplayCont, confirmed && { backgroundColor: Colors.transpertblc }]}>
        <TextInput
          ref={textInputRef}
          style={style.reciepName}
          placeholder="Name des Rezepts eintragen:"
          placeholderTextColor={Colors.whitedarl}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
          editable={active}
        />
        {confirmed ? (
          <TouchableOpacity style={style.btncont} onPress={handleClear}>
            <Image source={require('../assets/img/x1btn.png')} style={style.btn} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={style.btncontg} onPress={handleActivate}>
            <Image source={require('../assets/img/addbtn.png')} style={style.btn} />
          </TouchableOpacity>
        )}
      </View>
      <View style={style.ingredienDisplayCont}>
        <Text style={style.ingredienText}>Zutaten:</Text>
      <FlatList
        data={ingredients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={style.ingredientItemContainer}>
            <Text style={style.ingredientItemText}>
              {item.ingredient} 
            </Text>
            <Text style={style.ingredientItemText}>
            {item.quantity} {item.unit}
            </Text>
            <TouchableOpacity
              style={style.ingredientItemBtnCont}
              onPress={() => setIngredients(prev => prev.filter(i => i.id !== item.id))}
            >
              <Image source={require('../assets/img/x1btn.png')} style={style.ingredientItemBtn} />
            </TouchableOpacity>
          </View>
        )}
        style={style.ingredientList}
      />
      
        <TouchableOpacity style={style.ingredienAdd} onPress={() => setShowItemBox(true)}>
          <Image source={require('../assets/img/addbtn.png')} style={style.ingredienAddbtn} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Itembox({ handleClose, onAddIngredient }) {
  const [ingredientName, setIngredientName] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [quantity, setQuantity] = useState('');

  const handleAdd = () => {
    if (!ingredientName.trim() || !quantity.trim() || !selectedUnit) {
      setShowAlertDialog(true);
      return;
    }
    const newIngredient = {
      id: Date.now().toString(),
      ingredient: ingredientName.trim(),
      quantity: quantity.trim(),
      unit: selectedUnit,
    };
    onAddIngredient(newIngredient);
    setIngredientName('');
    setQuantity('');
    setSelectedUnit('');
  };

  return (
    <View style={style.itembox}>
      <View style={style.itemboxcont}>
        <TouchableOpacity style={style.closeContBtn} onPress={handleClose}>
          <Text style={style.closeContText}>X</Text>
        </TouchableOpacity>
        <View style={style.itemboxcontInput}>
          <TextInput
            style={style.itemboxname}
            placeholder="Zutat eintragen:"
            placeholderTextColor={Colors.whitedarl}
            value={ingredientName}
            onChangeText={setIngredientName}
          />
         
        </View>
        <View style={style.itemboxcontInputrow}>
          <TextInput
            style={style.itemboxnamed}
            placeholder="Menge"
            placeholderTextColor={Colors.whitedarl}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            onSubmitEditing={handleAdd}
        />
          <View style={style.inputUnitContainer}>
            <Picker
              selectedValue={selectedUnit}
              style={style.inputUnit}
              onValueChange={(itemValue) => setSelectedUnit(itemValue)}
            >
              <Picker.Item label="" value="" />
              <Picker.Item label="Kilogramm" value="KG" />
              <Picker.Item label="Gramm" value="G" />
              <Picker.Item label="Milliliter" value="Ml" />
              <Picker.Item label="Liter" value="L" />
              <Picker.Item label="Esslöffel" value="EL" />
              <Picker.Item label="Stück" value="St" />
            </Picker>
          </View>
          </View>
        <View style={style.seph} />
        <TouchableOpacity style={style.itemboxaddbtn} onPress={handleAdd}>
          <Text style={style.itemboxaddtext}>Hinzufügen</Text>
        </TouchableOpacity>
        {showAlertDialog && (
          <AlertDialog
            yesBtn={() => setShowAlertDialog(false)}
            dialogtext="Bitte füllen Sie alle Felder aus!"
          />
        )}
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  mainCont: {
    flex: 1,
    backgroundColor: Colors.backgroundbgrey,
  },
  displaycont: {
    height: "60%",
    alignItems: "center",
  },
  reciepDisplayCont: {
    position: "absolute",
    height: "18%",
    width: "94%",
    marginTop: 15,
    borderRadius: 25,
    borderColor: Colors.primary,
    borderWidth: 4,
    backgroundColor: Colors.Primarytransf,
  },
  reciepName: {
    fontSize: 19,
    fontWeight: "bold",
    top: 15,
    left: 5,
    color: Colors.textwhite,
    letterSpacing: 1,
  },
  btncont: {
    height: 40,
    width: 40,
    left: "88%",
    top: -29,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: Colors.reddark,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.reddark,
  },
  btncontg: {
    height: 40,
    width: 40,
    left: "88%",
    top: -29,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: Colors.greencheck,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.greencheck,
  },
  btn: {
    width: 30,
    height: 30,
    tintColor: Colors.whitedarl,
  },
  ingredienDisplayCont: {
    position: "absolute",
    minHeight: "99%",
    maxHeight: "100%",
    width: "94%",
    marginTop: 40,
    borderRadius: 25,
    borderColor: Colors.primary,
    borderWidth: 4,
    backgroundColor: Colors.Primarytransf,
    top: 70,
    alignItems: "center",
  },
  ingredienText: {
    fontSize: 27,
    fontWeight: "bold",
    top: 10,
    left: 15,
    color: Colors.whitedarl,
    letterSpacing: 3,
  },
  ingredienAdd: {
    position: "absolute",
    width: 70,
    height: 45,
    bottom: "3%",
    backgroundColor: Colors.greencheck,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  ingredienAddbtn: {
    width: 40,
    height: 40,
    tintColor: Colors.whitedarl,
  },
  ingredientItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    marginHorizontal: 15,
    alignItems: "center",
  },
  ingredientItemText: {
    fontSize: 25,
    
    color: Colors.textwhite,
    letterSpacing: 2,
  },
  ingredientItemBtnCont: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: Colors.reddark,
  },
  ingredientItemBtn: {
    width: 25,
    height: 25,
    tintColor: Colors.whitedarl,
  },
  ingredientList: {
    width: "95%",
    marginBottom: "17%",
    marginTop: "3%",
    borderRadius: 20,
    borderColor: Colors.bblack,
    borderWidth: 2,
    borderStyle: "dashed",
  },
  displaycont: {
    height: "60%",
    alignItems: "center",
  },
  ingredienList: {
    
  },
  closeContBtn: {
    position: "absolute",
    left: "86%",
    top: 9,
    backgroundColor: Colors.reddark,
    height: 30,
    width: 30,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeContText: {
    fontSize: 20,
    textAlign: "center",
    color: Colors.whitedarl,
  },
  itembox: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: Colors.transpertblc,
    alignItems: "center",
    justifyContent: "center",
  },
  itemboxcont: {
    width: "85%",
    height: "37%",
    backgroundColor: Colors.primary,
    top: "-25%",
    borderRadius: 25,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    alignItems: "center",
  },
  itemboxcontInput: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    
    
  },
  itemboxname: {
    fontSize: 18,
    borderRadius: 25,
    height: 60,
    width: "60%",
    color: Colors.textwhite,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    backgroundColor: Colors.primarydark,
    paddingLeft: 15,
    marginRight: 10,
    textAlign:"center"
  },
  itemboxnamed: {
    fontSize: 18,
    borderRadius: 25,
    height: 60,
    width: "25%",
    color: Colors.textwhite,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    backgroundColor: Colors.primarydark,
    top:15,
    marginRight:10,
    textAlign:"center"
  },
  inputUnitContainer: {
    backgroundColor: Colors.primarydark,
    height: 60,
    width: "40%",
    borderRadius: 25,
    marginHorizontal: 1,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    marginTop:15,

  },
  itemboxcontInputrow :{
    flexDirection:"row",
    justifyContent:"space-between",
    marginHorizontal:-20

  },
  inputUnit: {
    fontSize: 15,
  },
  seph: {
    width: "95%",
    height: 2,
    backgroundColor: Colors.whitedarl,
    marginTop: 20,
  },
  itemboxaddbtn: {
    height: 45,
    width: 150,
    backgroundColor: Colors.greencheck,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  itemboxaddtext: {
    fontSize: 20,
    color: Colors.textwhite,
    textAlign: "center",
  },
});

export default Recips;
