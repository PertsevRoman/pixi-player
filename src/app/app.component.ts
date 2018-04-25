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

    const videoTex = PIXI.Texture.fromVideoUrl(this.videoUrls[0]);
    let videoBaseTexture = videoTex.baseTexture as PIXI.VideoBaseTexture;
    videoBaseTexture.source.addEventListener(`loadedmetadata`, () => {
      const sprite = new PIXI.Sprite(videoTex);

      this.app.stage.addChild(sprite);

      sprite.width = videoBaseTexture.source.videoWidth;
      sprite.height = videoBaseTexture.source.videoHeight;

      sprite.anchor.x = .5;
      sprite.anchor.y = .5;

      sprite.x = this.app.renderer.width / 2;
      sprite.y = this.app.renderer.height / 2;
    });
  }
}
