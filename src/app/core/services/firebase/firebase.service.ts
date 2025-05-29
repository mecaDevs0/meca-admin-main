import { Injectable, OnInit } from '@angular/core';

import firebase from 'firebase/compat/app';
import { CONFIG_BASE } from '@core/config';
import { environment } from '@environments/environment';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseConfig implements OnInit {
  refreshTokenFirebaseInterval: any;

  constructor() {}

  ngOnInit() {
    this.authenticateWithFirebase();
  }

  authenticateWithFirebase() {
    const { email, password } = CONFIG_BASE.firebase;

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((res) => {
        // Handle successful login
        this.refreshTokenFirebaseInterval = setInterval(async () => {
          await this.refreshToken();
        }, 60000 * 10);
      })
      .catch((error) => {
        console.error('Error logging in:', error);
      });
  }

  async refreshToken() {
    const auth = firebase.auth();
    const user = auth?.currentUser;
    if (user && user.getIdToken) {
      const token = await user.getIdToken(true);
    }
  }

  async createAndSendErrorLog(
    error: string,
    method: string,
    url: string
  ): Promise<void> {
    console.error(error);
    const databaseRef = firebase
      .database()
      .ref(`/${CONFIG_BASE.appName}/${environment.name}/logErrors`);
    await databaseRef.push({
      error: JSON.stringify(error),
      method,
      url,
      date: moment().format('DD/MM/yyyy HH:mm:ss'),
    });
  }
}
