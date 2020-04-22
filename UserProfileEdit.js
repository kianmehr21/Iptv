import React, {Component} from 'react'
import { View, Text, TextInput, TouchableOpacity,ScrollView, Image } from 'react-native'
import AppStyle from '../styles/style';
import ValidationComponent from 'react-native-form-validator';
import { MessageBarManager } from 'react-native-message-bar';
import axios from 'axios';
import CONSTANTS from '../Constants';
import { Loading } from '../components/Loading'
import {connect} from 'react-redux';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
const options = {
    title: 'Select Image',
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
};

 class UserProfileEdit extends ValidationComponent {
    constructor(props) {
        super(props);
        this.state = {
            avatarSource:(this.props.imagePath == '' || this.props.imagePath == null) ? require("../../assets/images/default-user.png") : { uri:CONSTANTS.BASE_URL + this.props.imagePath },
            loading:false,
            fname : this.props.fname, 
            lname: this.props.lname, 
            email: (this.props.email == null) ? "": this.props.email,
            phone: this.props.phone};
        this.deviceLocale = 'fa';
    }
    sendPhoto(photo){
        let $this = this;
        const data = new FormData();
        data.append('pic', {
            uri: photo.uri,
            type: "image/jpeg",//photo.type,
            name: photo.name//photo.fileName
        });
        let url = CONSTANTS.BASE_URL + "/api/app/AddUserProfileImg?securityKey=" + $this.props.userkey;
        console.log(url);
        $this.setState({loading:true}); 
        axios.post(
            url,
            data,
            { 
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(async (response) => {
              $this.setState({loading:false}); 
              console.log(response.data);
              let arr = response.data;
              if(arr[0]=="1"){
                  $this._alert("success",arr[1],'عملیات موفق',3500);
                  $this.props.setEditedProfileImagePath(arr[2]);
                //   $this.setState({
                //     avatarSource: { uri: photo.uri },
                //   });
              }
              else if(arr=="0"){
                $this._alert("error",arr[1],'عملیات ناموفق',3500);
              }
            }).catch(function (error) {
                $this.setState({loading:false}); 
                $this._alert("error",'متا سفانه در ارسال تصویر مشکلی بوجود آمد.','خطا در ارسال اطلاعات!',3500);
                console.log(error);
            });
    }

    showPicker(){
        let $this = this
        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);
            if (response.didCancel) {
              console.log('User cancelled image picker');
            } else if (response.error) {
              console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
              console.log('User tapped custom button: ', response.customButton);
            } else {
              console.log(response);
              const source = { uri: response.uri };
              // You can also display the image using data:
              //const source = { uri: 'data:image/jpeg;base64,' + response.data };
              console.log(response);
              ImageResizer.createResizedImage(response.uri, 400, 300, 'JPEG', 100).then((response2) => {
                // response.uri is the URI of the new image that can now be displayed, uploaded...
                // response.path is the path of the new image
                // response.name is the name of the new image with the extension
                // response.size is the size of the new image
                console.log(response2);
                $this.sendPhoto(response2);
              }).catch((err) => {
                // Oops, something went wrong. Check that the filename is correct and
                // inspect err to get more details.
              });
              //$this.sendPhoto(response);
            }
          });
    }

    _alert(type,message,title,duration){
        MessageBarManager.showAlert({
            title: title,
            duration:duration,
            message: message,
            alertType: type,
            position: 'bottom',
            animationType: 'SlideFromBottom',
            titleStyle: AppStyle.alertTilteStyle,
            messageStyle:AppStyle.alertMessageStyle
        });
    }

    onSubmit() {
        let isValid = this.validate({
          fname: {minlength:2, maxlength:30, required: true},
          lname: {minlength:2, maxlength:30, required: true},
          //email: { required: false, email: true,},
          phone: {number:true, required: true},
        });
        if(!isValid){
            MessageBarManager.showAlert({
                title: 'تکمیل فرم',
                duration:4500,
                message: this.getErrorMessages().replace(/fname/g,"نام").replace(/lname/g,"نام خانوادگی").replace(/phone/g,"تلفن"),
                alertType: 'error',
                position: 'bottom',
                animationType: 'SlideFromBottom',
                titleStyle: AppStyle.alertTilteStyle,
                messageStyle:AppStyle.alertMessageStyle
                });
        }
        else{
            this.sendEditedData();
        }
       
    }

    sendEditedData(){
        let $this = this;
        $this.setState({loading:true});  
        let url = CONSTANTS.BASE_URL + "/api/app/GetEditProfile";
        axios.get(url, {
        params: {
            firstName: $this.state.fname,
            lastName: $this.state.lname,
            email: $this.state.email,
            securityKey: $this.props.userkey,
        }}).then((response) => {

          $this.setState({loading:false}); 
          let arr = response.data;
          if(arr[0]=="1"){
              $this._alert("success",arr[1],'عملیات موفق',3500);
              this.props.setEditedProfileData({fname : $this.state.fname, lname: $this.state.lname, email: $this.state.email });
          }
          else if(arr=="0"){
            $this._alert("error",arr[1],'عملیات ناموفق',3500);
          }
        }).catch(function (error) {
            $this.setState({loading:false}); 
            $this._alert("error",'متا سفانه در ارسال اطلاعات مشکلی بوجود آمد.','خطا در ارسال اطلاعات!',3500);
            console.log(error);
          });
    }

    render(){
         return(
             <View style={[AppStyle.pageStyle]}>
                <Loading loading={this.state.loading} />
                <View style={{flex:840,paddingLeft:15,paddingRight:15}}>
                <ScrollView>
                    <View style={{alignSelf:'center',marginBottom:10}}>
                        <Image resizeMode="cover" source={this.state.avatarSource}
                        style={{ width: 130, height: 130, borderRadius: 130/2 }} 
                        onError={(e) => { this.setState({avatarSource : require("../../assets/images/default-user.png")})}}/>
                        <TouchableOpacity 
                        onPress={this.showPicker.bind(this)}
                        style={{position:"absolute", alignSelf:'center',width: 130, height: 130,top:35}}>
                            <Text style={{fontSize:35,color:'#fff',fontWeight:'bold',textAlign:'center',textAlignVertical:'center'}}> ... </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={AppStyle.fieldTitle}>نام :</Text>
                    <TextInput 
                        ref='fname'
                        onChangeText={(fname) => this.setState({fname})} value={this.state.fname}
                        style={[AppStyle.textFont,{textAlign:'right'}]}
                        keyboardType="default"
                        direction="rtl"
                        placeholder="نام خود را به فارسی وارد نمائید ..."
                        underlineColorAndroid="transparent"/>

                    <Text style={AppStyle.fieldTitle}>نام خانوادگی :</Text>
                    <TextInput 
                        ref='lname'
                        onChangeText={(lname) => this.setState({lname})} value={this.state.lname}
                        style={[AppStyle.textFont,{textAlign:'right'}]}
                        keyboardType="default"
                        direction="rtl"
                        placeholder="نام خانوادگی خود را به فارسی وارد نمائید ..."
                        underlineColorAndroid="transparent"/>

                    <Text style={AppStyle.fieldTitle}>شماره تلفن همراه :</Text>
                    <TextInput                    
                        ref='phone'
                        onChangeText={(phone) => this.setState({phone})} value={this.state.phone}
                        style={[AppStyle.textFont,{textAlign:'right'}]}
                        keyboardType="numeric"
                        editable={false}
                        direction="rtl"
                        placeholder="مثلا ۰۹۱۵۱۲۵۰۰۰۰"
                        underlineColorAndroid="transparent"/>

                    <Text style={AppStyle.fieldTitle}>پست الکترونیک :</Text>
                    <TextInput                    
                        ref='email'
                        onChangeText={(email) => this.setState({email})} value={this.state.email}
                        style={[AppStyle.textFont,{textAlign:'right'}]}
                        keyboardType="default"
                        direction="rtl"
                        placeholder="لطفا ایمیل را وارد نمایید (اختیاری)."
                        underlineColorAndroid="transparent"/>
                </ScrollView>
                </View>
                <View style={{flex:76}}> 
                    <TouchableOpacity style={{flex:1}} onPress={this.onSubmit.bind(this)}>
                        <Text style={[AppStyle.Button1Style]}>ثبت اطلاعات</Text>
                    </TouchableOpacity>
                </View>
             </View>
         );
     }
 }

export default connect((e) => ({ 
    userkey: e.userReducer.userkey,
    fname:e.userReducer.fname, 
    lname:e.userReducer.lname,
    phone:e.userReducer.phone,
    email:e.userReducer.email,
    imagePath: e.userReducer.imagePath
 } ),(dispatch) => ({
    setEditedProfileData: (userData) => dispatch({type: "setEditedProfileData", data:userData}),
    setEditedProfileImagePath: (path) => dispatch({type: "setEditedProfileImagePath", imagePath:path})
}))(UserProfileEdit);