import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs/Observable";

import * as PIXI from 'pixi.js';
import {makeDeviceVideo, makeUrlVideo} from "./device-fabric";
import {forkJoin} from "rxjs/observable/forkJoin";

const LOADED_METADATA_EVENT = `loadedmetadata`;


/**
 *
 * @param {PIXI.Sprite} cameraSprite
 * @return {}
 */
const getVideoSpriteOriginals = (cameraSprite: PIXI.Sprite) => {
  const texture = cameraSprite.texture;
  const baseTexture = texture.baseTexture as PIXI.VideoBaseTexture;

  return {
    videoWidth: baseTexture.source.videoWidth,
    videoHeight: baseTexture.source.videoHeight
  };
};

/**
 *
 * @param {PIXI.Sprite} backgroundSprite
 * @param {number} rendererWidth
 * @param {number} rendererHeight
 */
const backgroundPosite = function (backgroundSprite: PIXI.Sprite, rendererWidth: number, rendererHeight: number) {
  const {videoWidth, videoHeight} = getVideoSpriteOriginals(backgroundSprite);

  if (rendererWidth / rendererHeight < videoWidth / videoHeight) {
    backgroundSprite.width = rendererWidth;
    backgroundSprite.height = (videoHeight / videoWidth) * rendererWidth;
  } else {
    backgroundSprite.width = (videoWidth / videoHeight) * rendererHeight;
    backgroundSprite.height = rendererHeight;
  }

  backgroundSprite.anchor.set(.5, .5);

  backgroundSprite.x = rendererWidth / 2;
  backgroundSprite.y = rendererHeight / 2;
};



/**
 *
 * @param {PIXI.Sprite} cameraSprite
 * @param {number} rendererWidth
 * @param {number} rendererHeight
 * @param {number} backgroundHeight
 */
const cameraPosite = function (cameraSprite: PIXI.Sprite, rendererWidth: number, rendererHeight: number, backgroundHeight: number) {
  const {videoWidth, videoHeight} = getVideoSpriteOriginals(cameraSprite);

  const spriteWidth = rendererWidth / 4;
  cameraSprite.width = spriteWidth;
  cameraSprite.height = spriteWidth / (videoWidth / videoHeight);

  cameraSprite.anchor.x = 1;
  cameraSprite.anchor.y = 1;

  cameraSprite.x = rendererWidth;
  cameraSprite.y = rendererHeight - (rendererHeight - backgroundHeight) / 2;
};

/**
 *
 * @param {HTMLVideoElement} video
 * @return {any}
 */
const initVideoTexture = (video: HTMLVideoElement) => {
  return Observable.create(observer => {
    const texture = PIXI.Texture.fromVideo(video);

    const videoReadyCallback = () => {
      const cameraSprite = new PIXI.Sprite(texture);

      observer.next(cameraSprite);
      observer.complete();
    };

    if (video.readyState) {
      videoReadyCallback();
    } else {
      video.addEventListener(LOADED_METADATA_EVENT, videoReadyCallback);
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

    const RENDERER_WIDTH = this.app.renderer.width;
    const RENDERER_HEIGHT = this.app.renderer.height;

    forkJoin<HTMLVideoElement, HTMLVideoElement>(
      makeUrlVideo(this.videoUrls[0], true),
      makeDeviceVideo("fake"),
    ).subscribe(([backVideo, camVideo]) => {
      backVideo.muted = true;
      forkJoin<PIXI.Sprite, PIXI.Sprite>(
        initVideoTexture(backVideo),
        initVideoTexture(camVideo),
      ).subscribe(([backSprite, camSprite]) => {
        backgroundPosite(backSprite, RENDERER_WIDTH, RENDERER_HEIGHT);
        cameraPosite(camSprite, RENDERER_WIDTH, RENDERER_HEIGHT, backSprite.height);

        (backSprite as any).zOrder = 1;
        (camSprite as any).zOrder = 2;

        container.addChild(backSprite);
        container.addChild(camSprite);
      });
    });
  }
}
