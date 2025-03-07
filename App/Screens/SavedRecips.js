import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import Colors from '../constant/Colos';
import Searchcont from '../components/Searchcont';
import SafetyDialog from '../components/SafetyDialog';

const recipes = [
  {
    id: 1,
    recipeName: "Pasta Salad",
    ingredients: [
      { ingredient: "Tomato", quantity: "2", unit: "St" },
      { ingredient: "Cucumber", quantity: "1", unit: "St" },
      { ingredient: "Olives", quantity: "50", unit: "G" },
      { ingredient: "Onion", quantity: "1", unit: "St" },
      { ingredient: "Feta Cheese", quantity: "100", unit: "G" },
      { ingredient: "Feta Cheese", quantity: "10", unit: "G" },
      { ingredient: "Feta Cheese", quantity: "50", unit: "G" },
      { ingredient: "Feta Cheese", quantity: "60", unit: "G" },
      { ingredient: "Feta Cheese", quantity: "20", unit: "G" },
      { ingredient: "Feta Cheese", quantity: "100", unit: "G" },
      { ingredient: "Feta Cheese", quantity: "100", unit: "G" },
    ]
  },
  {
    id: 2,
    recipeName: "Apple Pie",
    ingredients: [
      { ingredient: "Apple", quantity: "4", unit: "St" },
      { ingredient: "Flour", quantity: "250", unit: "G" },
      { ingredient: "Sugar", quantity: "150", unit: "G" },
      { ingredient: "Butter", quantity: "100", unit: "G" },
      { ingredient: "Cinnamon", quantity: "1", unit: "EL" },
      { ingredient: "Lemon Juice", quantity: "2", unit: "EL" }
    ]
  },
  {
    id: 3,
    recipeName: "Fried Chicken",
    ingredients: [
      { ingredient: "Chicken", quantity: "500", unit: "G" },
      { ingredient: "Flour", quantity: "150", unit: "G" },
      { ingredient: "Oil", quantity: "500", unit: "G" },
      { ingredient: "Spices", quantity: "50", unit: "G" },
      { ingredient: "Garlic Powder", quantity: "1", unit: "EL" },
      { ingredient: "Paprika", quantity: "1", unit: "EL" }
    ]
  },
  {
    id: 4,
    recipeName: "Vegetable Stir Fry",
    ingredients: [
      { ingredient: "Bell Pepper", quantity: "2", unit: "St" },
      { ingredient: "Carrot", quantity: "2", unit: "St" },
      { ingredient: "Broccoli", quantity: "200", unit: "G" },
      { ingredient: "Soy Sauce", quantity: "50", unit: "G" },
      { ingredient: "Ginger", quantity: "1", unit: "St" },
      { ingredient: "Garlic", quantity: "3", unit: "St" }
    ]
  },
  {
    id: 5,
    recipeName: "Chocolate Cake",
    ingredients: [
      { ingredient: "Flour", quantity: "200", unit: "G" },
      { ingredient: "Sugar", quantity: "150", unit: "G" },
      { ingredient: "Cocoa Powder", quantity: "50", unit: "G" },
      { ingredient: "Eggs", quantity: "3", unit: "St" },
      { ingredient: "Butter", quantity: "150", unit: "G" },
      { ingredient: "Vanilla Extract", quantity: "1", unit: "EL" }
    ]
  },
  {
    id: 6,
    recipeName: "Caesar Salad",
    ingredients: [
      { ingredient: "Lettuce", quantity: "200", unit: "G" },
      { ingredient: "Croutons", quantity: "50", unit: "G" },
      { ingredient: "Parmesan Cheese", quantity: "30", unit: "G" },
      { ingredient: "Caesar Dressing", quantity: "3", unit: "EL" },
      { ingredient: "Chicken Breast", quantity: "200", unit: "G" }
    ]
  }
];

function SavedRecips() {
  const [recipeList, setRecipeList] = useState(recipes);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showSafetyDialog, setShowSafetyDialog] = useState(false);

  const toggleSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  
  const handleDelete = () => {
    setRecipeList(prev => prev.filter(recipe => !selectedItems.includes(recipe.id)));
    setDeleteMode(false);
    setSelectedItems([]);
  };

  const cancelDelete = () => {
    setDeleteMode(false);
    setSelectedItems([]);
  };

  
  const confirmDelete = () => {
    setShowSafetyDialog(true);
  };

  return (
    <View style={style.mainCont}>
      <Searchcont contstyle={style.serchc} />
      <FlatList
        data={recipeList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RecipsCard
            recipe={item}
            deleteMode={deleteMode}
            selectedItems={selectedItems}
            toggleSelection={toggleSelection}
          />
        )}
        contentContainerStyle={{ alignItems: 'center' }}
        style={style.flatList}
      />
      <OptionBTNs onDeleteMode={() => setDeleteMode(true)} />
      {deleteMode && <Deletbox onDelete={confirmDelete} onCancel={cancelDelete} />}
      
      {showSafetyDialog && (
        <SafetyDialog
          yesBtnText="Löschen"
          saeftyQuestion="Möchten Sie diese Rezepte wirklich löschen?"
          
          yesBtn={() => { handleDelete(); setShowSafetyDialog(false); }}
          
          noBtn={() => setShowSafetyDialog(false)}
          
          stylyesbtn={{ backgroundColor: Colors.reddelet }}
        />
      )}
    </View>
  );
}

function RecipsCard({ recipe, deleteMode, selectedItems, toggleSelection }) {
  return (
    <View style={style.recipCont}>
      <View style={style.nameCont}>
        {deleteMode && (
          <MyCheck
            isSelected={selectedItems.includes(recipe.id)}
            toggle={() => toggleSelection(recipe.id)}
            deleteMode={deleteMode}
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
      <TouchableOpacity style={style.seeMoreButton}>
        <Text style={style.seeMoreText}>See More</Text>
      </TouchableOpacity>
    </View>
  );
}

function OptionBTNs({ onDeleteMode }) {
  return (
    <View style={style.optionBTNs}>
      <View style={style.CardnDel}>
        <TouchableOpacity>
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

function MyCheck({ isSelected, toggle, deleteMode }) {
  return (
    <TouchableOpacity onPress={toggle} style={style.myCheck}>
      {isSelected && (
        <View
          style={[
            style.myChecked,
            deleteMode && { backgroundColor: Colors.reddelet }
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

function Deletbox({ onDelete, onCancel }) {
  return (
    <View style={style.mainDel}>
      <TouchableOpacity onPress={onDelete} style={style.deletbb}>
        <Text style={style.cancelDeltext}>Löschen</Text>
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
    width: "100%",
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 15,
  },
  nameCont: {
    marginTop: 5,
    marginBottom: 6,
    justifyContent: "center",
    flexDirection: "row",
  },
  recipName1: {
    fontSize: 22,
    color: Colors.whitedarl,
    fontFamily: "monospace",
    marginTop: "2%",
  },
  seph: {
    backgroundColor: Colors.whitedarl,
    width: 350,
    height: 2,
    marginLeft: "5%",
  },
  ingredientText: {
    fontSize: 20,
    color: Colors.whitedarl,
    fontFamily: "monospace",
  },
  ingredients: {
    fontSize: 19,
    color: Colors.textwhite,
    letterSpacing: 1,
    marginLeft: 12,
  },
  ingredientCont: {
    flexDirection: "row",
    justifyContent: "center",
    maxHeight: 90,
    overflow: "hidden",
  },
  ingredientItem: {
    paddingVertical: 1, 
  },
  seeMoreButton: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginRight: 25,
    marginBottom: 5,
  },
  seeMoreText: {
    fontSize: 18,
    color: Colors.whitedarl,
    textDecorationLine: "underline",
    letterSpacing: 1,
  },
  flatList: {
    marginBottom: 2,
    marginTop: 75,
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
    top: 20,
  },
  CardnDel: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    borderRadius: 5,
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
    borderWidth: 5,
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
});

export default SavedRecips;
