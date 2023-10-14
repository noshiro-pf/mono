import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { RN } from 'rnjs';
import { Observable } from 'rxjs';
import { UserService } from '../../../../database/user.service';
import { ChatMessage } from '../../types/chat-message';
import { GameRoomCommunicationService } from '../services/game-room-communication.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewInit {
  @Input() sidenav!: MatSidenav;
  @Input() autoScroll: boolean = true;

  chatList$: Observable<ChatMessage[]> = this.gameCommunication.chatList$;
  myName$: RN<string> = this.user.name$;

  newMessage: string = '';
  disableSubmitButton = false; // 連打防止

  constructor(
    private user: UserService,
    private gameCommunication: GameRoomCommunicationService,
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // auto scroll when view changed
    const target = document.getElementById('chat-list');
    const observer = new MutationObserver((_) => {
      const $chatListElements =
        document.getElementsByClassName('chat-list-element');
      if (!this.autoScroll || $chatListElements.length <= 0) return;
      const $lastElement = $chatListElements[$chatListElements.length - 1];
      $lastElement.scrollIntoView(true);
    });
    observer.observe(target as Node, { childList: true });
  }

  async submitMessage() {
    if (!this.newMessage) return;
    const msg = this.newMessage;
    this.newMessage = '';
    this.disableSubmitButton = true;
    await this.gameCommunication.sendMessage(msg);
    this.disableSubmitButton = false;
  }

  messageOnChange(message: string) {
    this.newMessage = message || '';
  }
}
