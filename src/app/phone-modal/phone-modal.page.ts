import { Component, OnInit } from '@angular/core';
import {Storage} from '@ionic/storage';
import {Toast} from '@ionic-native/toast/ngx';
import {AlertController} from '@ionic/angular';
import {DatabaseService} from '../database.service';
import {ModalController} from '@ionic/angular';


@Component({
  selector: 'app-phone-modal',
  templateUrl: './phone-modal.page.html',
  styleUrls: ['./phone-modal.page.scss'],
})
export class PhoneModalPage implements OnInit {
userMail:string;

  constructor(private storage: Storage,
    private view: ModalController,
    private database: DatabaseService,
    private toastCtrl: Toast,
    private alertCtrl: AlertController) { 
    this.storage.get('email').then((val) => {
      this.userMail = val;
      this.phoneDetails.spam_count = this.userMail + ", ";
    });
  }

  ngOnInit() {
  }

  
closeModal() {
  const data = {
  };
  this.view.dismiss(data);
}

// data json
phoneDetails = {
  "key": "",
  "phone": "",
  "comment": "",
  "spam_count": "",
  "non_spam_count": "",
  "email": "stayaway.official@gmail.com",
  "timestamp" : ""
}

submit() {

  if(this.phoneDetails.phone.toString().length < 10 || this.phoneDetails.phone.toString().length > 15) {
    this.presentToast("Enter a valid number");
    return;
  }

  if(this.phoneDetails.phone.toString().length == 10) {
    this.presentToast("Please add country code without '+'");
    return;
  }

  if(!Number.isInteger(Number(this.phoneDetails.phone.toString()))) {
    this.presentToast("Please remove characters in phone number");
    return;
  }


  if(this.phoneDetails.comment.toString().trim() === '') {
    this.presentToast("Comment box is empty");
    return;
  }

  this.storage.get('loggedin').then((val) => {
      if(val) {
        this.storage.get('email').then((email) => {
          if(email.toString().trim() === '') {
                this.presentToast("Try again");
                return;
          } else {
                this.phoneDetails.email = email.toString();
          }
        });
      }
      else {
        this.presentToast("Try again");
        return;
      }

  });
  

  if(this.phoneDetails.email.toString().trim() === '') {
    this.presentToast("Try again");
    return;
  }

this.alert();
 
}
presentToast(message) {
  this.toastCtrl.show(message,'2000','bottom').subscribe(() => {}
  )
}
async  alert() {
  
  const alert =await this.alertCtrl.create({
  header: 'Confirm submission',
  message: 'You won\'t be able to make changes.',
  buttons: [
    {
      text: 'Disagree',
      role: 'cancel',
      handler: () => {
        return;
      }
    },
    {
      text: 'Agree',
      handler: () => {
              this.phoneDetails.timestamp = new Date().toUTCString();
              this.phoneDetails.phone = "+" + this.phoneDetails.phone;
              // add message in database
              this.database.addNumber(this.phoneDetails);
              this.closeModal();
      }
    }
    ]
  });
  return await alert.present();
}

// to select category
selectChoice(value) {
  if(value === 'Spam') {
    this.phoneDetails.spam_count = this.userMail + ", ";
    this.phoneDetails.non_spam_count = "";

  } else {

    this.phoneDetails.non_spam_count = this.userMail  + ", ";
    this.phoneDetails.spam_count = "";

  }
}

}


