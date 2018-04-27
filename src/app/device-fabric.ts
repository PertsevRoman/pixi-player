import {Observable} from "rxjs/Observable";
import {isString} from "util";
import {forkJoin} from "rxjs/observable/forkJoin";

type VideoType = string | "fake" | "screen";
type AudioDeviceType = string | "fake";

const FAKE_VIDEO_PATH = `/assets/chroma.mp4`;
const FAKE_AUDIO_PATH = `/assets/nature.aac`;

/**
 *
 * @param {string} url
 * @return {any}
 */
const xmlLoadMedia = (url: string): Observable<string> => {
  return Observable.create(observer => {
    let req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.responseType = "blob";

    req.onload = function() {
      let self = this as any;

      if (self.status == 200) {
        const videoBlob = URL.createObjectURL(self.response);

        observer.next(videoBlob);
        observer.complete();
      }
    };

    req.onerror = (err) => {
      observer.error(err);
    };

    req.send();
  });
};

/**
 *
 * @param {HTMLMediaElement} element
 * @return {MediaStream}
 */
export const captureStream = (element: any): MediaStream => {
  if (element.captureStream) {
    return (element as any).captureStream();
  } else if (element.mozCaptureStream) {
    return (element as any).mozCaptureStream();
  }
};

/**
 *
 * @param {AudioDeviceType} audioDevice
 */
const makeAudioTrack = (audioDevice: AudioDeviceType): Observable<MediaStreamTrack> => {
  return Observable.create(observer => {
    if (audioDevice == "fake") {
      const fakeAudio = document.createElement('audio');

      const audioReadyListener = () => {
        const fakeStream: MediaStream = captureStream(fakeAudio);
        const audioTracks = fakeStream.getAudioTracks();
        if (audioTracks.length) {
          observer.next(audioTracks[0]);
          observer.complete();
        } else {
          observer.error(`fake audio has no audio tracks`);
        }
      };

      fakeAudio.addEventListener('canplay', audioReadyListener);

      fakeAudio.setAttribute('autoplay', `autoplay`);
      fakeAudio.setAttribute('loop', `loop`);
      fakeAudio.setAttribute('src', FAKE_AUDIO_PATH);
    } else if (isString(audioDevice)) {
      navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          deviceId: audioDevice
        }
      }).then((stream) => {
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length) {
          observer.next(audioTracks[0]);
          observer.complete();
        } else {
          observer.error(`getUserMedia() not returned audio tracks`);
        }
      });
    }
  });
};

/**
 *
 * @param {VideoType} videoDevice
 * @return {Observable<MediaStreamTrack>}
 */
const makeVideoTrack = (videoDevice: VideoType): Observable<MediaStreamTrack> => {
  return Observable.create(observer => {
    if (videoDevice == "fake") {
      const fakeVideo = document.createElement('video');

      const videoReadyListener = () => {
        fakeVideo.muted = true;
        const fakeStream: MediaStream = captureStream(fakeVideo);
        const videoTracks = fakeStream.getVideoTracks();
        if (videoTracks.length) {
          observer.next(videoTracks[0]);
          observer.complete();
        } else {
          observer.error(`fake video has no video tracks`);
        }
      };

      fakeVideo.addEventListener('canplay', videoReadyListener);
      fakeVideo.setAttribute('autoplay', `autoplay`);
      fakeVideo.setAttribute('loop', `loop`);
      fakeVideo.setAttribute('src', FAKE_VIDEO_PATH);
    } else if (videoDevice == "screen") {
      // capture screen
    } else if (isString(videoDevice)) {
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          deviceId: videoDevice
        }
      }).then((stream) => {
        const videoTracks = stream.getVideoTracks();

        if (videoTracks.length) {
          observer.next(videoTracks[0]);
          observer.complete();
        } else {
          observer.error(`getUserMedia() not returned video tracks`);
        }
      }).catch(err => {
        observer.error(err);
      });
    }
  });
};

/**
 *
 * @param {VideoType} videoDevice
 * @param {AudioDeviceType} audioDevice
 * @return {Observable<MediaStream>}
 */
export const makeDeviceMediaStream = (videoDevice: VideoType, audioDevice: AudioDeviceType = null): Observable<MediaStream> => {
  return Observable.create(observer => {
    const mediaStream = new MediaStream();

    const revieveTracksCallback = (tracks) => {
      tracks.forEach(track => {
        mediaStream.addTrack(track);
      });

      observer.next(mediaStream);
      observer.complete();
    };

    if (audioDevice) {
      forkJoin<MediaStreamTrack, MediaStreamTrack>(
        makeAudioTrack(audioDevice),
        makeVideoTrack(videoDevice),
      ).subscribe(revieveTracksCallback);
    } else {
      forkJoin<MediaStreamTrack>(
        makeVideoTrack(videoDevice),
      ).subscribe(revieveTracksCallback);
    }
  });
};

/**
 *
 * @param {VideoType} videoDevice
 * @param {AudioDeviceType} audioDevide
 * @return {Observable<HTMLVideoElement>}
 */
export const makeDeviceVideo = (videoDevice: VideoType, audioDevide: AudioDeviceType = null): Observable<HTMLVideoElement> => {
  return Observable.create(observer => {
    makeDeviceMediaStream(videoDevice, audioDevide).subscribe(mediaStream => {
      const video = document.createElement('video');
      video.setAttribute('autoplay', 'autoplay');
      video.srcObject = mediaStream;

      const loadedVideoCallback = () => {
        observer.next(video);
        observer.complete();
      };

      loadedVideoCallback();
    });
  });
};

/**
 *
 * @param {string} url
 * @param autoplay
 */
export const makeUrlVideo = (url: string) => {
  return Observable.create(observer => {
    const video = document.createElement('video');

    xmlLoadMedia(url).subscribe(blob => {
      video.src = blob;

      observer.next(video);
      observer.complete();
    });
  });
};
