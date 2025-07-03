import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import pixelmatch from 'pixelmatch';
import { ReportIssue } from '@/types';

const FFMPEG_CORE_VERSION = "0.12.6";

// Helper to draw image data onto a canvas
const getPixelData = (
  imgData: ArrayBuffer,
  width: number,
  height: number
): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Could not get canvas context'));

    const blob = new Blob([imgData], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const pixelData = ctx.getImageData(0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(pixelData);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
};

export const analyzeVideoClientSide = async (
  file: File,
  progressCallback: (message: string, value: number) => void
): Promise<{ score: number; summary: string; issues: ReportIssue[] }> => {
  const ffmpeg = new FFmpeg();
  const issues: ReportIssue[] = [];
  let score = 100;

  ffmpeg.on('log', ({ message }) => {
    // You can use this to see detailed ffmpeg logs in the console
    // console.log(message);
  });

  ffmpeg.on('progress', ({ progress }) => {
    // This reports progress for a single ffmpeg.exec command
    progressCallback('Analyzing frames...', 20 + Math.round(progress * 50)); // Scale progress to fit our 20-70% range
  });

  try {
    progressCallback('Loading analysis engine...', 5);
    const baseURL = `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm`;
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    progressCallback('Engine loaded. Preparing video...', 20);

    await ffmpeg.writeFile(file.name, await fetchFile(file));

    // Extract two frames for comparison (e.g., at 1s and 2s)
    // Note: This assumes the video is at least 2 seconds long. A real app would need more robust logic.
    const frame1Path = 'frame1.jpg';
    const frame2Path = 'frame2.jpg';
    const frameWidth = 640;
    const frameHeight = 360;

    await ffmpeg.exec(['-i', file.name, '-ss', '00:00:01', '-vframes', '1', '-s', `${frameWidth}x${frameHeight}`, '-q:v', '2', frame1Path]);
    const frame1Data = await ffmpeg.readFile(frame1Path);

    await ffmpeg.exec(['-i', file.name, '-ss', '00:00:02', '-vframes', '1', '-s', `${frameWidth}x${frameHeight}`, '-q:v', '2', frame2Path]);
    const frame2Data = await ffmpeg.readFile(frame2Path);

    progressCallback('Comparing frames...', 75);
    const pixelData1 = await getPixelData(frame1Data as ArrayBuffer, frameWidth, frameHeight);
    const pixelData2 = await getPixelData(frame2Data as ArrayBuffer, frameWidth, frameHeight);

    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = frameWidth;
    diffCanvas.height = frameHeight;
    const diffCtx = diffCanvas.getContext('2d');
    if (!diffCtx) throw new Error('Could not get diff canvas context');

    const mismatchedPixels = pixelmatch(
      pixelData1.data,
      pixelData2.data,
      diffCtx.createImageData(frameWidth, frameHeight).data,
      frameWidth,
      frameHeight,
      { threshold: 0.1 }
    );

    const totalPixels = frameWidth * frameHeight;
    const differencePercentage = (mismatchedPixels / totalPixels) * 100;

    if (differencePercentage > 5) {
      score -= 40;
      issues.push({
        timestamp: '00:00:01-00:00:02',
        description: `High visual difference (${differencePercentage.toFixed(2)}%) between frames, suggesting a potential cut or splice.`,
        severity: 'high',
      });
    } else if (differencePercentage > 1) {
      score -= 15;
      issues.push({
        timestamp: '00:00:01-00:00:02',
        description: `Moderate visual difference (${differencePercentage.toFixed(2)}%) between frames detected.`,
        severity: 'medium',
      });
    }

    // Clean up files from ffmpeg's virtual memory
    await ffmpeg.deleteFile(file.name);
    await ffmpeg.deleteFile(frame1Path);
    await ffmpeg.deleteFile(frame2Path);

    progressCallback('Finalizing report...', 95);
    
    let summary = '';
    if (score === 100) {
      summary = 'The video appears to be authentic. Frame-to-frame analysis is consistent.';
    } else if (score >= 85) {
      summary = 'The video appears to be largely authentic. Some minor inconsistencies were found between frames.';
    } else {
      summary = 'The video shows significant inconsistencies between frames that could indicate tampering. Manual review is highly recommended.';
    }

    return { score, summary, issues };
  } catch (error) {
    console.error(error);
    throw new Error('Video analysis failed. The file might be corrupted or in an unsupported format.');
  } finally {
    if (ffmpeg.loaded) {
      ffmpeg.terminate();
    }
  }
};