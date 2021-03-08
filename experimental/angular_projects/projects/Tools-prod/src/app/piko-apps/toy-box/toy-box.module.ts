import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MyOwnCustomMaterialModule } from '../../my-own-custom-material.module';
import { MyLibModule } from '../../mylib/mylib.module';
import { LambdaInterpreterComponent } from './lambda-interpreter/lambda-interpreter.component';
import { MnistComponent } from './mnist/mnist.component';
import { ToyBoxComponent } from './toy-box.component';

@NgModule({
  imports: [CommonModule, MyOwnCustomMaterialModule, MyLibModule],
  declarations: [ToyBoxComponent, LambdaInterpreterComponent, MnistComponent],
})
export class ToyBoxModule {}
