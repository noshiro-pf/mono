import { Component, OnInit } from '@angular/core';
import { AngularFirestore    } from 'angularfire2/firestore';
import { AngularFireDatabase } from 'angularfire2/database';


@Component({
  selector: 'app-edit-database',
  template: ` <p>app-edit-database</p> `,
  styles: []
})
export class EditDatabaseComponent implements OnInit {

  constructor(
    afs: AngularFirestore,
    afdb: AngularFireDatabase,
  ) {
  }

  ngOnInit() {
  }

}
