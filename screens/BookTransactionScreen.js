import React from 'react';
import {Text,View,TouchableOpacity,StyleSheet,Image} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import { TextInput } from 'react-native-gesture-handler';
import db from '../config.js';
import firebase from 'firebase';

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
    initiateBookIssue =()=>{
        alert("hi");
        //add a transaction
        db.collection("Transactions").add({
            'studentId' : this.state.scannedStudentId,
            'bookId' : this.state.scannedBookId,
            'date' : firebase.firestore.Timestamp.now().toDate(),
            'txnType' : "issue"
        })
        //change the book's availability
        db.collection("Books").doc(this.state.scannedBookId).update({
            'bookAvailable' : false
        })
        //change number of books issued by student
        db.collection("Students").doc(this.state.scannedStudentId).update({
            'numBooksIssued' : firebase.firestore.FieldValue.increment(1)
        })
        alert("The book has been issued");
        this.setState({
            scannedBookId : '',
            scannedStudentId : ''
        })
    }
    initiateBookReturn =()=>{
        alert("Hello");
        //add a transaction
        db.collection("Transactions").add({
            'studentId' : this.state.scannedStudentId,
            'bookId' : this.state.scannedBookId,
            'date' : firebase.firestore.Timestamp.now().toDate(),
            'txnType' : "return"
        })
        //change book availability
        db.collection("Books").doc(this.state.scannedBookId).update({
            'bookAvailable' : true
        })
        //change number of books issued by student
        db.collection("Students").doc(this.state.scannedStudentId).update({
            'numBooksIssued' : firebase.firestore.FieldValue.increment(-1)
        })
        alert("The book has been returned");
        this.setState({
            scannedBookId : '',
            scannedStudentId : ''
        })
    }
    handleTransaction =async()=>{
        console.log(this.state.scannedBookId);
        console.log(this.state.scannedStudentId);
        var transactionMessage;
        db.collection("Books").doc(this.state.scannedBookId).get()
        .then((doc)=>{var book = doc.data()
            console.log(book);
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
