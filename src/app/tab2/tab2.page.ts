import { Component, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import {LoadingController,ModalController} from '@ionic/angular';
import * as firebase from 'firebase';
import {AngularFireDatabase } from "@angular/fire/database";
import { Observable } from 'rxjs';
import { Storage } from "@ionic/storage/";
import {Toast} from '@ionic-native/toast/ngx';
import {Network} from '@ionic-native/network/ngx';
import {DatabaseService} from '../database.service';
import { PhoneModalPage } from '../phone-modal/phone-modal.page';
 

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements AfterViewChecked {
  @ViewChild('network') emoji ;

  public numberList: Array<any>;
  public loadedNumberList: Array<any>;
  public numberRef: firebase.database.Reference;


  list: Observable<any>;
  array: any;

  loading :any;
  async presentLoading() {
  this.loading = await this.loadingCtrl.create({
    message: 'Please wait...',
    spinner: 'crescent',
    duration: 5000,
  });
  return await this.loading.present();
}

  queryText = "";
  show = true;
  afterShow = true;

  private email: string;


  constructor(
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    private db: AngularFireDatabase,
    private storage: Storage,
    private toastCtrl: Toast,
    private network:Network,
    private cdRef : ChangeDetectorRef,
    private dbp:DatabaseService,) {
      

     this.presentLoading();
  setTimeout( () => {
      if (!document.getElementById('content'))
      this.presentToast('Slow network detected')
 }, 5000);

    this.numberRef = firebase.database().ref('/numbers');
    this.numberRef.on('value', numberList => {
      let numbers = [];
      numberList.forEach(num => {
        numbers.push(num.val());
        return false;
      });
      this.numberList = numbers;
      this.loadedNumberList = numbers;
    });

    this.storage.get('loggedin').then((val) => {
      if (val) {
        this.storage.get('email').then((email) => {
          this.email = email;
        });
      }
    });
    // fetch list of phone numbers from firebase and make a list
    this.list = this.db.list("/numbers/", ref => ref.orderByChild('timestamp')).valueChanges();
    this.list.subscribe(data => {
      this.array = data;
    });


  }

  openModal() {
    // restrict log in attempt
    this.storage.get('loggedin').then((val) => {
      if (!val) {
        this.presentToast('Please sign in')
        return null;
      } else {
     this.openPhoneModal();
      }
    });
  }

  async openPhoneModal(){
    const modal = await this.modalCtrl.create({component:PhoneModalPage, componentProps: { value: this.modalCtrl}});
    return await modal.present().catch((error) => {
    });
  }

  closeLoading(last: boolean) {
    this.afterShow = false;
    if (this.loading) {
      this.loading.dismiss();
      this.loading = null;
    }
  }
  
  ngAfterViewChecked() {
    let show = this.isShowExpand();
    if (show != this.show) { // check if it change, tell CD update view
      this.show = show;
      this.cdRef.detectChanges();
    }
  }
  
  isShowExpand()
  {
    return this.afterShow?true:false;
  }

  spam(item, key) {
    // restrict log in attempt
    this.storage.get('loggedin').then((val) => {
      if (!val) {
        this.presentToast('Please sign in')
      } else {
              // check if phone already marked as spam
          if (item.spam_count.toString().includes(this.email.toString().trim())) {
            this.presentToast('Already marked as spam by you');
            return;
          }

          this.changeSpam(item, key);
      }
    });
    

  }

  async changeSpam(item, key) {
    // check if phone already marked as not spam
    if (item.non_spam_count.toString().includes(this.email.toString().trim())) {
      if (item.spam_count === '')
        item.spam_count = this.email.toString() + ", "
      else
        item.spam_count = item.spam_count.toString() + this.email.toString() + ", "
      item.non_spam_count = item.non_spam_count.toString().replace(this.email.toString() + ", ", "")
      this.dbp.phoneSpamCount(item, key);

    } else {
      //change data and push to firebase (pass updated list and a key
      item.spam_count   = item.spam_count.toString() + this.email.toString() + ", "
      this.dbp.phoneSpamCount(item, key);
    }
    return await null;
  }

  non_spam(item, key) {
    // restrict log in attempt
    this.storage.get('loggedin').then((val) => {
      if (!val) {
        this.presentToast('Please sign in')
        return null;
      } else {
        
        // check if phone already marked as not spam
        if (item.non_spam_count.toString().includes(this.email.toString().trim())) {
          this.presentToast('Already marked as not spam by you');
          return;
        }


        // check if phone already marked as spam
        if (item.spam_count.toString().includes(this.email.toString().trim())) {
          if (item.non_spam_count === '')
            item.non_spam_count = this.email.toString() + ", ";
          else
            item.non_spam_count = item.non_spam_count.toString() + this.email.toString() + ", ";
          item.spam_count = item.spam_count.toString().replace(this.email.toString() + ", ", "")
          this.dbp.phoneNonSpamCount(item, key);
          return;
        } else {
          //change data and push to firebase (pass updated list and a key
          item.non_spam_count = item.non_spam_count.toString() + this.email.toString() + ", "
          this.dbp.phoneNonSpamCount(item, key);
        }
      }
    });




  }

  
  presentToast(message) {
   this.toastCtrl.show(message,'2000','bottom').subscribe(() => {}
    )
  }


  // search bar
  update() {
    if (!document.getElementById('content'))
      this.presentToast('Your item doesn\'t exist here')
  }


  //network

  networkOnConnect(connectionState:string){
 this.presentToast("You are online");

  }
  //Network OnDisconnect State
  networkOnDisconnect(connectionState:string){
    this.presentToast("You are  offline");
  }


  //Network connection
  ionViewDidEnter(){
    //onConnect
   this.network.onConnect().subscribe(data=>{
     console.log(data)
     this.networkOnConnect(data);
    },error=>console.log(error));
    //onDisconnect
   this.network.onDisconnect().subscribe(data=>{
     console.log(data)
     this.networkOnDisconnect(data);
  },error=>console.log(error));
  }


}
 
