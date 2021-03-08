import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-message-for-me-area',
  templateUrl: './message-for-me-area.component.html',
  styleUrls: ['./message-for-me-area.component.css'],
})
export class MessageForMeAreaComponent implements OnInit, AfterViewInit {
  @Input() gameMessageList$!: Observable<string[]>;
  @Input() gameMessageIndexDelayed$!: Observable<number>;

  gameMessageList_default1Line$!: Observable<string[]>;

  constructor() {}

  ngOnInit() {
    this.gameMessageList_default1Line$ = this.gameMessageList$.pipe(
      startWith([]),
      map((list) => (list.length > 0 ? list : ['']))
    );
  }

  ngAfterViewInit() {
    // auto scroll when view changed
    const target = document.getElementById('messages');
    const observer = new MutationObserver((_) => {
      const $chatListElements = document.getElementsByClassName('list-element');
      if ($chatListElements.length <= 0) return;
      const $lastElement = $chatListElements[$chatListElements.length - 1];
      $lastElement.scrollIntoView(true);
    });
    observer.observe(target as Node, { childList: true });
  }
}
