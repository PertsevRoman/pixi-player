import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as PIXI from 'pixi.js';

// FIXME использовать ng-packagr для упаковки в модули

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.scss'
  ]
})
export class AppComponent implements OnInit {
  private app: PIXI.Application = null;

  @ViewChild('canvas') canvas: ElementRef;

  ngOnInit() {
    this.app = new PIXI.Application({
      view: this.canvas.nativeElement
    });
  }
}
