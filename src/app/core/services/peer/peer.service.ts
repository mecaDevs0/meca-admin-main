import { Injectable, OnInit } from '@angular/core';
import { MediaConnection, Peer, PeerError } from 'peerjs';
import { environment } from '@environments/environment';
import { CONFIG_BASE } from '@core/config';
import { AlertMessages } from '@classes/AlertMessages';

interface ICurrentAttendance {
  clientPeerId: string;
}

@Injectable({
  providedIn: 'root',
})
export class PeerService implements OnInit {
  peer!: Peer | null;
  call!: MediaConnection | null;

  remoteStream!: MediaStream;
  sourceStream!: MediaStream;

  remoteVideo!: HTMLMediaElement;
  sourceVideo!: HTMLMediaElement;

  remoteRecorder!: MediaRecorder | null;
  sourceRecorder!: MediaRecorder | null;

  remoteChunks: Blob[] = [];
  sourceChunks: Blob[] = [];

  url: string = `/${CONFIG_BASE.appName}/${environment.name}/`;
  interval!: number | NodeJS.Timeout;
  currentAttendance!: ICurrentAttendance;
  peerId!: string;

  isVideoEnabled: boolean = true;
  isAudioEnabled: boolean = true;
  isSpeakerEnabled: boolean = false;
  isRemoteAudioEnabled: boolean = true;
  alreadyLoaded: boolean = false;

  configMedia = {
    video: {
      width: 640,
      height: 360,
      frameRate: {
        ideal: 30,
        min: 15,
      },
    },
    audio: true,
  };

  constructor() {}

  ngOnInit() {}

  getSourceStream() {
    return new Promise((resolve, reject) => {
      this.sourceVideo = document.getElementById(
        'sourceVideo'
      ) as HTMLMediaElement;
      this.remoteVideo = document.getElementById(
        'remoteVideo'
      ) as HTMLMediaElement;

      navigator.mediaDevices
        .getUserMedia(this.configMedia)
        .then((stream) => {
          this.sourceStream = stream;
          this.sourceVideo.srcObject = stream;
          this.sourceVideo.muted = true;

          const isPlaying =
            this.sourceVideo?.currentTime > 0 &&
            !this.sourceVideo.paused &&
            !this.sourceVideo.ended &&
            this.sourceVideo.readyState > this.sourceVideo.HAVE_CURRENT_DATA;

          if (!isPlaying) {
            const playPromise = this.sourceVideo?.play();
            if (playPromise !== null) {
              playPromise?.catch(() => {
                this.sourceVideo?.play();
              });
            }
          }

          resolve(stream);
        })
        .catch((err) => {
          AlertMessages.error(
            'Não foi possível conectar. Verifique se há outro aplicativo usando sua câmera.'
          );
          reject();
        });
    });
  }

  initPeerJs(peerId: string) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.getSourceStream();
        this.peerId = peerId;
        this.alreadyLoaded = false;

        this.peer = new Peer(`${peerId}`, {
          host: 'peer-sos.viapaulista.com.br',
          port: 9000,
          debug: 3,
          config: {
            iceServers: [
              { urls: 'stun:stun1.l.google.com:19302' },
              {
                urls: 'turn:0.peerjs.com:3478',
                username: 'peerjs',
                credential: 'peerjsp',
              },
            ],
            sdpSemantics: 'unified-plan',
            iceTransportPolicy: 'relay',
          },
        })
          .on('open', (id: string) => {
            setTimeout(() => {
              this.alreadyLoaded = true;
              resolve(this.peer);
            }, 3000);
          })
          .on(
            'error',
            (
              error: PeerError<
                | 'disconnected'
                | 'browser-incompatible'
                | 'invalid-id'
                | 'invalid-key'
                | 'network'
                | 'peer-unavailable'
                | 'ssl-unavailable'
                | 'server-error'
                | 'socket-error'
                | 'socket-closed'
                | 'unavailable-id'
                | 'webrtc'
              >
            ) => {
              if (error.toString().includes('is taken')) {
                AlertMessages.error('Acesso em duplicidade.', true, 0, () => {
                  window.location.reload();
                });
              }

              reject();
            }
          )
          .on('close', () => {
            reject();
          })
          .on('disconnected', (currentId: string) => {
            reject();
          })
          .on('call', (mediaConnection: MediaConnection) => {
            this.call = mediaConnection;
            this.call.answer(this.sourceStream);
            this.callEvents();
          });
      } catch (error) {}
    });
  }

  startCall(currentAttendance: ICurrentAttendance) {
    this.alreadyLoaded = false;
    this.currentAttendance = currentAttendance;
    this.call = this.peer?.call(
      `${currentAttendance?.clientPeerId}`,
      this.sourceStream
    ) as MediaConnection;

    this.callEvents();
  }

  callEvents() {
    if (this.call) {
      this.call
        .on('stream', (remoteStream: MediaStream) => {
          this.remoteStream = remoteStream;
          this.remoteVideo.srcObject = remoteStream;

          const isPlaying =
            this.remoteVideo &&
            this.remoteVideo?.currentTime > 0 &&
            !this.remoteVideo.paused &&
            !this.remoteVideo.ended &&
            this.remoteVideo.readyState > this.remoteVideo.HAVE_CURRENT_DATA;

          if (!isPlaying) {
            const playPromise = this.remoteVideo?.play();
            if (playPromise !== null) {
              playPromise?.catch(() => {
                this.remoteVideo?.play();
              });
            }
          }

          this.alreadyLoaded = true;

          setTimeout(() => {
            this.handleRecorder();
          }, 1000);
        })
        .on(
          'error',
          (error: PeerError<'negotiation-failed' | 'connection-closed'>) => {
            setTimeout(() => {
              this.startCall(this.currentAttendance);
            }, 2000);
          }
        )
        .on('close', () => {
          if (this.call !== null) {
            this.startCall(this.currentAttendance);
          }
        });
    }
  }

  handleRecorder() {
    if (!this.remoteRecorder) {
      this.remoteRecorder = new MediaRecorder(this.remoteStream);
      this.sourceRecorder = new MediaRecorder(this.sourceStream);

      this.remoteRecorder.ondataavailable = (ev: BlobEvent) => {
        this.remoteChunks.push(ev.data);
      };

      this.sourceRecorder.ondataavailable = (source) => {
        this.sourceChunks.push(source.data);
      };

      setTimeout(() => {
        this.remoteRecorder?.start(1000);
        this.sourceRecorder?.start(1000);
      }, 500);
    }
  }

  handleStopRecorder(): Promise<void> {
    return new Promise((resolve) => {
      this.remoteRecorder?.stop();
      this.sourceRecorder?.stop();
      clearInterval(this.interval);

      setTimeout(() => {
        this.remoteRecorder = null;
        this.sourceRecorder = null;
        resolve();
      }, 1000);
    });
  }

  deleteChunks() {
    this.sourceChunks = [];
    this.remoteChunks = [];
  }

  handleToggleVideo() {
    this.isVideoEnabled = !this.isVideoEnabled;
    this.sourceStream.getVideoTracks()[0].enabled = this.isVideoEnabled;
  }

  handleToggleAudio() {
    this.isAudioEnabled = !this.isAudioEnabled;
    this.sourceStream.getAudioTracks()[0].enabled = this.isAudioEnabled;
  }

  handleToggleRemoteAudio() {
    this.isRemoteAudioEnabled = !this.isRemoteAudioEnabled;
    if (this.remoteStream) {
      this.remoteStream.getAudioTracks()[0].enabled = this.isRemoteAudioEnabled;
    }
  }

  ngOnDestroy() {
    this.alreadyLoaded = false;
    this.sourceStream
      ?.getTracks()
      ?.forEach((track: MediaStreamTrack) => track.stop());
    this.remoteStream
      ?.getTracks()
      ?.forEach((track: MediaStreamTrack) => track.stop());
    this.remoteChunks = [];
    this.sourceChunks = [];
    this.call = null;
    this.peer?.disconnect();
    this.peer?.destroy();
    this.peer = null;
    this.isAudioEnabled = true;
    this.isVideoEnabled = true;
    this.isRemoteAudioEnabled = true;
  }
}
