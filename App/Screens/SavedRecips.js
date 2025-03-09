import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import Colors from '../constant/Colos';
import Searchcont from '../components/Searchcont';
import SafetyDialog from '../components/SafetyDialog';
import AlertDialog from '../components/AlertDialog';
import { open } from 'react-native-quick-sqlite';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import SuccessAnimation from '../components/SuccessAnimation';
import SuccessAnimationgren from '../components/SuccessAnimationgren';

const db = open({
  name: 'shopping.db',
  location: 'default'
});

function SavedRecips() {
  const [recipeList, setRecipeList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showSafetyDialog, setShowSafetyDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const navigation = useNavigation();
  const isFocused = useIsFocused(); 
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSuccessgreen, setShowSuccessgreen] = useState(false);
  
  // Neuer State für das erweiterte Rezept
  const [expandedRecipe, setExpandedRecipe] = useState(null);

  const loadRecipes = () => {
    const recipeResults = db.execute('SELECT * FROM recipes');
    const recipeRows = recipeResults.rows._array;
    const recipesData = recipeRows.map(recipe => ({ ...recipe, ingredients: [] }));
    recipesData.forEach(recipe => {
      const ingResults = db.execute('SELECT ingredient, quantity, unit FROM recipeIngredients WHERE recipeId = ?', [recipe.id]);
      recipe.ingredients = ingResults.rows._array;
    });
    setRecipeList(recipesData);
  };

  useEffect(() => {
    db.execute('CREATE TABLE IF NOT EXISTS recipes (id INTEGER PRIMARY KEY, recipeName TEXT)');
    db.execute('CREATE TABLE IF NOT EXISTS recipeIngredients (id INTEGER PRIMARY KEY AUTOINCREMENT, recipeId INTEGER, ingredient TEXT, quantity TEXT, unit TEXT)');
    loadRecipes();
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadRecipes();
    }
  }, [isFocused]);

  const filteredRecipes = recipeList.filter(recipe =>
    recipe.recipeName.toLowerCase().includes(searchText.toLowerCase())
  );

  const toggleSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

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

  const cancelAction = () => {
    setDeleteMode(false);
    setAddMode(false);
    setSelectedItems([]);
  };

  const confirmDelete = () => {
    if (selectedItems.length === 0) {
      setShowAlertDialog(true);
    } else {
      setShowSafetyDialog(true);
    }
  };

  const confirmAdd = () => {
    if (selectedItems.length === 0) {
      setShowAlertDialog(true);
    } else {
      setShowSafetyDialog(true);
    }
  };

  const addRecipesToShoppingList = () => {
    const selectedRecipes = recipeList.filter(recipe => selectedItems.includes(recipe.id));
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
    if (["KG", "L"].includes(unit)) {
      if (amount.includes(',')) {
        const [main, fraction] = amount.split(',');
        return parseInt(main || 0) * 1000 + parseInt((fraction || "000").padStart(3, '0').slice(0, 3));
      }
      return parseFloat(amount.replace(',', '.')) * 1000;
    }
    return parseFloat(amount.replace(',', '.'));
  };

  const parseInputAmount = (amount, unit) => {
    const baseUnits = parseInputToBaseUnits(amount, unit);
    return ["KG", "L"].includes(unit)
      ? parseFloat((baseUnits / 1000).toFixed(3))
      : baseUnits;
  };

  const addOrUpdateIngredient = (ingredient) => {
    const result = db.execute(
      'SELECT * FROM items WHERE lower(name) = ?',
      [ingredient.ingredient.toLowerCase()]
    );
    const rows = result.rows._array;

    if (rows && rows.length > 0) {
      let existingRecord = rows.find(item => {
        if (["G", "KG"].includes(ingredient.unit)) {
          return item.unit === "G" || item.unit === "KG";
        } else if (["L", "ML"].includes(ingredient.unit)) {
          return item.unit === "L" || item.unit === "ML";
        } else {
          return item.unit === ingredient.unit;
        }
      });
      if (existingRecord) {
        let updatedAmount, updatedUnit;
        const isWeight = ["KG", "G"].includes(existingRecord.unit);
        const isVolume = ["L", "ML"].includes(existingRecord.unit);

        const existingInBase = (existingRecord.unit === "KG" || existingRecord.unit === "L")
          ? existingRecord.amount * 1000
          : existingRecord.amount;

        const newInBase = parseInputToBaseUnits(ingredient.quantity, ingredient.unit);
        const totalBase = existingInBase + newInBase;

        if (totalBase >= 1000 && (isWeight || isVolume)) {
          updatedUnit = isWeight ? "KG" : "L";
          updatedAmount = parseFloat((totalBase / 1000).toFixed(3));
        } else {
          updatedUnit = isWeight ? "G" : (isVolume ? "ML" : ingredient.unit);
          updatedAmount = totalBase;
        }
        db.execute(
          'UPDATE items SET amount = ?, unit = ? WHERE id = ?',
          [updatedAmount, updatedUnit, existingRecord.id]
        );
        return;
      }
    }

    let amountInput = parseInputAmount(ingredient.quantity, ingredient.unit);
    db.execute(
      'INSERT INTO items (name, amount, unit) VALUES (?, ?, ?)',
      [ingredient.ingredient, amountInput, ingredient.unit]
    );
  };

  return (
    <View style={style.mainCont}>
      <Searchcont searchText={searchText} setSearchText={setSearchText} />
      { recipeList.length === 0 ? (
        <View style={style.noRecipesContainer}>
          <Text style={style.noRecipesText}>Keine Rezepte vorhanden.</Text>
          <TouchableOpacity style={style.addReipss} onPress={() => navigation.navigate("Recips")}>
            <Text style={style.addReipssText}>Rezepte Hinzufügen</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RecipsCard
              recipe={item}
              deleteMode={deleteMode}
              addMode={addMode}
              selectedItems={selectedItems}
              toggleSelection={toggleSelection}
              onExpand={setExpandedRecipe}  // Übergibt die Funktion zum Öffnen des Modals
            />
          )}
          contentContainerStyle={{ alignItems: 'center' }}
          style={style.flatList}
        />
      )}
      { recipeList.length > 0 && (
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
              mode={addMode ? "add" : "delete"}
            />
          )}
        </>
      )}
      {showSafetyDialog && (
        <SafetyDialog
          yesBtnText={addMode ? "Hinzufügen" : "Löschen"}
          saeftyQuestion={
            addMode 
              ? "Möchten Sie diese Rezepte in Einkaufsliste Hinzufügen?" 
              : "Möchten Sie diese Rezepte wirklich löschen?"
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
          stylyesbtn={{ backgroundColor: addMode ? Colors.greencheck : Colors.reddelet }}
        />
      )}
      {showAlertDialog && (
        <AlertDialog 
          yesBtn={() => { setShowAlertDialog(false); }}
          dialogtext="Sie müssen mindestens 1 Rezept wählen" 
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
      
      {/* Vollbild-Modal für das erweiterte Rezept */}
      {expandedRecipe && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={true}
          onRequestClose={() => setExpandedRecipe(null)}
        >
          <View style={style.fullScreenContainer}>
            <TouchableOpacity style={style.closeButton} onPress={() => setExpandedRecipe(null)}>
              <Text style={style.closeButtonText}>X</Text>
            </TouchableOpacity>
            <ScrollView contentContainerStyle={style.scrollContainer}>
              <Text style={style.fullRecipeTitle}>{expandedRecipe.recipeName}</Text>
              <View style={style.fullIngredients}>
                <Text style={style.ingredientText}>Zutaten:</Text>
                {expandedRecipe.ingredients.map((item, index) => (
                  <Text key={index} style={style.fullIngredientItem}>
                    {item.ingredient} ({item.quantity} {item.unit})
                  </Text>
                ))}
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

function RecipsCard({ recipe, deleteMode, addMode, selectedItems, toggleSelection, onExpand }) {
  return (
    <View style={style.recipCont}>
      <View style={style.nameCont}>
        {(deleteMode || addMode) && (
          <MyCheck 
            isSelected={selectedItems.includes(recipe.id)}
            toggle={() => toggleSelection(recipe.id)}
            mode={deleteMode ? "delete" : "add"}
          />
        )}
        <Text style={style.recipName1}>{recipe.recipeName}</Text>
      </View>
      <View style={style.seph} />
      <View style={style.ingredientCont}>
        <Text style={style.ingredientText}>Zutaten:</Text>
        <FlatList
          data={recipe.ingredients}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={style.ingredientItem}>
              <Text style={style.ingredients}>
                {item.ingredient} ({item.quantity} {item.unit})
              </Text>
            </View>
          )}
        />
      </View>
      <TouchableOpacity style={style.seeMoreButton} onPress={() => onExpand(recipe)}>
        <Text style={style.seeMoreText}>See More</Text>
      </TouchableOpacity>
    </View>
  );
}

function OptionBTNs({ onAddMode, onDeleteMode }) {
  return (
    <View style={style.optionBTNs}>
      <View style={style.CardnDel}>
        <TouchableOpacity onPress={onAddMode}>
          <Image source={require("../assets/img/card.png")} style={style.cardDel} />
        </TouchableOpacity>
        <View style={style.sepv} />
        <TouchableOpacity onPress={onDeleteMode}>
          <Image source={require("../assets/img/deletbtn.png")} style={style.cardDel} />
        </TouchableOpacity>
      </View>
      <View style={style.sepbtn} />
    </View>
  );
}

function MyCheck({ isSelected, toggle, mode }) {
  return (
    <TouchableOpacity onPress={toggle} style={style.myCheck}>
      {isSelected && (
        <View
          style={[
            style.myChecked,
            { backgroundColor: mode === "delete" ? Colors.reddelet : Colors.greencheck }
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

function ActionBox({ onAction, onCancel, mode }) {
  const btnText = mode === "add" ? "Hinzufügen" : "Löschen";
  const btnStyle = mode === "add" ? { backgroundColor: Colors.greencheck } : { backgroundColor: Colors.reddelet };
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
    backgroundColor: Colors.backgroundbgrey
  },
  serchc: {},
  recipCont: {
    backgroundColor: Colors.primary,
    borderColor: Colors.whitedarl,
    borderWidth: 2,
    maxHeight: 180,
    width: "100%",
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 15,
  },
  nameCont: {
    marginTop: 5,
    marginBottom: 6,
    justifyContent: "center",
    flexDirection: "row"
  },
  recipName1: {
    fontSize: 22,
    color: Colors.whitedarl,
    fontFamily: "monospace",
    marginTop: "2%"
  },
  seph: {
    backgroundColor: Colors.whitedarl,
    width: 350,
    height: 2,
    marginLeft: "5%"
  },
  ingredientText: {
    fontSize: 20,
    color: Colors.whitedarl,
    fontFamily: "monospace"
  },
  ingredients: {
    fontSize: 19,
    color: Colors.textwhite,
    letterSpacing: 1,
    marginLeft: 12
  },
  ingredientCont: {
    flexDirection: "row",
    justifyContent: "center",
    maxHeight: 90,
    overflow: "hidden"
  },
  ingredientItem: {
    paddingVertical: 1
  },
  seeMoreButton: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginRight: 25,
    marginBottom: 5
  },
  seeMoreText: {
    fontSize: 18,
    color: Colors.whitedarl,
    textDecorationLine: "underline",
    letterSpacing: 1
  },
  flatList: {
    marginBottom: 2,
    marginTop: 75
  },
  optionBTNs: {
    backgroundColor: Colors.primary,
    width: "100%",
    height: 120,
    borderRadius: 35,
    borderColor: Colors.primarylight,
    borderWidth: 2,
  },
  sepbtn: {
    width: "100%",
    height: 2,
    backgroundColor: Colors.whitedarl,
    top: 20
  },
  CardnDel: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 90,
    marginTop: 10
  },
  cardDel: {
    width: 40,
    height: 50
  },
  sepv: {
    width: 3,
    height: 50,
    backgroundColor: Colors.whitedarl
  },
  myCheck: {
    position: "absolute",
    height: 27,
    width: 27,
    backgroundColor: Colors.whitedarl,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    borderColor: Colors.textwhite,
    borderWidth: 1,
    left: 12,
    top: 7,
  },
  myChecked: {
    textAlign: "center",
    fontSize: 21,
    width: "100%",
    backgroundColor: Colors.greencheck,
    height: "100%",
    borderRadius: 5
  },
  mainDel: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.textwhite,
    height: 78,
    width: "100%",
    bottom: 40,
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
    alignItems: "center"
  },
  cancelDeltext: {
    color: Colors.textwhite,
    fontFamily: "monospace",
    fontSize: 25
  },
  noRecipesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noRecipesText: {
    fontSize: 20,
    color: Colors.textwhite,
    fontFamily: 'monospace'
  },
  addReipss:{
    height: 70,
    width: 250,
    backgroundColor: Colors.greencheck,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 20
  },
  addReipssText: {
    color: Colors.textwhite,
    fontSize: 20,
    fontFamily: "monospace"
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
    fontFamily: "monospace",
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
    fontFamily: "monospace",
  },
});

export default SavedRecips;
