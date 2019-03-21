import { Component,ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { LoadingController,ModalController} from '@ionic/angular';
import { DatabaseService } from '../database.service';
import {Toast} from '@ionic-native/toast/ngx';
import { MessageModalPage } from '../message-modal/message-modal.page';



@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements AfterViewChecked {
  @ViewChild('network') emoji ;

  list: Observable<any[]>;
  array: any;
  loading :any;
  async presentLoading() {
  this.loading =await this.loadingCtrl.create({
      message: 'Please wait...',
      spinner: 'crescent',
      duration: 5000,
    });
    return await this.loading.present();
  }

    show = true;
    afterShow = true;


  queryText = "";

  private email: string;


  constructor(
              private db: AngularFireDatabase,
              public modalCtrl: ModalController,
              public loadingCtrl: LoadingController,
              private storage: Storage,
              private toastCtrl: Toast,
              private dbp: DatabaseService,
              private cdRef : ChangeDetectorRef) {

  
                this.presentLoading();
                setTimeout( () => {
                  if (!document.getElementById('content'))
                  this.presentToast('Slow network detected')
             }, 5000);

    try{
    this.list = this.db.list("/messages", ref => ref.orderByChild('timestamp')).valueChanges();
    this.list.subscribe( valueOfItems => {
          this.array = valueOfItems;
      }, );
    }
    catch{
    }

    this.storage.get('loggedin').then((val) => {
        if(val) {
          this.storage.get('email').then((email) => {
            this.email = email;
          });
        }
    });
  }
  
  openModal() {
    // restrict log in attempt
    
     this.storage.get('loggedin').then((val) => {
       if (!val) {
          this.presentToast('Please sign in')
          return null ;
       }
       else {
          this.openMessageModal();
              
            }
     });
  }

  async openMessageModal() {
    const modal =await this.modalCtrl.create({component:MessageModalPage});
    return await modal.present().catch((error) => {
      console.log('df')
    });
  }

  closeLoading(last: boolean) {
    this.afterShow = false;
    if(this.loading){
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
          this.presentToast('Please sign in');
          return null;
       } else {
            // check if phone already marked as spam
            if(item.spam_count.toString().includes(this.email.toString().trim())) {
              this.presentToast('Already marked as spam by you');
              return;
            }

            // check if phone already marked as not spam
            if(item.non_spam_count.toString().includes(this.email.toString().trim())) {
              if(item.spam_count === '')
                  item.spam_count = this.email.toString() + ", ";
              else
                  item.spam_count = item.spam_count.toString() + this.email.toString() + ", ";
              item.non_spam_count = item.non_spam_count.toString().replace(this.email.toString() + ", ", "");
              this.dbp.messageSpamCount(item, key);
              return;
            }
            else {
              //change data and push to firebase (pass updated list and a key
              item.spam_count = item.spam_count.toString() + this.email.toString() + ", ";
              this.dbp.messageSpamCount(item, key);
            }
       }
     });




  }





  non_spam(item, key) {

    // restrict log in attempt
     this.storage.get('loggedin').then((val) => {
       if (!val) {

          this.presentToast('Please sign in');
          return null;

       } else {
           // check if phone already marked as not spam
            if(item.non_spam_count.toString().includes(this.email.toString().trim())) {
                    this.presentToast('Already marked as not spam by you');
                    return;
            }
                // check if phone already marked as spam
            if(item.spam_count.toString().includes(this.email.toString().trim())) {
                    if(item.non_spam_count === '')
                        item.non_spam_count = this.email.toString() + ", ";
                    else
                        item.non_spam_count = item.non_spam_count.toString() + this.email.toString() + ", ";
                    item.spam_count = item.spam_count.toString().replace(this.email.toString() + ", ", "");
                    this.dbp.messageNonSpamCount(item, key);
                    return;
            } else {
                //change data and push to firebase (pass updated list and a key
                item.non_spam_count = item.non_spam_count.toString() + this.email.toString() + ", ";
                this.dbp.messageNonSpamCount(item, key);
            }

       }
     });




  }



  presentToast(message) {
     this.toastCtrl.show(message,'2000','bottom').subscribe((data) => {
     });
  }


  // search bar
  update() {
    if (!document.getElementById('content'))
      this.presentToast('Your item doesn\'t exist here');

  }
 }