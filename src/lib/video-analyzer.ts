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

// Function to parse HH:MM:SS.ms format to seconds
const parseDuration = (durationStr: string): number => {
  const parts = durationStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseFloat(parts[2]);
  return hours * 3600 + minutes * 60 + seconds;
};

export const analyzeVideoClientSide = async (
  file: File,
  progressCallback: (message: string, value: number) => void
): Promise<{ score: number; summary: string; issues: ReportIssue[] }> => {
  const ffmpeg = new FFmpeg();
  const issues: ReportIssue[] = [];
  let score = 100;
  let duration = 0;

  ffmpeg.on('log', ({ message }) => {
    const durationMatch = message.match(/Duration: ([\d:.]+)/);
    if (durationMatch && durationMatch[1]) {
      duration = parseDuration(durationMatch[1]);
    }
  });

  try {
    progressCallback('Loading analysis engine...', 5);
    const baseURL = `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm`;
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    progressCallback('Preparing video file...', 15);
    await ffmpeg.writeFile(file.name, await fetchFile(file));

    progressCallback('Analyzing video metadata...', 20);
    try {
      await ffmpeg.exec(['-i', file.name, '-f', 'null', '-']);
    } catch (e) {
      console.error('Error getting metadata:', e);
      score -= 50;
      issues.push({
        timestamp: 'N/A',
        description: 'Failed to process video metadata. The file may be corrupted.',
        severity: 'high',
      });
    }

    if (duration === 0 && score === 100) {
      score -= 50;
      issues.push({
        timestamp: 'N/A',
        description: 'Could not determine video duration. The file may be corrupted or have missing metadata.',
        severity: 'high',
      });
    } else if (duration > 0 && duration < 3) {
        score -= 10;
        issues.push({
            timestamp: 'N/A',
            description: 'Video is too short for a full frame-comparison analysis.',
            severity: 'low',
        });
    } else if (duration > 0) {
        issues.push({
            timestamp: '00:00:00',
            description: `Video duration confirmed: ${duration.toFixed(2)} seconds.`,
            severity: 'low',
        });
    }

    if (duration >= 3) {
      const frameTimestamps = [
        duration * 0.1,
        duration * 0.5,
        duration * 0.9,
      ].map(t => t.toFixed(3));

      const framePaths = ['frame1.jpg', 'frame2.jpg', 'frame3.jpg'];
      const frameWidth = 640;
      const frameHeight = 360;
      const frameData = [];

      for (let i = 0; i < frameTimestamps.length; i++) {
        progressCallback(`Extracting frame ${i + 1}/${frameTimestamps.length}...`, 30 + i * 15);
        try {
          await ffmpeg.exec(['-ss', frameTimestamps[i], '-i', file.name, '-vframes', '1', '-s', `${frameWidth}x${frameHeight}`, '-q:v', '2', framePaths[i]]);
          frameData.push(await ffmpeg.readFile(framePaths[i]));
        } catch (e) {
          console.error(`Failed to extract frame ${i+1}:`, e);
          score -= 20;
          issues.push({
            timestamp: `${frameTimestamps[i]}s`,
            description: `Failed to extract frame ${i + 1}. The video stream may be incomplete.`,
            severity: 'high',
          });
        }
      }

      if (frameData.length > 1) {
        progressCallback('Comparing frames...', 75);
        const pixelData = await Promise.all(frameData.map(fd => getPixelData(fd as ArrayBuffer, frameWidth, frameHeight)));

        const comparisons = [
          { from: 0, to: 1, tsFrom: frameTimestamps[0], tsTo: frameTimestamps[1] },
          { from: 1, to: 2, tsFrom: frameTimestamps[1], tsTo: frameTimestamps[2] },
        ];

        for (const comp of comparisons) {
          if (!pixelData[comp.from] || !pixelData[comp.to]) continue;

          const mismatchedPixels = pixelmatch(
            pixelData[comp.from].data,
            pixelData[comp.to].data,
            null,
            frameWidth,
            frameHeight,
            { threshold: 0.1 }
          );

          const totalPixels = frameWidth * frameHeight;
          const differencePercentage = (mismatchedPixels / totalPixels) * 100;

          if (differencePercentage > 10) {
            score -= 25;
            issues.push({
              timestamp: `${comp.tsFrom}s - ${comp.tsTo}s`,
              description: `High visual difference (${differencePercentage.toFixed(2)}%) between distant frames, suggesting a major scene change or potential splice.`,
              severity: 'medium',
            });
          } else if (differencePercentage > 2) {
            score -= 10;
            issues.push({
              timestamp: `${comp.tsFrom}s - ${comp.tsTo}s`,
              description: `Noticeable visual difference (${differencePercentage.toFixed(2)}%) between distant frames.`,
              severity: 'low',
            });
          }
        }
      }
      
      await Promise.all(framePaths.map(p => ffmpeg.deleteFile(p).catch(e => console.error(`Failed to delete ${p}`, e))));
    }

    await ffmpeg.deleteFile(file.name).catch(e => console.error(`Failed to delete ${file.name}`, e));

    progressCallback('Finalizing report...', 95);
    
    score = Math.max(0, Math.min(100, score));

    let summary = '';
    if (score === 100) {
      summary = 'The video appears to be authentic. Metadata is valid and frame-to-frame analysis is consistent.';
    } else if (score >= 80) {
      summary = 'The video appears to be largely authentic. Some minor inconsistencies were found, but no direct evidence of tampering.';
    } else if (score >= 50) {
        summary = 'The video shows moderate inconsistencies that could indicate tampering. Manual review is recommended.';
    } else {
      summary = 'The video shows significant inconsistencies that could indicate tampering. Manual review is highly recommended.';
    }

    return { score, summary, issues };
  } catch (error) {
    console.error('A critical error occurred during analysis:', error);
    throw new Error('Video analysis failed. The file might be corrupted or in an unsupported format.');
  } finally {
    if (ffmpeg.loaded) {
      ffmpeg.terminate();
    }
  }
};