import { Component, OnInit } from '@angular/core';
import {ModalController} from '@ionic/angular';
import {Toast} from '@ionic-native/toast/ngx';
import {Storage} from '@ionic/storage';
import {DatabaseService} from '../database.service';
import {AlertController} from '@ionic/angular';
import {Network} from '@ionic-native/network/ngx';

@Component({
  selector: 'app-message-modal',
  templateUrl: './message-modal.page.html',
  styleUrls: ['./message-modal.page.scss'],
})
export class MessageModalPage implements OnInit {

  ngOnInit(){}

  userMail: string;

  constructor(
              private view: ModalController,
              private toastCtrl: Toast,
              private storage: Storage,
              private database: DatabaseService,
              private alertCtrl: AlertController,
              private network:Network,
              private toast:Toast) {

    this.storage.get('email').then((val) => {
              this.userMail = val;
              this.messageDetails.spam_count = this.userMail + ", ";
            });

  }

  closeModal() {
    const data = {
    };
    this.view.dismiss(data);
  }

  // data json
  messageDetails = {
    "message": "",
    "comment": "",
    "spam_count": "",
    "non_spam_count": "",
    "email": "stayaway_official@gmail.com",
    "timestamp": ""
  }


  submit() {
    if(this.messageDetails.message.trim() === '') {
      this.presentToast("Message box is empty");
      return;
    }

    if(this.messageDetails.comment.trim() === '') {
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
                  this.messageDetails.email = email.toString();
            }
          });
        }
        else {
          this.presentToast("Try again");
          return;
        }

    });
    if(this.messageDetails.email.toString().trim() === '') {
      this.presentToast("Try again");
      return;
    }

    this.alertController();
    
}
  
presentToast(message) {
  this.toastCtrl.show(message,'2000','bottom').subscribe(() => {}
  )
}

async  alertController() {
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
            this.messageDetails.timestamp = new Date().toUTCString();
            // add message in database
            this.database.addMessage(this.messageDetails);
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

      this.messageDetails.spam_count = this.userMail + ", ";
      this.messageDetails.non_spam_count = "";

    } else {

      this.messageDetails.non_spam_count = this.userMail + ", ";
      this.messageDetails.spam_count = "";

    }
  }
  }



