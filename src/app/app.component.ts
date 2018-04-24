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

  public videoUrls = [
    `/assets/nat.mp4`
  ];

  ngOnInit() {
    this.app = new PIXI.Application({
      view: this.canvas.nativeElement
    });

    const texture = PIXI.Texture.fromVideoUrl(this.videoUrls[0]);
    const sprite = new PIXI.Sprite(texture);

    this.app.stage.addChild(sprite);

    sprite.height = this.app.renderer.height;
    sprite.width = this.app.renderer.width;

    sprite.x = 0;
    sprite.y = 0;
  }
}
