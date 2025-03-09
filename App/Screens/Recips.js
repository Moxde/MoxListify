import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Colors from '../constant/Colos';
import AlertDialog from '../components/AlertDialog';
import {open} from 'react-native-quick-sqlite';
import SuccessAnimationgren from '../components/SuccessAnimationgren';

// Datenbank-Verbindung erstellen für Einkaufsliste
const db = open({
  name: 'shopping.db',
  location: 'default',
});

// Rezepte hinzufügen und anzeigen
function Recips() {
  const [showItemBox, setShowItemBox] = useState(false); // State für Itembox
  const [ingredients, setIngredients] = useState([]); // State für Zutaten
  const [recipeName, setRecipeName] = useState(''); // State für Rezeptname
  const [recipeNameConfirmed, setRecipeNameConfirmed] = useState(false); // State für Rezeptname bestätigt
  const [showAlertDialog, setShowAlertDialog] = useState(false); // State für Dialog-Anzeige rot
  const [showSuccessAnimationg, setShowSuccessAnimationg] = useState(false); // State für Dialog-Anzeige grün

  // Datenbank-Tabellen erstellen für Rezepte und Zutaten
  useEffect(() => {
    db.execute(
      'CREATE TABLE IF NOT EXISTS recipes (id TEXT PRIMARY KEY, recipeName TEXT)',
    );
    db.execute(
      'CREATE TABLE IF NOT EXISTS recipeIngredients (id INTEGER PRIMARY KEY AUTOINCREMENT, recipeId TEXT, ingredient TEXT, quantity TEXT, unit TEXT)',
    );
  }, []);

  // Funktion zum Hinzufügen von Rezepten
  const handleAddRecipe = () => {
    if (recipeName.trim() === '' || ingredients.length === 0) {
      setShowAlertDialog(true);
      return;
    }
    const id = Date.now().toString();
    db.execute('INSERT INTO recipes (id, recipeName) VALUES (?, ?)', [
      id,
      recipeName,
    ]);
    ingredients.forEach(ing => {
      db.execute(
        'INSERT INTO recipeIngredients (recipeId, ingredient, quantity, unit) VALUES (?, ?, ?, ?)',
        [id, ing.ingredient, ing.quantity, ing.unit],
      );
    });

    setRecipeName('');
    setRecipeNameConfirmed(false);
    setIngredients([]);
    setShowSuccessAnimationg(true);
    setTimeout(() => setShowSuccessAnimationg(false), 2500);
  };

  return (
    <View style={style.mainCont}>
      {/* Rezepte und Zutaten anzeigen */}
      <RecipesAndIngredientDisplay
        setShowItemBox={setShowItemBox}
        ingredients={ingredients}
        setIngredients={setIngredients}
        recipeName={recipeName}
        setRecipeName={setRecipeName}
        recipeNameConfirmed={recipeNameConfirmed}
        setRecipeNameConfirmed={setRecipeNameConfirmed}
      />
      <TouchableOpacity style={style.addRecips} onPress={handleAddRecipe}>
        {/* Rezept hinzufügen */}
        <Text style={style.addRecipsText}>Rezept hinzufügen</Text>
      </TouchableOpacity>
      {/* Itembox zum Hinzufügen von Zutaten */}
      {showItemBox && (
        <Itembox
          handleClose={() => setShowItemBox(false)}
          onAddIngredient={ing => setIngredients(prev => [...prev, ing])}
        />
      )}
      {/* Dialog-Anzeige für leere Eingaben */}
      {showAlertDialog && (
        <AlertDialog
          yesBtn={() => setShowAlertDialog(false)}
          dialogtext="Bitte füllen Sie den Rezeptnamen aus und fügen Sie mindestens eine Zutat hinzu!"
        />
      )}
      {/* Dialog-Anzeige für erfolgreiche Hinzufügung */}
      {showSuccessAnimationg && (
        <View style={style.overlay}>
          <SuccessAnimationgren />
        </View>
      )}
    </View>
  );
}

// funktion Rezepte hinzufügen und anzeigen
function RecipesAndIngredientDisplay({
  setShowItemBox,
  ingredients,
  setIngredients,
  recipeName,
  setRecipeName,
  recipeNameConfirmed,
  setRecipeNameConfirmed,
}) {
  const [active, setActive] = useState(false); // State für Aktivierung des Rezeptnamens
  const textInputRef = useRef(null); // Referenz für Rezeptnamen Eingabe
  // Funktion zum Aktivieren des Rezeptnamens
  const handleActivate = () => {
    setActive(true);
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 100);
  };
  // Funktion zum Speichern des Rezeptnamens
  const handleSubmit = () => {
    if (recipeName.trim() !== '') {
      setRecipeNameConfirmed(true);
      setActive(false);
    }
  };
  // Funktion zum Löschen des Rezeptnamens
  const handleClear = () => {
    setRecipeName('');
    setRecipeNameConfirmed(false);
    setActive(false);
  };

  return (
    <View style={style.displaycont}>
      <View
        style={[
          style.reciepDisplayCont,
          recipeNameConfirmed && {backgroundColor: Colors.transpertblc},
        ]}>
        <TextInput
          ref={textInputRef}
          style={style.reciepName}
          placeholder="Name des Rezepts eintragen:"
          placeholderTextColor={Colors.whitedarl}
          value={recipeName}
          onChangeText={setRecipeName}
          onSubmitEditing={handleSubmit}
          editable={active}
        />
        {recipeNameConfirmed ? (
          <TouchableOpacity style={style.btncont} onPress={handleClear}>
            <Image
              source={require('../assets/img/x1btn.png')}
              style={style.btn}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={style.btncontg} onPress={handleActivate}>
            <Image
              source={require('../assets/img/addbtn.png')}
              style={style.btn}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={style.ingredienDisplayCont}>
        <Text style={style.ingredienText}>Zutaten:</Text>
        <FlatList
          data={ingredients}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View style={style.ingredientItemContainer}>
              <Text style={style.ingredientItemText}>{item.ingredient}</Text>
              <Text style={style.ingredientItemText}>
                {item.quantity} {item.unit}
              </Text>
              <TouchableOpacity
                style={style.ingredientItemBtnCont}
                onPress={() =>
                  setIngredients(prev => prev.filter(i => i.id !== item.id))
                }>
                <Image
                  source={require('../assets/img/x1btn.png')}
                  style={style.ingredientItemBtn}
                />
              </TouchableOpacity>
            </View>
          )}
          style={style.ingredientList}
        />
        <TouchableOpacity
          style={style.ingredienAdd}
          onPress={() => setShowItemBox(true)}>
          <Image
            source={require('../assets/img/addbtn.png')}
            style={style.ingredienAddbtn}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Funktion zum Hinzufügen von Zutaten
function Itembox({handleClose, onAddIngredient}) {
  const [ingredientName, setIngredientName] = useState(''); // State für Zutatennamen
  const [selectedUnit, setSelectedUnit] = useState(''); // State für Einheiten
  const [showAlertDialog, setShowAlertDialog] = useState(false); // State für Dialogfenster wenn Felder leer sind
  const [quantity, setQuantity] = useState(''); // State für Mengenangabe

  // Funktion zum Hinzufügen von Zutaten
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
            onChangeText={text => {
              let numericText = text.replace(/[^0-9]/g, '');
              numericText = numericText.replace(/^0+/, '');
              setQuantity(numericText);
            }}
            keyboardType="numeric"
            onSubmitEditing={handleAdd}
          />
          <View style={style.inputUnitContainer}>
            <Picker
              selectedValue={selectedUnit}
              style={style.inputUnit}
              onValueChange={itemValue => setSelectedUnit(itemValue)}>
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
    // Hauptcontainer-Styling für Rezepte
    flex: 1,
    backgroundColor: Colors.backgroundbgrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displaycont: {
    // Display-Container-Styling für Rezepte und Zutaten
    height: '60%',
    alignItems: 'center',
  },
  reciepDisplayCont: {
    // Rezept-Display-Container-Styling
    position: 'absolute',
    height: '18%',
    width: '94%',
    marginTop: -30,
    borderRadius: 25,
    borderColor: Colors.primary,
    borderWidth: 4,
    backgroundColor: Colors.Primarytransf,
  },
  reciepName: {
    // Rezept-Name-Styling
    fontSize: 19,
    fontWeight: 'bold',
    top: 15,
    left: 5,
    color: Colors.textwhite,
    letterSpacing: 1,
  },
  btncont: {
    // Button-Container-Styling für Rezeptnamen
    height: 40,
    width: 40,
    left: '88%',
    top: -29,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: Colors.reddark,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.reddark,
  },
  btncontg: {
    // Button-Container-Styling für Zutaten hinzufügen
    height: 40,
    width: 40,
    left: '88%',
    top: -29,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: Colors.greencheck,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.greencheck,
  },
  btn: {
    // Button-Styling für Rezeptnamen
    width: 30,
    height: 30,
    tintColor: Colors.whitedarl,
  },
  ingredienDisplayCont: {
    // Zutaten-Display-Container-Styling
    position: 'absolute',
    minHeight: '99%',
    maxHeight: '100%',
    width: '94%',
    marginTop: -1,
    borderRadius: 25,
    borderColor: Colors.primary,
    borderWidth: 4,
    backgroundColor: Colors.Primarytransf,
    top: 70,
    alignItems: 'center',
  },
  ingredienText: {
    // Zutaten-Text-Styling
    fontSize: 27,
    fontWeight: 'bold',
    top: 10,
    left: 15,
    color: Colors.whitedarl,
    letterSpacing: 3,
  },
  ingredienAdd: {
    // Zutaten-Add-Styling
    position: 'absolute',
    width: 70,
    height: 45,
    bottom: '3%',
    backgroundColor: Colors.greencheck,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredienAddbtn: {
    // Zutaten-Add-Button-Styling
    width: 40,
    height: 40,
    tintColor: Colors.whitedarl,
  },
  ingredientItemContainer: {
    // Zutaten-Item-Container-Styling
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    marginHorizontal: 15,
    alignItems: 'center',
  },
  ingredientItemText: {
    // Zutaten-Item-Text-Styling
    fontSize: 25,
    color: Colors.textwhite,
    letterSpacing: 2,
  },
  ingredientItemBtnCont: {
    // Zutaten-Item-Button-Container-Styling
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.reddark,
  },
  ingredientItemBtn: {
    // Zutaten-Item-Button-Styling
    width: 25,
    height: 25,
    tintColor: Colors.whitedarl,
  },
  ingredientList: {
    // Zutaten-List-Styling
    width: '95%',
    marginBottom: '17%',
    marginTop: '3%',
    borderRadius: 20,
    borderColor: Colors.bblack,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  itembox: {
    // Zutaten-Itembox-Styling für Zutaten hinzufügen
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.transpertblc,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemboxcont: {
    // Zutaten-Itembox-Container-Styling für Zutaten hinzufügen
    width: '85%',
    height: '37%',
    backgroundColor: Colors.primary,
    top: '-25%',
    borderRadius: 25,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    alignItems: 'center',
  },
  itemboxcontInput: {
    // Zutaten-Itembox-Input-Styling für Zutaten hinzufügen
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemboxname: {
    // Zutaten-Itembox-Name-Styling für Zutaten hinzufügen
    fontSize: 18,
    borderRadius: 25,
    height: 60,
    width: '60%',
    color: Colors.textwhite,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    backgroundColor: Colors.primarydark,
    paddingLeft: 15,
    marginRight: 10,
    textAlign: 'center',
  },
  itemboxnamed: {
    // Zutaten-Itembox-Name-Styling für Zutaten hinzufügen
    fontSize: 18,
    borderRadius: 25,
    height: 60,
    width: '25%',
    color: Colors.textwhite,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    backgroundColor: Colors.primarydark,
    top: 15,
    marginRight: 10,
    textAlign: 'center',
  },
  inputUnitContainer: {
    // Zutaten-Itembox-Unit-Styling für Zutaten hinzufügen
    backgroundColor: Colors.primarydark,
    height: 60,
    width: '40%',
    borderRadius: 25,
    marginHorizontal: 1,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    marginTop: 15,
  },
  itemboxcontInputrow: {
    // Zutaten-Itembox-Input-Styling für Zutaten hinzufügen
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -20,
  },
  inputUnit: {
    // Zutaten-Itembox-Unit-Styling für Zutaten hinzufügen
    fontSize: 15,
  },
  seph: {
    // Separator für Zutaten-Itembox-Styling für Zutaten hinzufügen
    width: '95%',
    height: 2,
    backgroundColor: Colors.whitedarl,
    marginTop: 20,
  },
  itemboxaddbtn: {
    // Zutaten-Itembox-Button-Styling für Zutaten hinzufügen
    height: 45,
    width: 150,
    backgroundColor: Colors.greencheck,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  itemboxaddtext: {
    // Zutaten-Itembox-Button-Text-Styling für Zutaten hinzufügen
    fontSize: 20,
    color: Colors.textwhite,
    textAlign: 'center',
  },
  addRecips: {
    // Rezept hinzufügen-Styling für Rezept hinzufügen
    height: 75,
    width: 250,
    backgroundColor: Colors.greencheck,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 90,
  },
  addRecipsText: {
    // Rezept hinzufügen-Text-Styling für Rezept hinzufügen
    fontSize: 20,
    color: Colors.textwhite,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  displaycont: {
    // Display-Styling für Display anzeigen
    height: '60%',
    alignItems: 'center',
  },
  ingredienList: {},
  closeContBtn: {
    // Schließen-Button-Styling für Schließen-Button
    position: 'absolute',
    left: '86%',
    top: 9,
    backgroundColor: Colors.reddark,
    height: 30,
    width: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeContText: {
    // Schließen-Button-Text-Styling für Schließen-Button
    fontSize: 20,
    textAlign: 'center',
    color: Colors.whitedarl,
  },
  overlay: {
    // Overlay-Styling für Animation
    position: 'absolute',
    top: -120,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default Recips;
