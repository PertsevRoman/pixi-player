import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DevicesService} from "./devices.service";
import {Observable} from "rxjs/Observable";

import * as PIXI from 'pixi.js';

// FIXME использовать ng-packagr для упаковки в модули

interface Color {
  r: number;
  g: number;
  b: number;
}

interface YCrCbColor {
  y: number;
  cr: number;
  cb: number;
}

const retranslate = (color: Color): YCrCbColor => {
  let y = 0.2989 * color.r + 0.5866 * color.g + 0.1145 * color.b;
  let cr = 0.7132 * (color.r - y);
  let cb = 0.5647 * (color.b - y);

  return {
    y,
    cr,
    cb
  }
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

const fragmentShader = `
varying vec2 vTextureCoord;

uniform float thresholdSensitivity;
uniform float smoothing;
uniform float y;
uniform float cb;
uniform float cr;

uniform sampler2D uSampler;

void main() {
    vec4 textureColor = texture2D(uSampler, vTextureCoord);

    float Y = 0.2989 * textureColor.r + 0.5866 * textureColor.g + 0.1145 * textureColor.b;
    float Cr = 0.7132 * (textureColor.r - y);
    float Cb = 0.5647 * (textureColor.b - y);

    float blendValue = smoothstep(thresholdSensitivity, smoothing + thresholdSensitivity, distance(vec2(Cr, Cb), vec2(cr, cb)));

    gl_FragColor = vec4(textureColor.rgb, textureColor.a * blendValue);
}
`;

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

    initVideoTexture(this.videoUrls[0], this.app.renderer.width, this.app.renderer.height, true).subscribe(backSprite => {
      this.app.stage.addChild(backSprite);
      backSprite.zOrder = 1;
      initCameraTexture(this.devicesService.video, this.app.renderer.width,
        this.app.renderer.height, backSprite.height).subscribe(camSprite => {
        backSprite.camSprite = 1;

        const color = retranslate({
          r: 0,
          g: 1,
          b: 0
        });

        console.log(color);

        const filter = new PIXI.Filter(null, fragmentShader, {
          thresholdSensitivity: {
            type: 'f',
            value: .08
          },
          smoothing: {
            type: 'f',
            value: .04
          },
          y: {
            type: 'f',
            value: color.y
          },
          cb: {
            type: 'f',
            value: color.cb
          },
          cr: {
            type: 'f',
            value: color.cr
          },
        });

        camSprite.filters = [ filter ];

        this.app.stage.addChild(camSprite);
      });
    });
  }
}
