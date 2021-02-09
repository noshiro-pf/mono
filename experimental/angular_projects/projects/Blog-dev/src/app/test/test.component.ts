import { Component, OnInit } from '@angular/core';

import { showdown } from 'showdown';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  constructor() {
    const converter = new showdown.converter();
  }

  ngOnInit() {
  }

}
