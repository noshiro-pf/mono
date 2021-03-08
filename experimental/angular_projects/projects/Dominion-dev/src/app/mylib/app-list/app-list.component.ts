import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.css'],
})
export class AppListComponent implements OnInit {
  @Input() readonly appName!: string;
  @Input() readonly apps!: {
    routerLink: string;
    inService: boolean;
    title: string;
    subtitle: string;
    description?: string;
  }[];

  constructor() {}

  ngOnInit() {}
}
