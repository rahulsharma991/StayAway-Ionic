import { Component, OnInit } from '@angular/core';
import {ModalController,AlertController} from '@ionic/angular';
import {Toast} from '@ionic-native/toast/ngx';
import {Storage} from '@ionic/storage';
import {DatabaseService} from '../database.service';

@Component({
  selector: 'app-feedback-modal',
  templateUrl: './feedback-modal.page.html',
  styleUrls: ['./feedback-modal.page.scss'],
})
export class FeedbackModalPage implements OnInit {

   ngOnInit() {
  }

  
  constructor(
    private view: ModalController,
    private toastCtrl: Toast,
    private storage: Storage,
    private database: DatabaseService,
    private alertCtrl: AlertController) {
this.storage.get('email').then((val) => {
  this.feedbackDetails.email = val;
});
  
}


feedbackDetails = {
email: '',
message: '',
}

  closeModal() {
    const data = {
    };
    this.view.dismiss(data);
  }

  submit() {
    console.log(this.feedbackDetails.email)
    if(this.feedbackDetails.email.trim() === '') {
      this.presentToast('Try again');
      return;
    }
    if(this.feedbackDetails.message.trim() === '') {
    this.presentToast('Message is empty');
    return;
    }

    this.alertController()

  }

  presentToast(message) {
    this.toastCtrl.show(message,'2000','bottom').subscribe(() => {}
    )
  }

//confirm alert box
async alertController(){
  const alert =await this.alertCtrl.create({
  header: 'Confirm submission',
  message: 'Are you sure?',
  buttons: [
  {
      text: 'No',
      role: 'cancel',
      handler: () => {
        return;
  }
  },
    {
        text: 'Yes',
          handler: () => {
        // add message in database
              this.database.addFeedback(this.feedbackDetails);
              this.closeModal();
    }
  }
  ]
  });
  return await alert.present();
  }

}
