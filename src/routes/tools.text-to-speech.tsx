import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { Play, Square } from "lucide-react";

function Page() {
  const [text, setText] = useState("Hello! Pdfica turns your text into speech using your browser's built-in voices.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (!voice && v[0]) setVoice(v[0].name);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.cancel(); };
  }, [voice]);

  const speak = () => {
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find((x) => x.name === voice);
    if (v) u.voice = v;
    u.rate = rate; u.pitch = pitch;
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };
  const stop = () => { window.speechSynthesis.cancel(); setSpeaking(false); };

  return (
    <UtilityPage title="Text to Speech" description="Convert any text to natural speech using your browser's voices. Free, unlimited, no upload.">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8}
        className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="block text-sm"><span className="font-medium">Voice</span>
          <select value={voice} onChange={(e) => setVoice(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2">
            {voices.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
          </select>
        </label>
        <label className="block text-sm"><span className="font-medium">Rate: {rate.toFixed(1)}</span>
          <input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={(e) => setRate(+e.target.value)} className="mt-1 w-full accent-primary" />
        </label>
        <label className="block text-sm"><span className="font-medium">Pitch: {pitch.toFixed(1)}</span>
          <input type="range" min={0} max={2} step={0.1} value={pitch} onChange={(e) => setPitch(+e.target.value)} className="mt-1 w-full accent-primary" />
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        {speaking ? (
          <button onClick={stop} className="inline-flex items-center gap-2 rounded-full border bg-surface px-6 py-3 text-sm font-semibold hover:bg-muted"><Square className="h-4 w-4" /> Stop</button>
        ) : (
          <button onClick={speak} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform"><Play className="h-4 w-4" /> Speak</button>
        )}
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/text-to-speech")({
  head: () => ({ meta: [{ title: "Text to Speech — Free Online | Pdfica" }, { name: "description", content: "Convert text to speech in your browser. Free, unlimited, with voice, rate and pitch controls." }] }),
  component: Page,
});
