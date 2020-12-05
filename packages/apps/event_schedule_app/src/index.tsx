import firebase from 'firebase/app';
import 'firebase/firestore';
import React from 'react';
import ReactDOM from 'react-dom';
import { firestorePaths } from './api/crud/collection-name';
import { firebaseConfig } from './api/firebase-config';
import { Root } from './components/root';
import './index.css';
import * as serviceWorker from './serviceWorker';

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
export const dbEvents = db.collection(firestorePaths.events);

ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
