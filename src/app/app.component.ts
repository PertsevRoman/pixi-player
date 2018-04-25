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

  canvasWidth = 800;
  canvasHeight = 600;

  ngOnInit() {
    this.app = new PIXI.Application({
      view: this.canvas.nativeElement,
      antialias: true,
      width: this.canvasWidth,
      height: this.canvasHeight
    });

    const videoTex = PIXI.Texture.fromVideoUrl(this.videoUrls[0]);
    let videoBaseTexture = videoTex.baseTexture as PIXI.VideoBaseTexture;
    videoBaseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;

    videoBaseTexture.source.addEventListener(`loadedmetadata`, () => {
      const sprite = new PIXI.Sprite(videoTex);

      this.app.stage.addChild(sprite);

      const videoWidth = videoBaseTexture.source.videoWidth;
      const videoHeight = videoBaseTexture.source.videoHeight;

      videoBaseTexture.source.muted = true;

      if (this.app.renderer.width / this.app.renderer.height < videoWidth / videoHeight) {
        sprite.width = this.app.renderer.width;
        sprite.height = (videoHeight / videoWidth) * this.app.renderer.width;
      } else {
        sprite.width = (videoWidth / videoHeight) * this.app.renderer.height;
        sprite.height = this.app.renderer.height;
      }

      sprite.anchor.x = .5;
      sprite.anchor.y = .5;

      sprite.x = this.app.renderer.width / 2;
      sprite.y = this.app.renderer.height / 2;
    });
  }
}
