import {Injectable} from '@angular/core';

@Injectable()
export class DevicesService {
  // устройства
  private audioInputs: MediaDeviceInfo[] = [];
  private videoInputs: MediaDeviceInfo[] = [];
  private audioOutputs: MediaDeviceInfo[] = [];

  // медиапоток
  private mediaStream: MediaStream = new MediaStream();

  // видео
  public video: HTMLVideoElement = document.createElement('video');

  constructor() {
    this.video.srcObject = this.mediaStream;

    navigator.mediaDevices.enumerateDevices().then(deviceInfos => {
      this.audioInputs  = deviceInfos.filter((info) => info.kind == "audioinput");
      this.videoInputs  = deviceInfos.filter((info) => info.kind == "videoinput");
      this.audioOutputs = deviceInfos.filter((info) => info.kind == "audiooutput");

      if (!this.videoInputs.length) {
        const fakeVideo = document.createElement('video');
        fakeVideo.setAttribute('src', `/assets/chroma.mp4`);
        fakeVideo.setAttribute('autoplay', `autoplay`);
        fakeVideo.setAttribute('loop', `loop`);
        fakeVideo.muted = true;

        fakeVideo.addEventListener('loadedmetadata', () => {
          const fakeStream: MediaStream = (fakeVideo as any).captureStream();
          this.mediaStream.addTrack(fakeStream.getVideoTracks()[0]);
        });
      } else {
        navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            deviceId: this.videoInputs[0].deviceId
          }
        }).then((stream) => {
          this.mediaStream.addTrack(stream.getVideoTracks()[0]);
        });
      }
    });

    if (this.audioInputs.length) {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          deviceId: this.audioInputs[0].deviceId
        }
      }).then((stream) => {
        this.mediaStream.addTrack(stream.getAudioTracks()[0])
      });
    }
  }
}
