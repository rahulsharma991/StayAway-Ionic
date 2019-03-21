import { Component } from '@angular/core';
import { Platform, LoadingController } from '@ionic/angular';
import * as firebase from 'firebase';
import { Storage} from  '@ionic/storage';
import {AngularFireAuth} from '@angular/fire/auth';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import { Observable } from 'rxjs';
import { Toast} from '@ionic-native/toast/ngx'
import { FeedbackModalPage } from '../feedback-modal/feedback-modal.page';
import{ModalController} from '@ionic/angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  name: any={};
  email: any={};
  profilepic: any={};
  public static loggedin: any = false;

  userProfile: any;
  tabBarElement:any;
  public classReference = Tab1Page;

  constructor(
    public plt: Platform,
    private storage:Storage,
    private fire:AngularFireAuth,
    private googlePlus:GooglePlus,
    private toast:Toast,
    private modalCtrl:ModalController,
    private loadingCtrl: LoadingController,
    private route:Router) 
   {
    storage.get('loggedin').then((val) => {
      if(val){
        Tab1Page.loggedin = true;
        storage.get('name').then((val) => {
          this.name = val;
        });
        storage.get('email').then((val) => {
          this.email= val;
        });
        storage.get('profilepic').then((val) => {
          this.profilepic = val;
        });
      }
      else {
        Tab1Page.loggedin = false;
      }

  });

   }
   user: Observable<firebase.User>;


  googleLogin() {
    if (this.plt.is('cordova')) {
      this.nativeGoogleLogin();
  } else {
      this.webGoogleLogin();
    }
  }

  async presentLoading(loading) {
		return await loading.present();
	}

  async nativeGoogleLogin() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...' 
    });

    this.presentLoading(loading);
   
    this.googlePlus.login({
      'scopes': '',
		  'webClientId': '726105943693-grbsqvh8r6ea34j2qs7gfor5tlaicase.apps.googleusercontent.com', 
		  'offline': true
    }).then( res =>{
        loading.dismiss();  
        this.name = res.displayName;
        this.email = res.email;
        this.profilepic = res.imageUrl;
        this.storage.set('name', res.displayName);
        this.storage.set('email', res.email);
        this.storage.set('profilepic', res.imageUrl);
        this.storage.set('loggedin', true);
        Tab1Page.loggedin = true;
        this.route.navigate(['']);
    
      }).catch( err => {console.log(err);
        loading.dismiss();
        this.presentToast("Couldn't sign in. Please try again.");}
      );
    
}

  async webGoogleLogin(): Promise<void> {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const credential = await this.fire.auth.signInWithPopup(provider);
        console.log(credential);
        Tab1Page.loggedin = true;
        this.name = credential.additionalUserInfo.profile['name'];
        this.email = credential.additionalUserInfo.profile['email'];
        this.profilepic = credential.additionalUserInfo.profile['picture'];
        this.storage.set('name', this.name);
        this.storage.set('email', this.email);
        this.storage.set('profilepic', this.profilepic);
        this.storage.set('loggedin', true);

    } catch(err) {
        console.log(err)
      }

  }
  signOut() {
    try{
       this.storage.set('loggedin', false  );
       this.fire.auth.signOut().then(()=>{
         Tab1Page.loggedin = false;
       });
       this.googlePlus.logout().then( ()=>{
         Tab1Page.loggedin = false;
       });
     }catch {
 
     }
   }
   
  static checkLoggedIn() {
    if(Tab1Page.loggedin)
      return true;
    else
      return false;
  }
  
  presentToast(message) {
    let toast = this.toast.show(message, '2000', 'bottom').subscribe(
      toast => {
        console.log(toast);
      }
    );
  }

  
  
async  feedback() {
   const modal= await  this.modalCtrl.create({component:FeedbackModalPage});
     return await modal.present();
  }
  
}