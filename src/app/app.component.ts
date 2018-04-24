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

    PIXI.loader.add(`video`, this.videoUrls[0]).load((loader, resources) => {
      const sprite = new PIXI.Sprite(resources.video.texture);

      this.app.stage.addChild(sprite);

      sprite.width = sprite.texture.width;
      sprite.height = sprite.texture.height;

      sprite.anchor.x = .5;
      sprite.anchor.y = .5;

      sprite.x = this.app.renderer.width / 2;
      sprite.y = this.app.renderer.height / 2;
    });
  }
}
