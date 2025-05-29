import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent implements OnInit {
  @Input() audioUrl!: string;

  private audio!: HTMLAudioElement;

  public interval!: number | NodeJS.Timeout;
  public duration!: number;
  public targetPosition: number = -1;
  public numberDivisionTargetPosition: number = 10.5;
  public loader: boolean = true;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges() {
    if (this.audioUrl) {
      this.audio = new Audio(
        this.audioUrl.includes('base64')
          ? 'data:audio/mp3;base64,' + this.audioUrl.split(',')[1]
          : this.audioUrl
      );
      setTimeout(() => {
        this.handleAudio();
      }, 300);
    }
  }

  handleAudio() {
    this.audio.addEventListener('timeupdate', (ev) => {});

    this.audio.addEventListener('play', (ev) => {
      if (this.targetPosition > 90) {
        this.targetPosition = -1;
      }

      this.interval = setInterval(() => {
        this.getTargetPosition();
      }, 100);
    });

    this.audio.addEventListener('pause', (ev) => {
      clearInterval(this.interval);
      this.numberDivisionTargetPosition -= 0.2;
    });

    this.audio.addEventListener('ended', (ev) => {
      clearInterval(this.interval);
      this.targetPosition = 97;
    });

    this.getDuration((duration: number) => {
      setTimeout(() => {
        this.duration = duration;
        this.audio.volume = 1;
        this.loader = false;
      }, 500);
    });
  }

  getDuration(next: (duration: number) => void) {
    const player = this.audio;
    player.addEventListener(
      'durationchange',
      function (this: HTMLAudioElement) {
        if (this.duration !== Infinity) {
          const duration = this.duration;
          player.remove();
          next(duration);
        }
      },
      false
    );
    player.load();
    player.currentTime = 24 * 60 * 60;
    player.volume = 0;
    player.play().catch((error) => {
      console.error('Error playing the audio:', error);
    });
  }

  getTargetPosition() {
    const targetPosition =
      100 / this.duration / this.numberDivisionTargetPosition;
    if (this.targetPosition < 97) {
      this.targetPosition += targetPosition;
    } else {
      this.targetPosition = 97;
    }
  }

  play() {
    this.audio?.play();
  }

  pause() {
    this.audio?.pause();
  }

  get isPlaying() {
    return !this.audio?.paused;
  }

  get currentTime() {
    return this.audio?.currentTime;
  }

  ngOnDestroy() {
    this.audio.pause();
  }

  stop() {
    const audio = new Audio(this.audioUrl);
    audio.pause();
    audio.currentTime = 0;
  }

  togglePlay() {
    const audio = new Audio(this.audioUrl);
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  get isStopped() {
    const audio = new Audio(this.audioUrl);
    return audio.paused;
  }

  get isPaused() {
    const audio = new Audio(this.audioUrl);
    return audio.paused;
  }

  get isLoading() {
    return !this.audioUrl;
  }

  get isLoaded() {
    return !!this.audioUrl;
  }

  get isError() {
    return !this.audioUrl;
  }

  get errorMessage() {
    return 'Error loading audio';
  }

  get volume() {
    const audio = new Audio(this.audioUrl);
    return audio.volume;
  }

  set volume(value: number) {
    const audio = new Audio(this.audioUrl);
    audio.volume = value;
  }

  get muted() {
    const audio = new Audio(this.audioUrl);
    return audio.muted;
  }

  set muted(value: boolean) {
    const audio = new Audio(this.audioUrl);
    audio.muted = value;
  }

  get loop() {
    const audio = new Audio(this.audioUrl);
    return audio.loop;
  }

  set loop(value: boolean) {
    const audio = new Audio(this.audioUrl);
    audio.loop = value;
  }

  get preload() {
    const audio = new Audio(this.audioUrl);
    return audio.preload;
  }

  get buffered() {
    const audio = new Audio(this.audioUrl);
    return audio.buffered;
  }

  get error() {
    const audio = new Audio(this.audioUrl);
    return audio.error;
  }

  get networkState() {
    const audio = new Audio(this.audioUrl);
    return audio.networkState;
  }

  get readyState() {
    const audio = new Audio(this.audioUrl);
    return audio.readyState;
  }

  get seeking() {
    const audio = new Audio(this.audioUrl);
    return audio.seeking;
  }

  get currentSrc() {
    const audio = new Audio(this.audioUrl);
    return audio.currentSrc;
  }

  get ended() {
    const audio = new Audio(this.audioUrl);
    return audio.ended;
  }

  get paused() {
    const audio = new Audio(this.audioUrl);
    return audio.paused;
  }

  get defaultMuted() {
    const audio = new Audio(this.audioUrl);
    return audio.defaultMuted;
  }

  get defaultPlaybackRate() {
    const audio = new Audio(this.audioUrl);
    return audio.defaultPlaybackRate;
  }

  get playbackRate() {
    const audio = new Audio(this.audioUrl);
    return audio.playbackRate;
  }

  get played() {
    const audio = new Audio(this.audioUrl);
    return audio.played;
  }
}
