import React,{useState,useRef} from 'react'
import { View,StyleSheet, Text,TouchableOpacity,Image,TextInput, ScrollView } from 'react-native';
import Colors from '../constant/Colos'


function Recips (){
    return(
        <View style={style.mainCont}>
            <RecipesAndIngredientDisplay/>

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
                <TouchableOpacity style={style.btncont} onPress={handleActivate}>
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
    
})

export default Recips