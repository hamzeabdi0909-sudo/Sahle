import { useRef, useState } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { transcribeAudioApi } from '../utils/api';

interface VoiceRecorderButtonProps {
  startLabel: string;
  stopLabel: string;
  transcribingLabel: string;
  hintLanguage?: string;
  onTranscript: (text: string) => void;
  onError?: (msg: string) => void;
}

export function VoiceRecorderButton({
  startLabel,
  stopLabel,
  transcribingLabel,
  hintLanguage,
  onTranscript,
  onError,
}: VoiceRecorderButtonProps) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        onError?.('Microphone recording is not supported in this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) {
          chunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size === 0) return;

        setTranscribing(true);
        try {
          const base64 = await blobToBase64(blob);
          const text = await transcribeAudioApi({
            audioBase64: base64,
            mimeType,
            hintLanguage,
          });
          if (text) {
            onTranscript(text);
          }
        } catch (err) {
          onError?.(err instanceof Error ? err.message : 'Transcription failed');
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Unable to access microphone');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  return (
    <button
      type="button"
      onClick={recording ? stopRecording : startRecording}
      disabled={transcribing}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 ${
        recording
          ? 'bg-rose-600 text-white hover:bg-rose-700'
          : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
      } disabled:opacity-60`}
    >
      {transcribing ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{transcribingLabel}</span>
        </>
      ) : recording ? (
        <>
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>{stopLabel}</span>
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5 text-emerald-800" />
          <span>{startLabel}</span>
        </>
      )}
    </button>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error('Failed to read recorded audio'));
    reader.readAsDataURL(blob);
  });
}
