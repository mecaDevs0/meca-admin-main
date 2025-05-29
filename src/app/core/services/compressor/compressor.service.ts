import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Compressor from 'compressorjs';

interface CompressFileOptions {
  mimeType?: string;
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  resize?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CompressorService {
  compressFile(file: Blob, options?: CompressFileOptions): Observable<Blob> {
    return new Observable((subscriber) => {
      const compressor = new Compressor(file, {
        maxWidth: (options && options.maxWidth) || Infinity,
        maxHeight: (options && options.maxHeight) || Infinity,
        quality: 0.8,
        resize: 'contain',
        mimeType: file.type,
        success: (file: Blob) => {
          subscriber.next(file);
          subscriber.complete();
        },
      });
    });
  }
}
