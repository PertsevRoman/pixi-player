import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DevicesService} from "./devices.service";
import {Observable} from "rxjs/Observable";

import * as PIXI from 'pixi.js';
import {makeDeviceVideo} from "./device-fabric";

const LOADED_METADATA_EVENT = `loadedmetadata`;

/**
 *
 * @param {HTMLVideoElement} video
 * @param {number} rendererWidth
 * @param {number} rendererHeight
 * @param {boolean} muted
 */
const initBackgroundTexture = (video: HTMLVideoElement, rendererWidth: number, rendererHeight: number, muted = false) => {
  return Observable.create(observer => {
    const texture = PIXI.Texture.fromVideo(video);

    const videoBaseTexture = texture.baseTexture as PIXI.VideoBaseTexture;

    const videoReadyCallback = () => {
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
    };

    if (videoBaseTexture.source.readyState) {
      videoReadyCallback();
    } else {
      videoBaseTexture.source.addEventListener(LOADED_METADATA_EVENT, videoReadyCallback);
    }
  });
};

/**
 *
 * @param url
 * @param rendererWidth
 * @param rendererHeight
 * @param muted
 * @return {Observable<PIXI.Sprite>}
 */
const initVideoTexture = (url: string, rendererWidth: number, rendererHeight: number, muted = false): Observable<PIXI.Sprite> => {
  const video = document.createElement('video');
  video.setAttribute(`src`, url);
  video.setAttribute('autoplay', `autoplay`);
  video.setAttribute('loop', `loop`);

  return initBackgroundTexture(video, rendererWidth, rendererHeight, muted);
};

/**
 *
 * @param {HTMLVideoElement} video
 * @param {number} rendererWidth
 * @param {number} rendererHeight
 * @param {number} backgroundHeight
 * @param muted
 * @return {any}
 */
const initCameraTexture = (video: HTMLVideoElement, rendererWidth: number, rendererHeight: number, backgroundHeight: number = 0, muted = false) => {
  return Observable.create(observer => {
    const camTex = PIXI.Texture.fromVideo(video);
    const videoBaseTexture = camTex.baseTexture as PIXI.VideoBaseTexture;

    if (!backgroundHeight) {
      return initBackgroundTexture(video, rendererWidth, rendererHeight, muted);
    }

    const videoReadyCallback = () => {
      const cameraSprite = new PIXI.Sprite(camTex);

      const videoWidth = videoBaseTexture.source.videoWidth;
      const videoHeight = videoBaseTexture.source.videoHeight;

      cameraSprite.width = 200;
      cameraSprite.height = 200 / (videoWidth / videoHeight);

      cameraSprite.anchor.x = 1;
      cameraSprite.anchor.y = 1;

      cameraSprite.x = rendererWidth;
      cameraSprite.y = rendererHeight - (rendererHeight - backgroundHeight) / 2;

      observer.next(cameraSprite);
    };

    if (videoBaseTexture.source.readyState) {
      videoReadyCallback();
    } else {
      videoBaseTexture.source.addEventListener(LOADED_METADATA_EVENT, videoReadyCallback);
    }
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

  constructor() { }

  ngOnInit() {
    this.app = new PIXI.Application({
      view: this.canvas.nativeElement,
      antialias: true,
      width: this.canvasWidth,
      height: this.canvasHeight
    });

    const container = new PIXI.Container();
    this.app.stage.addChild(container);

    initVideoTexture(this.videoUrls[0], this.app.renderer.width, this.app.renderer.height, true).subscribe(backSprite => {
      (backSprite as any).zOrder = 1;
      container.addChild(backSprite);


      makeDeviceVideo("fake").subscribe(video => {
        initCameraTexture(video, this.app.renderer.width,
          this.app.renderer.height, backSprite.height).subscribe(camSprite => {
          (camSprite as any).zOrder = 2;
          container.addChild(camSprite);
        });
      });
    });
  }
}
