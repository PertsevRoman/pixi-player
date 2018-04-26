import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DevicesService} from "./devices.service";
import {Observable} from "rxjs/Observable";

import * as PIXI from 'pixi.js';

/**
 *
 * @param url
 * @param rendererWidth
 * @param rendererHeight
 * @param muted
 * @return {Observable<PIXI.Sprite>}
 */
const initVideoTexture = (url: string, rendererWidth: number, rendererHeight: number, muted = false): Observable<PIXI.Sprite> => {
  return Observable.create(observer => {
    const texture = PIXI.Texture.fromVideoUrl(url);

    const videoBaseTexture = texture.baseTexture as PIXI.VideoBaseTexture;

    videoBaseTexture.source.addEventListener(`loadedmetadata`, () => {
      const videoSprite = new PIXI.Sprite(texture);

      const videoWidth = videoBaseTexture.source.videoWidth;
      const videoHeight = videoBaseTexture.source.videoHeight;

      videoBaseTexture.source.muted = muted;

      if (rendererWidth / rendererHeight < videoWidth / videoHeight) {
        videoSprite.width = rendererWidth;
        videoSprite.height = (videoHeight / videoWidth) * rendererWidth;
      } else {
        videoSprite.width = (videoWidth / videoHeight) * rendererHeight;
        videoSprite.height = rendererHeight;
      }

      videoSprite.anchor.x = .5;
      videoSprite.anchor.y = .5;

      videoSprite.x = rendererWidth / 2;
      videoSprite.y = rendererHeight / 2;

      observer.next(videoSprite);
    });
  });
};

/**
 *
 * @param {HTMLVideoElement} camVideo
 * @param {number} appWidth
 * @param {number} appHeight
 * @param {number} backgroundHeight
 * @return {any}
 */
const initCameraTexture = (camVideo: HTMLVideoElement, appWidth: number, appHeight: number, backgroundHeight: number) => {
  return Observable.create(observer => {
    const camTex = PIXI.Texture.fromVideo(camVideo);
    const videoBaseTexture = camTex.baseTexture as PIXI.VideoBaseTexture;

    videoBaseTexture.source.addEventListener(`loadedmetadata`, () => {
      const cameraSprite = new PIXI.Sprite(camTex);

      const videoWidth = videoBaseTexture.source.videoWidth;
      const videoHeight = videoBaseTexture.source.videoHeight;

      cameraSprite.width = 200;
      cameraSprite.height = 200 / (videoWidth / videoHeight);

      cameraSprite.anchor.x = 1;
      cameraSprite.anchor.y = 1;

      cameraSprite.x = appWidth;
      cameraSprite.y = appHeight - (appHeight - backgroundHeight) / 2;

      observer.next(cameraSprite);
    });
  });
};

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

  constructor(private devicesService: DevicesService) { }

  ngOnInit() {
    this.app = new PIXI.Application({
      view: this.canvas.nativeElement,
      antialias: true,
      width: this.canvasWidth,
      height: this.canvasHeight
    });

    const container  = new PIXI.Container();
    this.app.stage.addChild(container);

    initVideoTexture(this.videoUrls[0], this.app.renderer.width, this.app.renderer.height, true).subscribe(backSprite => {
      (backSprite as any).zOrder = 1;
      container.addChild(backSprite);

      initCameraTexture(this.devicesService.video, this.app.renderer.width,
        this.app.renderer.height, backSprite.height).subscribe(camSprite => {
        (camSprite as any).zOrder = 2;
        container.addChild(camSprite);
      });
    });
  }
}
