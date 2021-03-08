import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-card-image-size-slider',
  templateUrl: './card-image-size-slider.component.html',
  styleUrls: ['./card-image-size-slider.component.css'],
})
export class CardImageSizeSliderComponent implements OnInit {
  @Input() min = 70;
  @Input() max = 280;
  @Input() default = 180;
  @Input() value = 70;
  @Output() valueChange = new EventEmitter<number>();

  constructor() {}

  ngOnInit() {
    if (this.default === undefined) {
      this.default = this.value;
    }
  }

  changeCardSize(newValue: number) {
    this.value = newValue;
    this.valueChange.emit(newValue);
  }

  resetCardLongSideLength() {
    this.changeCardSize(this.default);
  }
}
