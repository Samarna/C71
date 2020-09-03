import React from 'react';
import {Text,View,TouchableOpacity,StyleSheet,Image} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import { TextInput } from 'react-native-gesture-handler';
import db from '../config.js';

export default class BookTransactionScreen extends React.Component {
    constructor(){
        super();
        this.state = {
            hasCameraPermissions : null,
            scanned : false,
            buttonState : 'normal',
            scannedBookId : '',
            scannedStudentId : '',
        }
    }
    getCameraPermissions = async(id) =>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            /*status === "granted" is true when user has granted permission status === "granted" is false
             when user has not granted the permission */
            hasCameraPermissions : status === 'granted',
            buttonState : id,
            scanned : false,
        })
    }
    handleBarCodeScanned = async({type,data}) =>{
        const {buttonState} = this.state;
        if(buttonState === "BookID"){
            this.setState({scanned : true, scannedBookId : data, buttonState : 'normal'});
        }
        else if(buttonState === "StudentID"){
            this.setState({scanned : true, scannedStudentId : data, buttonState : 'normal'});
        }
    }
    initiateBookIssue = async()=>{
        //add a transaction
        //change the book's availability
        //change number of books issued by student
    }
    handleTransaction =async()=>{
        var transactionMessage;
        db.collection("Books").doc(this.state.scannedBookId).get()
        .then((doc)=>{var book = doc.data()
        if(book.bookAvailable){
            this.initiateBookIssue();
            transactionMessage = "Book Issued";
        }else{
            this.initiateBookReturn();
            transactionMessage = "Book Returned";
        }});

    }
    render(){
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;
        if(buttonState !== "normal" && hasCameraPermissions){
            return(
                <BarCodeScanner 
                onBarCodeScanned = {scanned?undefined:this.handleBarCodeScanned} 
                style = {StyleSheet.absoluteFillObject}>
                </BarCodeScanner>
            )
        }
        else if(buttonState === "normal"){
            return(
                <View style = {styles.container}>
                    <View>
                        <Image source = {require("../assets/booklogo.jpg")} style = {{width:200, height:200}}></Image>
                        <Text style = {{textAlign:'center', fontSize:30}}>WILY</Text>
                    </View>
                    <View style = {styles.inputView}>
                        <TextInput style = {styles.inputBox} placeHolder = "Book ID Code" value = {this.state.scannedBookId}></TextInput>
                        <TouchableOpacity style = {styles.scanButton} onPress = {()=>{
                            this.getCameraPermissions("BookID")
                        }}>
                            <Text style = {styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {styles.inputView}>
                    <TextInput style = {styles.inputBox} placeHolder = "Student ID Code" value = {this.state.scannedStudentId}></TextInput>
                        <TouchableOpacity style = {styles.scanButton} onPress = {()=>{
                            this.getCameraPermissions("StudentID")
                        }}>
                            <Text style = {styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style = {styles.submitButton} onPress = {async()=>{ 
                        var transactionMessage = await this.handleTransaction();
                        }}>
                        <Text style = {styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    }
        }
const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    displayText :{
        fontSize :15,
        textDecorationLine: "underline",
    },
    scanButton:{
        backgroundColor: "#66BB6A",
        width:50,
        borderWidth:1.5,
        borderLeftWidth:0,
    },
    buttonText:{
        fontSize:15,
        textAlign:'center',
        marginTop:10,
    },
    inputView :{
        flexDirection:'row',
        margin:20,
    },
    inputBox :{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20,
    },
    submitButton :{
        backgroundColor : '#FBC02D',
        width : 100,
        height : 40,
    },
    submitButtonText :{
        textAlign : 'center',
        fontSize : 16,
        fontWeight : 'bold',
        color : 'white',
        padding : 6,
    }
})