import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
  Keyboard,
} from 'react-native';
import Colors from '../constant/Colos';
import Searchcont from '../components/Searchcont';
import SafetyDialog from '../components/SafetyDialog';
import AlertDialog from '../components/AlertDialog';
import {open} from 'react-native-quick-sqlite';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import SuccessAnimation from '../components/SuccessAnimation';
import SuccessAnimationgren from '../components/SuccessAnimationgren';
import {Picker} from '@react-native-picker/picker';

// Datenbankverbindung herstellen und Instanz speichern (global)
const db = open({
  name: 'shopping.db',
  location: 'default',
});

// funktion für die gespeicherte Rezepte anzeigen und löschen
function SavedRecips() {
  const [recipeList, setRecipeList] = useState([]); // state für die Rezepte
  const [searchText, setSearchText] = useState(''); // state für die Suche
  const [deleteMode, setDeleteMode] = useState(false); // state für das Löschen
  const [addMode, setAddMode] = useState(false); // state für das Hinzufügen
  const [selectedItems, setSelectedItems] = useState([]); // state für die ausgewählten Rezepte
  const [showSafetyDialog, setShowSafetyDialog] = useState(false); // state für das Sicherheitsdialog
  const [showAlertDialog, setShowAlertDialog] = useState(false); // state für das AlertDialog
  const [alertDialogMessage, setAlertDialogMessage] = useState(''); // dynamische Fehlermeldung für den AlertDialog
  const navigation = useNavigation(); // Navigation
  const isFocused = useIsFocused(); // state für den Fokus
  const [showSuccess, setShowSuccess] = useState(false); // state für die Erfolgsanimation
  const [showSuccessgreen, setShowSuccessgreen] = useState(false); // state für die Erfolgsanimation grün
  const [isEditing, setIsEditing] = useState(false); // state für das Bearbeiten
  const [editableRecipeName, setEditableRecipeName] = useState(''); // state für den editierbaren Rezeptname
  const [editableIngredients, setEditableIngredients] = useState([]); // state für die editierbaren Zutaten
  const [newIngredientName, setNewIngredientName] = useState(''); // state für den neuen Zutatenname
  const [newIngredientQuantity, setNewIngredientQuantity] = useState(''); // state für die neue Zutatenmenge
  const [newIngredientUnit, setNewIngredientUnit] = useState(''); // state für die neue Zutatenmenge
  const [expandedRecipe, setExpandedRecipe] = useState(null); // state für das erweiterte Rezept
  const [keyboardVisible, setKeyboardVisible] = useState(false); // state für die Tastatur
  // Funktion für die Rezepte laden
  const loadRecipes = () => {
    const recipeResults = db.execute('SELECT * FROM recipes');
    const recipeRows = recipeResults.rows._array;
    const recipesData = recipeRows.map(recipe => ({
      ...recipe,
      ingredients: [],
    }));
    recipesData.forEach(recipe => {
      const ingResults = db.execute(
        'SELECT ingredient, quantity, unit FROM recipeIngredients WHERE recipeId = ?',
        [recipe.id],
      );
      recipe.ingredients = ingResults.rows._array;
    });
    setRecipeList(recipesData);
  };

  useEffect(() => {
    db.execute(
      'CREATE TABLE IF NOT EXISTS recipes (id INTEGER PRIMARY KEY, recipeName TEXT)',
    );
    db.execute(
      'CREATE TABLE IF NOT EXISTS recipeIngredients (id INTEGER PRIMARY KEY AUTOINCREMENT, recipeId INTEGER, ingredient TEXT, quantity TEXT, unit TEXT)',
    );
    loadRecipes();
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadRecipes();
    }
  }, [isFocused]);

  const filteredRecipes = recipeList.filter(recipe =>
    recipe.recipeName.toLowerCase().includes(searchText.toLowerCase()),
  );

  const toggleSelection = id => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };
  // Funktion für das Löschen
  const handleDelete = () => {
    selectedItems.forEach(id => {
      db.execute('DELETE FROM recipes WHERE id = ?', [id]);
      db.execute('DELETE FROM recipeIngredients WHERE recipeId = ?', [id]);
    });
    loadRecipes();
    setDeleteMode(false);
    setSelectedItems([]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };
  // Funktion für das Abbrechen
  const cancelAction = () => {
    setDeleteMode(false);
    setAddMode(false);
    setSelectedItems([]);
  };
  // Funktion für das Bestätigen des Löschens
  const confirmDelete = () => {
    if (selectedItems.length === 0) {
      setAlertDialogMessage('Sie müssen mindestens 1 Rezept wählen');
      setShowAlertDialog(true);
    } else {
      setShowSafetyDialog(true);
    }
  };
  // Funktion für das Bestätigen des Hinzufügens
  const confirmAdd = () => {
    if (selectedItems.length === 0) {
      setAlertDialogMessage('Sie müssen mindestens 1 Rezept wählen');
      setShowAlertDialog(true);
    } else {
      setShowSafetyDialog(true);
    }
  };
  // Funktion für das Hinzufügen der Rezepte zur Einkaufsliste
  const addRecipesToShoppingList = () => {
    const selectedRecipes = recipeList.filter(recipe =>
      selectedItems.includes(recipe.id),
    );
    selectedRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        addOrUpdateIngredient(ingredient);
      });
    });
    cancelAction();
    setShowSuccessgreen(true);
    setTimeout(() => setShowSuccessgreen(false), 2500);
  };

  const parseInputToBaseUnits = (amount, unit) => {
    if (['KG', 'L'].includes(unit)) {
      if (amount.includes(',')) {
        const [main, fraction] = amount.split(',');
        return (
          parseInt(main || 0) * 1000 +
          parseInt((fraction || '000').padStart(3, '0').slice(0, 3))
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

  const addOrUpdateIngredient = ingredient => {
    const result = db.execute('SELECT * FROM items WHERE lower(name) = ?', [
      ingredient.ingredient.toLowerCase(),
    ]);
    const rows = result.rows._array;

    if (rows && rows.length > 0) {
      let existingRecord = rows.find(item => {
        if (['G', 'KG'].includes(ingredient.unit)) {
          return item.unit === 'G' || item.unit === 'KG';
        } else if (['L', 'ML'].includes(ingredient.unit)) {
          return item.unit === 'L' || item.unit === 'ML';
        } else {
          return item.unit === ingredient.unit;
        }
      });
      if (existingRecord) {
        let updatedAmount, updatedUnit;
        const isWeight = ['KG', 'G'].includes(existingRecord.unit);
        const isVolume = ['L', 'ML'].includes(existingRecord.unit);

        const existingInBase =
          existingRecord.unit === 'KG' || existingRecord.unit === 'L'
            ? existingRecord.amount * 1000
            : existingRecord.amount;

        const newInBase = parseInputToBaseUnits(
          ingredient.quantity,
          ingredient.unit,
        );
        const totalBase = existingInBase + newInBase;

        if (totalBase >= 1000 && (isWeight || isVolume)) {
          updatedUnit = isWeight ? 'KG' : 'L';
          updatedAmount = parseFloat((totalBase / 1000).toFixed(3));
        } else {
          updatedUnit = isWeight ? 'G' : isVolume ? 'ML' : ingredient.unit;
          updatedAmount = totalBase;
        }
        db.execute('UPDATE items SET amount = ?, unit = ? WHERE id = ?', [
          updatedAmount,
          updatedUnit,
          existingRecord.id,
        ]);
        return;
      }
    }

    let amountInput = parseInputAmount(ingredient.quantity, ingredient.unit);
    db.execute('INSERT INTO items (name, amount, unit) VALUES (?, ?, ?)', [
      ingredient.ingredient,
      amountInput,
      ingredient.unit,
    ]);
  };
  // Funktion für das Öffnen des Modals für das erweiterte Rezept wenn Tastatur aufgerufen wird
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <View style={style.mainCont}>
      <Searchcont searchText={searchText} setSearchText={setSearchText} />
      {recipeList.length === 0 ? (
        <View style={style.noRecipesContainer}>
          <Text style={style.noRecipesText}>Keine Rezepte vorhanden.</Text>
          <TouchableOpacity
            style={style.addReipss}
            onPress={() => navigation.navigate('Recips')}>
            <Text style={style.addReipssText}>Rezepte Hinzufügen</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <RecipsCard
              recipe={item}
              deleteMode={deleteMode}
              addMode={addMode}
              selectedItems={selectedItems}
              toggleSelection={toggleSelection}
              onExpand={setExpandedRecipe}
            />
          )}
          contentContainerStyle={{alignItems: 'center'}}
          style={style.flatList}
        />
      )}
      {recipeList.length > 0 && (
        <>
          <OptionBTNs
            onAddMode={() => {
              setAddMode(true);
              setDeleteMode(false);
              setSelectedItems([]);
            }}
            onDeleteMode={() => {
              setDeleteMode(true);
              setAddMode(false);
              setSelectedItems([]);
            }}
          />
          {(deleteMode || addMode) && (
            <ActionBox
              onAction={addMode ? confirmAdd : confirmDelete}
              onCancel={cancelAction}
              mode={addMode ? 'add' : 'delete'}
            />
          )}
        </>
      )}
      {showSafetyDialog && (
        <SafetyDialog
          yesBtnText={addMode ? 'Hinzufügen' : 'Löschen'}
          saeftyQuestion={
            addMode
              ? 'Möchten Sie diese Rezepte in Einkaufsliste Hinzufügen?'
              : 'Möchten Sie diese Rezepte wirklich löschen?'
          }
          yesBtn={() => {
            if (addMode) {
              addRecipesToShoppingList();
            } else {
              handleDelete();
            }
            setShowSafetyDialog(false);
          }}
          noBtn={() => {
            setShowSafetyDialog(false);
            cancelAction();
          }}
          stylyesbtn={{
            backgroundColor: addMode ? Colors.greencheck : Colors.reddelet,
          }}
        />
      )}
      {showSuccess && (
        <View style={style.overlay}>
          <SuccessAnimation />
        </View>
      )}
      {showSuccessgreen && (
        <View style={style.overlay}>
          <SuccessAnimationgren />
        </View>
      )}
      {expandedRecipe && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={true}
          onRequestClose={() => {
            setExpandedRecipe(null);
            setIsEditing(false);
          }}>
          <View
            style={[
              style.fullScreenContainer,
              keyboardVisible && style.fullScreenContainerKeyboard,
            ]}>
            <TouchableOpacity
              style={style.closeButton}
              onPress={() => {
                setExpandedRecipe(null);
                setIsEditing(false);
              }}>
              <Text style={style.closeButtonText}>X</Text>
            </TouchableOpacity>
            <ScrollView style={style.modalContent}>
              {isEditing ? (
                <>
                  {/* Rezeptnamen-Edit: ganz oben */}
                  <TextInput
                    style={style.editRecipeNameInput}
                    value={editableRecipeName}
                    onChangeText={setEditableRecipeName}
                    placeholder="Rezeptname"
                    placeholderTextColor={Colors.whitedarl}
                  />
                  {/* Zutatenüberschrift */}
                  <Text style={style.ingredientText}>Zutaten:</Text>
                  {/* Liste der editierbaren Zutaten */}
                  {editableIngredients.map((item, index) => (
                    <View key={index} style={style.ingredientEditRow}>
                      <Text style={style.fullIngredientItem}>
                        {item.ingredient} ({item.quantity} {item.unit})
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const newList = [...editableIngredients];
                          newList.splice(index, 1);
                          setEditableIngredients(newList);
                        }}>
                        <Text style={style.deleteIngredientText}>X</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {/* Neue Zutat hinzufügen */}
                  <View style={style.newIngredientRow}>
                    <TextInput
                      placeholder="Zutat"
                      placeholderTextColor={Colors.whitedarl}
                      value={newIngredientName}
                      onChangeText={setNewIngredientName}
                      style={style.newIngredientInput}
                    />
                    <TextInput
                      placeholder="Menge"
                      placeholderTextColor={Colors.whitedarl}
                      value={newIngredientQuantity}
                      onChangeText={text => {
                        let numericText = text.replace(/[^0-9]/g, '');
                        numericText = numericText.replace(/^0+/, '');
                        setNewIngredientQuantity(numericText);
                      }}
                      keyboardType="numeric"
                      style={style.newIngredientInput}
                    />
                    <View style={style.pickerContainer}>
                      <Picker
                        selectedValue={newIngredientUnit}
                        style={style.inputUnit}
                        onValueChange={itemValue =>
                          setNewIngredientUnit(itemValue)
                        }>
                        <Picker.Item label="" value="" />
                        <Picker.Item label="Kilogramm" value="KG" />
                        <Picker.Item label="Gramm" value="G" />
                        <Picker.Item label="Milliliter" value="Ml" />
                        <Picker.Item label="Liter" value="L" />
                        <Picker.Item label="Esslöffel" value="EL" />
                        <Picker.Item label="Stück" value="St" />
                      </Picker>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (
                          newIngredientName &&
                          newIngredientQuantity &&
                          newIngredientUnit
                        ) {
                          setEditableIngredients([
                            ...editableIngredients,
                            {
                              ingredient: newIngredientName,
                              quantity: newIngredientQuantity,
                              unit: newIngredientUnit,
                            },
                          ]);
                          setNewIngredientName('');
                          setNewIngredientQuantity('');
                          setNewIngredientUnit('');
                        } else {
                          setAlertDialogMessage(
                            'Bitte füllen Sie alle Felder für die Zutat aus',
                          );
                          setShowAlertDialog(true);
                        }
                      }}>
                      <Text style={style.addIngredientText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={style.fullRecipeTitle}>
                    {expandedRecipe.recipeName}
                  </Text>
                  <Text style={style.ingredientText}>Zutaten:</Text>
                  {expandedRecipe.ingredients.map((item, index) => (
                    <Text key={index} style={style.fullIngredientItem}>
                      {item.ingredient} ({item.quantity} {item.unit})
                    </Text>
                  ))}
                </>
              )}
            </ScrollView>
            {/* Button-Container – außerhalb des ScrollViews und stets am unteren Rand */}
            <View style={style.modalButtonsContainer}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={style.saveButton}
                    onPress={() => {
                      if (!editableRecipeName.trim()) {
                        setAlertDialogMessage(
                          'Rezeptname darf nicht leer sein',
                        );
                        setShowAlertDialog(true);
                        return;
                      }
                      if (editableIngredients.length === 0) {
                        setAlertDialogMessage(
                          'Es muss mindestens eine Zutat vorhanden sein',
                        );
                        setShowAlertDialog(true);
                        return;
                      }
                      // Update in der Datenbank
                      db.execute(
                        'UPDATE recipes SET recipeName = ? WHERE id = ?',
                        [editableRecipeName, expandedRecipe.id],
                      );
                      db.execute(
                        'DELETE FROM recipeIngredients WHERE recipeId = ?',
                        [expandedRecipe.id],
                      );
                      editableIngredients.forEach(ing => {
                        db.execute(
                          'INSERT INTO recipeIngredients (recipeId, ingredient, quantity, unit) VALUES (?, ?, ?, ?)',
                          [
                            expandedRecipe.id,
                            ing.ingredient,
                            ing.quantity,
                            ing.unit,
                          ],
                        );
                      });
                      setExpandedRecipe({
                        ...expandedRecipe,
                        recipeName: editableRecipeName,
                        ingredients: editableIngredients,
                      });
                      setIsEditing(false);
                      loadRecipes();
                    }}>
                    <Text style={style.saveButtonText}>Speichern</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={style.cancelButton}
                    onPress={() => setIsEditing(false)}>
                    <Text style={style.cancelButtonText}>Abbrechen</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={style.editButton}
                  onPress={() => {
                    // Wechsel in den Editiermodus: Bestehende Werte in den editierbaren Zustand übernehmen
                    setEditableRecipeName(expandedRecipe.recipeName);
                    setEditableIngredients([...expandedRecipe.ingredients]);
                    setIsEditing(true);
                  }}>
                  <Text style={style.editButtonText}>Bearbeiten</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
      {showAlertDialog && (
        <Modal
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowAlertDialog(false)}>
          <View style={style.alertModalContainer}>
            <AlertDialog
              yesBtn={() => setShowAlertDialog(false)}
              dialogtext={alertDialogMessage}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

function RecipsCard({
  recipe,
  deleteMode,
  addMode,
  selectedItems,
  toggleSelection,
  onExpand,
}) {
  return (
    <View style={style.recipCont}>
      <View style={style.nameCont}>
        {(deleteMode || addMode) && (
          <MyCheck
            isSelected={selectedItems.includes(recipe.id)}
            toggle={() => toggleSelection(recipe.id)}
            mode={deleteMode ? 'delete' : 'add'}
          />
        )}
        <Text style={style.recipName1}>{recipe.recipeName}</Text>
      </View>
      <TouchableOpacity
        style={style.seeMoreButton}
        onPress={() => onExpand(recipe)}>
        <Text style={style.seeMoreText}>Bearbeiten</Text>
      </TouchableOpacity>
      <View style={style.seph} />
      <View style={style.ingredientCont}>
        <Text style={style.ingredientText}>Zutaten:</Text>
        <FlatList
          data={recipe.ingredients}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={({item}) => (
            <View style={style.ingredientItem}>
              <Text style={style.ingredients}>
                {item.ingredient} ({item.quantity} {item.unit})
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

function OptionBTNs({onAddMode, onDeleteMode}) {
  return (
    <View style={style.optionBTNs}>
      <View style={style.CardnDel}>
        <TouchableOpacity onPress={onAddMode}>
          <Image
            source={require('../assets/img/card.png')}
            style={style.cardDel}
          />
        </TouchableOpacity>
        <View style={style.sepv} />
        <TouchableOpacity onPress={onDeleteMode}>
          <Image
            source={require('../assets/img/deletbtn.png')}
            style={style.cardDel}
          />
        </TouchableOpacity>
      </View>
      <View style={style.sepbtn} />
    </View>
  );
}

function MyCheck({isSelected, toggle, mode}) {
  return (
    <TouchableOpacity onPress={toggle} style={style.myCheck}>
      {isSelected && (
        <View
          style={[
            style.myChecked,
            {
              backgroundColor:
                mode === 'delete' ? Colors.reddelet : Colors.greencheck,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

function ActionBox({onAction, onCancel, mode}) {
  const btnText = mode === 'add' ? 'Hinzufügen' : 'Löschen';
  const btnStyle =
    mode === 'add'
      ? {backgroundColor: Colors.greencheck}
      : {backgroundColor: Colors.reddelet};
  return (
    <View style={style.mainDel}>
      <TouchableOpacity onPress={onAction} style={[style.deletbb, btnStyle]}>
        <Text style={style.cancelDeltext}>{btnText}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onCancel} style={style.dondel}>
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
  serchc: {},
  recipCont: {
    backgroundColor: Colors.primary,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    maxHeight: 180,
    minHeight: 170,
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 15,
  },
  nameCont: {
    marginTop: 5,
    marginBottom: 6,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  recipName1: {
    fontSize: 22,
    color: Colors.whitedarl,
    fontFamily: 'monospace',
    marginTop: '2%',
  },
  seph: {
    backgroundColor: Colors.whitedarl,
    width: 350,
    height: 2,
    marginLeft: '5%',
  },
  ingredientText: {
    fontSize: 20,
    color: Colors.whitedarl,
    fontFamily: 'monospace',
  },
  ingredients: {
    fontSize: 19,
    color: Colors.textwhite,
    letterSpacing: 1,
    marginLeft: 12,
  },
  ingredientCont: {
    flexDirection: 'row',
    justifyContent: 'center',
    maxHeight: 120,
    overflow: 'hidden',
  },
  ingredientItem: {
    paddingVertical: 1,
  },
  seeMoreButton: {
    alignSelf: 'flex-end',
    marginTop: -35,
    marginRight: 25,
    marginBottom: 10,
  },
  seeMoreText: {
    fontSize: 18,
    color: Colors.bblack,
    textDecorationLine: 'underline',
    letterSpacing: 1,
  },
  flatList: {
    marginBottom: 2,
    marginTop: 75,
  },
  optionBTNs: {
    backgroundColor: Colors.primary,
    width: '100%',
    height: 120,
    borderRadius: 35,
    borderColor: Colors.primarylight,
    borderWidth: 2,
  },
  sepbtn: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.whitedarl,
    top: 20,
  },
  CardnDel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 90,
    marginTop: 10,
  },
  cardDel: {
    width: 40,
    height: 50,
  },
  sepv: {
    width: 3,
    height: 50,
    backgroundColor: Colors.whitedarl,
  },
  myCheck: {
    position: 'absolute',
    height: 27,
    width: 27,
    backgroundColor: Colors.whitedarl,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.textwhite,
    borderWidth: 1,
    left: 12,
    top: 7,
  },
  myChecked: {
    textAlign: 'center',
    fontSize: 21,
    width: '100%',
    backgroundColor: Colors.greencheck,
    height: '100%',
    borderRadius: 5,
  },
  mainDel: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.textwhite,
    height: 78,
    width: '100%',
    bottom: 40,
    borderColor: Colors.primary,
    borderTopRightRadius: 35,
    borderTopLeftRadius: 35,
    borderWidth: 5,
  },
  deletbb: {
    backgroundColor: Colors.reddelet,
    width: '50%',
    borderTopLeftRadius: 25,
    borderRightWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dondel: {
    backgroundColor: Colors.bblack,
    width: '50%',
    borderTopRightRadius: 25,
    borderLeftWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelDeltext: {
    color: Colors.textwhite,
    fontFamily: 'monospace',
    fontSize: 25,
  },
  noRecipesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecipesText: {
    fontSize: 20,
    color: Colors.textwhite,
    fontFamily: 'monospace',
  },
  addReipss: {
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
    color: Colors.textwhite,
    fontSize: 20,
    fontFamily: 'monospace',
  },
  overlay: {
    position: 'absolute',
    top: -120,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  fullScreenContainer: {
    height: '83%',
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 25,
    top: '15%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: Colors.reddark,
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.textwhite,
    fontWeight: 'bold',
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 60,
  },
  fullRecipeTitle: {
    fontSize: 26,
    color: Colors.whitedarl,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 20,
  },
  fullIngredients: {
    marginTop: 10,
  },
  fullIngredientItem: {
    fontSize: 20,
    color: Colors.textwhite,
    marginVertical: 5,
    fontFamily: 'monospace',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: Colors.primary,
    borderTopWidth: 2,
    borderColor: Colors.whitedarl,
  },
  editRecipeNameInput: {
    fontSize: 26,
    color: Colors.whitedarl,
    fontFamily: 'monospace',
    borderBottomWidth: 1,
    borderColor: Colors.whitedarl,
    marginBottom: 20,
    textAlign: 'center',
  },
  ingredientEditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  deleteIngredientText: {
    color: Colors.textwhite,
    fontSize: 20,
    marginRight: 60,
    backgroundColor: Colors.reddark,
    height: 25,
    width: 25,
    textAlign: 'center',
    borderRadius: 25,
  },
  newIngredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  newIngredientInput: {
    borderWidth: 1,
    borderColor: Colors.textwhite,
    padding: 5,
    marginHorizontal: 5,
    color: Colors.textwhite,
    width: 90,
    height: 53,
    textAlign: 'center',
    marginBottom: 25,
    borderRadius: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.textwhite,
    borderRadius: 5,
    overflow: 'hidden',
    width: 100,
    marginHorizontal: 5,
    marginBottom: 25,
  },
  inputUnit: {
    fontSize: 15,
  },
  addIngredientText: {
    fontSize: 30,
    color: Colors.textwhite,
    backgroundColor: Colors.greencheck,
    marginHorizontal: 15,
    height: 40,
    width: 40,
    textAlign: 'center',
    borderRadius: 40,
    top: -10,
  },
  saveButton: {
    backgroundColor: Colors.greencheck,
    padding: 10,
    borderRadius: 10,
  },
  saveButtonText: {
    color: Colors.textwhite,
    fontSize: 18,
  },
  cancelButton: {
    backgroundColor: Colors.reddark,
    padding: 10,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: Colors.textwhite,
    fontSize: 18,
  },
  editButton: {
    backgroundColor: Colors.greencheck,
    padding: 10,
    borderRadius: 10,
  },
  editButtonText: {
    color: Colors.textwhite,
    fontSize: 18,
  },
  fullScreenContainerKeyboard: {
    height: '100%',
    top: 1,
  },
  alertModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default SavedRecips;
