import {EventEmitter, Injectable} from '@angular/core';

@Injectable()
export class DevicesService {
  public audioInputs: MediaDeviceInfo[] = [];
  public videoInputs: MediaDeviceInfo[] = [];
  public audioOutputs: MediaDeviceInfo[] = [];

  stream: EventEmitter<MediaStream> = new EventEmitter();

  constructor() {
    navigator.mediaDevices.enumerateDevices().then(deviceInfos => {
      this.audioInputs  = deviceInfos.filter((info) => info.kind == "audioinput");
      this.videoInputs  = deviceInfos.filter((info) => info.kind == "videoinput");
      this.audioOutputs = deviceInfos.filter((info) => info.kind == "audiooutput");
    });
  }
}
