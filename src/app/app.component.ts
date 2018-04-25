import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as PIXI from 'pixi.js';
import {DevicesService} from "./devices.service";

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

  private videoSprite: PIXI.Sprite = null;
  private cameraSprite: PIXI.Sprite = null;


  constructor(private devicesService: DevicesService) {
  }

  ngOnInit() {
    this.app = new PIXI.Application({
      view: this.canvas.nativeElement,
      antialias: true,
      width: this.canvasWidth,
      height: this.canvasHeight
    });

    this.initVideoTexture();
    this.initCameraSprite();
  }

  private initVideoTexture() {
    const videoTex = PIXI.Texture.fromVideoUrl(this.videoUrls[0]);

    const videoBaseTexture = videoTex.baseTexture as PIXI.VideoBaseTexture;

    videoBaseTexture.source.addEventListener(`loadedmetadata`, () => {
      this.videoSprite = new PIXI.Sprite(videoTex);

      this.app.stage.addChild(this.videoSprite);

      const videoWidth = videoBaseTexture.source.videoWidth;
      const videoHeight = videoBaseTexture.source.videoHeight;

      videoBaseTexture.source.muted = true;

      if (this.app.renderer.width / this.app.renderer.height < videoWidth / videoHeight) {
        this.videoSprite.width = this.app.renderer.width;
        this.videoSprite.height = (videoHeight / videoWidth) * this.app.renderer.width;
      } else {
        this.videoSprite.width = (videoWidth / videoHeight) * this.app.renderer.height;
        this.videoSprite.height = this.app.renderer.height;
      }

      this.videoSprite.anchor.x = .5;
      this.videoSprite.anchor.y = .5;

      this.videoSprite.x = this.app.renderer.width / 2;
      this.videoSprite.y = this.app.renderer.height / 2;
    });
  }

  private initCameraSprite() {
    const camTex = PIXI.Texture.fromVideo(this.devicesService.video);
    const videoBaseTexture = camTex.baseTexture as PIXI.VideoBaseTexture;
    videoBaseTexture.source.addEventListener(`loadedmetadata`, () => {
      this.cameraSprite = new PIXI.Sprite(camTex);

      this.app.stage.addChild(this.cameraSprite);

      const videoWidth = videoBaseTexture.source.videoWidth;
      const videoHeight = videoBaseTexture.source.videoHeight;

      this.cameraSprite.width = 200;
      this.cameraSprite.height = 200 / (videoWidth / videoHeight);

      this.cameraSprite.anchor.x = 1;
      this.cameraSprite.anchor.y = 1;

      this.cameraSprite.x = this.app.renderer.width;
      this.cameraSprite.y = this.app.renderer.height - (this.app.renderer.height - this.videoSprite.height) / 2;
    });

  }
}
