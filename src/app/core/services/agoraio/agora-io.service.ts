import { Injectable, OnInit } from '@angular/core';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
  UID,
} from 'agora-rtc-sdk-ng';
import { dateNowToSeconds } from '@functions/date.function';
import { HttpService } from '@services/http/http.service';
import { environment } from '@environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class AgoraIoService implements OnInit {
  isVideoEnabled: boolean = true;
  isAudioEnabled: boolean = true;
  isSpeakerEnabled: boolean = false;
  isRemoteAudioEnabled: boolean = true;

  speakers: MediaDeviceInfo[] = [];
  earphones: MediaDeviceInfo[] = [];
  facingMode: string = 'user';

  callTimeInterval!: number | NodeJS.Timeout;
  callTime: number = 0;
  callDate!: number;

  localStreamAudio!: IMicrophoneAudioTrack;
  localStreamVideo!: ICameraVideoTrack;
  remoteStreamAudio!: IRemoteAudioTrack;
  remoteStreamVideo!: IRemoteVideoTrack;
  isVideoCall: boolean = true;

  client!: IAgoraRTCClient;
  params: { uid: UID } = { uid: '' };

  constructor(private httpService: HttpService) {
    AgoraRTC.setLogLevel(4);
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'h264' });
    this.getAudiosOutput();
  }

  ngOnInit() {}

  handleJoinChannel(payload: { channel: string; uid: number }) {
    this.httpService.post('AgoraIo', payload).subscribe(async ({ data }) => {
      const uid = await this.client.join(
        environment.agora.AppID,
        data?.channel,
        data?.token,
        Number(data?.uid)
      );
      this.params.uid = uid;
      this.assignRemoteStreamHandlers();

      setTimeout(() => {
        this.client.publish(
          this.isVideoCall
            ? [this.localStreamAudio, this.localStreamVideo]
            : this.localStreamAudio
        );
      }, 1000);
    });
  }

  async assignLocalStreamHandlers(video: boolean = true): Promise<void> {
    this.isVideoCall = video;
    if (this.isVideoCall) {
      const [localAudioTrack, localVideoTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks();
      this.localStreamAudio = localAudioTrack;
      this.localStreamVideo = localVideoTrack;
      this.localStreamVideo.play('local-stream');
    } else {
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      this.localStreamAudio = localAudioTrack;
    }
  }

  private assignRemoteStreamHandlers(): void {
    // this.client.on('connection-state-change', (curState: ConnectionState) => {
    //   console.log('connection-state-change =>', curState);
    // });

    // this.client.on('user-joined', (user: IAgoraRTCRemoteUser) => {
    //   console.log('user-joined =>', user);
    // });

    // this.client.on('user-left', (user: IAgoraRTCRemoteUser) => {
    //   console.log('user-left =>', user);
    // });

    this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);

      if (mediaType === 'video') {
        user.videoTrack?.play('remote-stream');
        this.remoteStreamVideo = user.videoTrack as IRemoteVideoTrack;
      }

      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }

      this.remoteStreamAudio = user.audioTrack as IRemoteAudioTrack;
    });

    this.client.on('user-unpublished', (event: IAgoraRTCRemoteUser) => {
      this.isRemoteAudioEnabled = true;
    });

    // this.client.on('user-info-updated', (uid: UID) => {
    //   console.log('user-info-updated =>', uid);
    // });

    // this.client.on('media-reconnect-start', (uid: UID) => {
    //   console.log('media-reconnect-start =>', uid);
    // });

    // this.client.on('media-reconnect-end', (uid: UID) => {
    //   console.log('media-reconnect-end =>', uid);
    // });

    // this.client.on('stream-type-changed', (uid: UID) => {
    //   console.log('stream-type-changed =>', uid);
    // });

    // this.client.on('stream-fallback', (uid: UID) => {
    //   console.log('stream-fallback =>', uid);
    // });

    // this.client.on(
    //   'channel-media-relay-state',
    //   (state: ChannelMediaRelayState) => {
    //     console.log('channel-media-relay-state =>', state);
    //   }
    // );

    // this.client.on(
    //   'channel-media-relay-event',
    //   (event: ChannelMediaRelayEvent) => {
    //     console.log('channel-media-relay-event =>', event);
    //   }
    // );

    // this.client.on(
    //   'volume-indicator',
    //   (result: { level: number; uid: UID }) => {
    //     console.log('volume-indicator =>', result);
    //   }
    // );

    // this.client.on('crypt-error', (event: () => {}) => {
    //   console.log('crypt-error =>', event);
    // });

    // this.client.on('token-privilege-will-expire', (event: () => {}) => {
    //   console.log('token-privilege-will-expire =>', event);
    // });

    // this.client.on('token-privilege-did-expire', (event: () => {}) => {
    //   console.log('token-privilege-did-expire =>', event);
    // });

    // this.client.on('network-quality', (stats: NetworkQuality) => {
    //   console.log('network-quality =>', stats);
    // });

    // this.client.on('live-streaming-error', (url: string) => {
    //   console.log('live-streaming-error =>', url);
    // });

    // this.client.on('live-streaming-warning', (url: string) => {
    //   console.log('live-streaming-warning =>', url);
    // });

    // this.client.on(
    //   'exception',
    //   (event: { code: number; msg: string; uid: UID }) => {
    //     console.log('exception =>', event);
    //   }
    // );

    // this.client.on('is-using-cloud-proxy', (isUsingProxy: boolean) => {
    //   console.log('is-using-cloud-proxy =>', isUsingProxy);
    // });

    // this.client.on('join-fallback-to-proxy', (proxyServer: string) => {
    //   console.log('join-fallback-to-proxy =>', proxyServer);
    // });

    // this.client.on('published-user-list', (users: IAgoraRTCRemoteUser[]) => {
    //   console.log('published-user-list =>', users);
    // });
  }

  handleToggleVideo(): void {
    this.isVideoEnabled = !this.isVideoEnabled;
    this.isVideoEnabled
      ? this.localStreamVideo.setEnabled(true)
      : this.localStreamVideo.setEnabled(false);
  }

  handleToggleAudio(): void {
    this.isAudioEnabled = !this.isAudioEnabled;
    this.isAudioEnabled
      ? this.localStreamAudio.setMuted(false)
      : this.localStreamAudio.setMuted(true);
  }

  async handleToggleCamera(): Promise<void> {
    const videoDevices = await AgoraRTC.getCameras();
    if (videoDevices.length > 1) {
      this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
      const device =
        this.facingMode === 'user'
          ? videoDevices[0]
          : videoDevices[videoDevices.length - 1];
      (<MediaStreamTrack>this.localStreamVideo.getMediaStreamTrack()).stop();
      this.localStreamVideo.setDevice(device.deviceId);
    }
  }

  handleToggleSpeaker(): void {
    if (this.remoteStreamAudio) {
      this.isSpeakerEnabled = !this.isSpeakerEnabled;

      this.remoteStreamAudio.setPlaybackDevice(
        this.isSpeakerEnabled
          ? this.speakers[0]?.deviceId
          : this.earphones[0]?.deviceId
      );
    }
  }

  handleToggleRemoteAudio(): void {
    this.isRemoteAudioEnabled = !this.isRemoteAudioEnabled;
    if (this.remoteStreamAudio) {
      this.isRemoteAudioEnabled
        ? this.remoteStreamAudio.setVolume(100)
        : this.remoteStreamAudio.setVolume(0);
    }
  }

  handleEndCall(): void {
    if (this.remoteStreamAudio) {
      if (this.isVideoCall) {
        this.localStreamVideo?.stop();
        this.localStreamVideo?.close();
      }

      this.localStreamAudio?.stop();
      this.localStreamAudio?.close();
      this.client.leave();
    }

    this.callTime = 0;
    this.resetFeatures();
    clearInterval(this.callTimeInterval);
  }

  resetFeatures(): void {
    this.isAudioEnabled = true;
    this.isVideoEnabled = true;
    this.isSpeakerEnabled = false;
  }

  getAudiosOutput(): void {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices: MediaDeviceInfo[]) => {
        const outputs: MediaDeviceInfo[] = devices.filter(
          (item: MediaDeviceInfo) => item.kind === 'audiooutput'
        );
        this.speakers = outputs.filter((item) =>
          item.label.includes('Altofalantes')
        );
        this.earphones = outputs.filter(
          (item) => !item.label.includes('Altofalantes')
        );
      });
  }

  handleCallTime() {
    const time = this.callDate;
    const now = dateNowToSeconds();
    const diff = now - time;
    const seconds = Math.floor(diff);
    this.callTime = seconds;

    this.callTimeInterval = setInterval(() => {
      this.callTime++;
    }, 1000);
  }
}
