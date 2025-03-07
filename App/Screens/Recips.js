import React,{useState,useRef} from 'react'
import { View,StyleSheet, Text,TouchableOpacity,Image,TextInput, ScrollView } from 'react-native';
import Colors from '../constant/Colos'
import { Picker } from '@react-native-picker/picker';

function Recips (){
    const [showItemBox, setShowItemBox] = useState(false);
    return(
        <View style={style.mainCont}>
            <RecipesAndIngredientDisplay/>
            {showItemBox && <Itembox />}
        </View>
    )
}

function RecipesAndIngredientDisplay() {
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
            <ScrollView style={style.ingredienList}>
                <View style={style.ingredienListCont}>
                <Text style={style.ingredienItemText}>Eier</Text>
                <Text style={style.ingredienItemText}>3 KG</Text>
                <TouchableOpacity style={style.ingredienItemBtnCont}>
                    <Image source={require('../assets/img/x1btn.png')} style={style.ingredienItemBtn}/>
                </TouchableOpacity>
                </View>  
            </ScrollView>
            <TouchableOpacity style={style.ingredienAdd}>
              <Image source={require('../assets/img/addbtn.png')} style={style.ingredienAddbtn} />
            </TouchableOpacity>
        </View>
      </View>
    );
  }

function Itembox () {
    return (
        <View style={style.itembox}>

            <View style={style.itemboxcont}>
                <TouchableOpacity style={style.closeContBtn}>
                    <Text style={style.closeContText}>X</Text>
                     
                </TouchableOpacity>
                <View style={style.itemboxcontInput}>
                    <TextInput
                        style={style.itemboxname}
                        placeholder="Zutat eintragen:"
                        placeholderTextColor={Colors.whitedarl}
                    />
                    <View style={style.inputUnitContainer}>
                        <Picker
                        
                        style={style.inputUnit}
                        
                        >
                            <Picker.Item label="KG" value="KG" />
                            <Picker.Item label="G" value="G" />
                            <Picker.Item label="EL" value="EL" />
                            <Picker.Item label="St." value="St" />
                        </Picker>
                    </View>
                </View>
                <View style={style.seph}/> 
                <TouchableOpacity style={style.itemboxaddbtn}>
                    <Text style={style.itemboxaddtext}>Hinzufügen</Text>
                </TouchableOpacity>
            </View>
            
        </View>
    )    
}
const style = StyleSheet.create ({

    mainCont:{
        flex:1,
        backgroundColor:Colors.backgroundbgrey
    },
    displaycont:{
        
        height:"60%",
        alignItems:"center",
        
    },
    reciepDisplayCont:{
        position:"absolute",
        height:"18%",
        width:"94%",
        marginTop:15,
        borderRadius:25,
        borderColor:Colors.primary,
        borderWidth:4,
        backgroundColor:Colors.Primarytransf,
        
        
    },
    reciepName:{
        fontSize:19,
        fontWeight:"bold",
        top:15,
        left:5,
        color:Colors.textwhite,
        letterSpacing:1
        
    },
    btncont:{
        height:40,
        width:40,
        left:"88%",
        top:-29,
        borderWidth:2,
        borderRadius:10,
        borderColor:Colors.reddark,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:Colors.reddark
    },
    btncontg:{
        height:40,
        width:40,
        left:"88%",
        top:-29,
        borderWidth:2,
        borderRadius:10,
        borderColor:Colors.greencheck,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:Colors.greencheck
    },
    btn:{
        width:30,
        height:30,
        tintColor:Colors.whitedarl, 
    },
    ingredienDisplayCont :{
        position:"absolute",
        minHeight:"99%",
        maxHeight:"100%",
        width:"94%",
        marginTop:40,
        borderRadius:25,
        borderColor:Colors.primary,
        borderWidth:4,
        backgroundColor:Colors.Primarytransf,
        top:70,
        alignItems:"center"
        
    },
    ingredienText :{
        fontSize:27,
        fontWeight:"bold",
        top:10,
        left:15,
        color:Colors.whitedarl,
        letterSpacing:3
    },
    ingredienAdd:{
        position:"absolute",
        width:70,
        height:45,
        bottom:"3%",
        backgroundColor:Colors.greencheck,
        borderRadius:15,
        justifyContent:"center",
        alignItems:"center"    
    },
    ingredienAddbtn :{
        width:40,
        height:40,    
        tintColor:Colors.whitedarl,
       
    },
    ingredienList:{
        
        width:"95%",
        marginBottom:"17%",
        marginTop:"3%",
        borderRadius:20,
        borderColor:Colors.bblack,
        borderWidth:2,
        borderStyle:"dashed"
    },
    ingredienListCont:{
        flexDirection:"row",
        justifyContent:"space-between",
        marginVertical:10,
        marginHorizontal:15
    },
    ingredienItemText:{
        fontSize:25,
        color:Colors.textwhite,
        letterSpacing:2
    },
    ingredienItemBtnCont:{
        width:35,
        height:35,
        justifyContent:"center",
        alignItems:"center",
        borderRadius:10,
        backgroundColor:Colors.reddark,

    },
    ingredienItemBtn:{
        width:25,
        height:25,
        tintColor:Colors.whitedarl,
    },
    itembox :{
        position:"absolute",    
        width:"100%",
        height:"100%",
        backgroundColor:Colors.transpertblc,
        alignItems:"center",
        justifyContent:"center",
    },
    itemboxcont:{
        width:"85%",
        height:"30%",
        backgroundColor:Colors.primary,
        top:"-25%",
        borderRadius:25,
        borderColor:Colors.whitedarl,
        borderWidth:2,
        alignItems:"center",
        
       
    },
    itemboxcontInput:{
        
        marginTop:"7%",
        flexDirection:"row",
        justifyContent:"space-between",
        marginHorizontal:2,
        marginTop:50
        
    },
    itemboxname:{
        fontSize:18,
        borderRadius:25,
        height:60,
        width:"50%",
        color:Colors.textwhite,
        borderColor:Colors.whitedarl,
        borderWidth:2,
        backgroundColor:Colors.primarydark,
        paddingLeft:15,
        marginRight:10
    },
    inputUnitContainer:{
        backgroundColor:Colors.primarydark,
        height:"100%",
        width:"40%",
        borderRadius:25,
        marginHorizontal:1,
        borderColor:Colors.whitedarl,
        borderWidth:2,
        
    },
    inputUnit:{
        fontSize:15,
        
    },
    seph:{
        width:"95%",
        height:2,
        backgroundColor:Colors.whitedarl,
        marginTop:20,
    },
    closeContBtn:{
        position:"absolute",
        left:"86%",
        top:9,
        backgroundColor:Colors.reddark,
        height:30,
        width:30,
        borderRadius:30,

    },
    closeContText:{
        fontSize:20,
        textAlign:"center",
        color:Colors.whitedarl
    },
    itemboxaddbtn:{
        height:45,
        width:150,
        backgroundColor:Colors.greencheck,
        borderRadius:25,
        justifyContent:"center",
        alignItems:"center",
        marginTop:25
    },
    itemboxaddtext:{
        fontSize:20,
        color:Colors.textwhite,
        textAlign:"center",
        

    }
    
})

export default Recips