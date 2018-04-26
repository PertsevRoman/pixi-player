import {Observable} from "rxjs/Observable";
import {isString} from "util";

type VideoType = string | "fake" | "screen";
type AudioDeviceType = string | "fake";

const FAKE_VIDEO_PATH = `/assets/chroma.mp4`;
const FAKE_AUDIO_PATH = `/assets/nature.aac`;

/**
 *
 * @param {HTMLMediaElement} element
 * @return {MediaStream}
 */
export const captureStream = (element: HTMLMediaElement): MediaStream => {
  return (element as any).captureStream();
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

    if (videoDevice == "fake") {
      const fakeVideo = document.createElement('video');
      fakeVideo.setAttribute('src', FAKE_VIDEO_PATH);
      fakeVideo.setAttribute('autoplay', `autoplay`);
      fakeVideo.setAttribute('loop', `loop`);
      fakeVideo.muted = true;

      const videoReadyListener = () => {
        const fakeStream: MediaStream = captureStream(fakeVideo);
        const videoTracks = fakeStream.getVideoTracks();
        if (videoTracks.length) {
          const videoTrack = videoTracks[0];
          mediaStream.addTrack(videoTrack);
        } else {
          observer.error(`fake video has no video tracks`);
        }
      };

      if (fakeVideo.readyState) {
        videoReadyListener();
      } else {
        fakeVideo.addEventListener('loadedmetadata', videoReadyListener);
      }
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
          mediaStream.addTrack(videoTracks[0]);
        } else {
          observer.error(`getUserMedia() not returned video tracks`);
        }
      }).catch(err => {
          observer.error(err);
      });
    }

    if (audioDevice == "fake") {
      const fakeAudio = document.createElement('audio');
      fakeAudio.setAttribute('src', FAKE_AUDIO_PATH);
      fakeAudio.setAttribute('autoplay', `autoplay`);
      fakeAudio.setAttribute('loop', `loop`);

      const videoReadyListener = () => {
        const fakeStream: MediaStream = captureStream(fakeAudio);
        const audioTracks = fakeStream.getAudioTracks();
        if (audioTracks.length) {
          mediaStream.addTrack(audioTracks[0]);
        } else {
          observer.error(`fake audio has no audio tracks`);
        }
      };

      if (fakeAudio.readyState) {
        videoReadyListener();
      } else {
        fakeAudio.addEventListener('loadedmetadata', videoReadyListener);
      }
    } else if (isString(audioDevice)) {
      navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          deviceId: audioDevice
        }
      }).then((stream) => {
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length) {
          mediaStream.addTrack(audioTracks[0]);
        } else {
          observer.error(`getUserMedia() not returned audio tracks`);
        }
      });
    }

    observer.next(mediaStream);
    observer.complete();
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
      video.srcObject = mediaStream;

      const loadedVideoCallback = () => {
        observer.next(video);
      };

      if (video.readyState) {
        loadedVideoCallback();
      } else {
        video.addEventListener('loadedmetadata', loadedVideoCallback);
      }
    });
  });
};
