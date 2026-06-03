import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { Play, Square, Download, Loader2, Languages } from "lucide-react";
import { downloadBlob } from "@/lib/format";

// Lightweight script + common-word heuristic language detection (no deps).
type LangInfo = { code: string; name: string };
const LANGS: LangInfo[] = [
  { code: "auto", name: "Auto-detect" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "nl", name: "Dutch" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "tr", name: "Turkish" },
  { code: "pl", name: "Polish" },
];

// StreamElements voice → language mapping (subset of voices available).
const SE_VOICE_LANG: Record<string, string> = {
  Brian: "en", Amy: "en", Emma: "en", Joanna: "en", Matthew: "en", Ivy: "en",
  Justin: "en", Kendra: "en", Kimberly: "en", Salli: "en", Joey: "en",
  Russell: "en", Nicole: "en", Geraint: "en", Raveena: "en",
  Mizuki: "ja", Takumi: "ja",
  Celine: "fr", Mathieu: "fr",
  Hans: "de", Marlene: "de", Vicki: "de",
  Conchita: "es", Enrique: "es",
  Carla: "it", Giorgio: "it",
  Ricardo: "pt", Vitoria: "pt",
};

function detectLang(text: string): string {
  const t = text.trim();
  if (!t) return "en";
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) return "ja";
  if (/[\uac00-\ud7af]/.test(t)) return "ko";
  if (/[\u4e00-\u9fff]/.test(t)) return "zh";
  if (/[\u0600-\u06ff]/.test(t)) return "ar";
  if (/[\u0900-\u097f]/.test(t)) return "hi";
  if (/[\u0400-\u04ff]/.test(t)) return "ru";
  const lower = " " + t.toLowerCase().replace(/[^\p{L}\s']/gu, " ") + " ";
  const hints: Record<string, string[]> = {
    en: [" the ", " and ", " is ", " of ", " you ", " that ", " with "],
    es: [" el ", " la ", " los ", " que ", " de ", " y ", " es ", " un ", " una ", " por ", " con "],
    fr: [" le ", " la ", " les ", " et ", " est ", " un ", " une ", " que ", " des ", " avec ", " pour "],
    de: [" der ", " die ", " das ", " und ", " ist ", " nicht ", " ein ", " eine ", " mit ", " für "],
    it: [" il ", " la ", " che ", " di ", " e ", " un ", " una ", " per ", " con ", " sono "],
    pt: [" o ", " a ", " que ", " de ", " e ", " um ", " uma ", " para ", " com ", " não "],
    nl: [" de ", " het ", " een ", " en ", " is ", " van ", " dat ", " niet ", " met "],
    tr: [" ve ", " bir ", " bu ", " için ", " ile ", " değil ", " çok "],
    pl: [" jest ", " nie ", " się ", " że ", " to ", " na ", " z ", " do "],
  };
  let best = "en", bestScore = 0;
  for (const [code, words] of Object.entries(hints)) {
    const score = words.reduce((a, w) => a + (lower.includes(w) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; best = code; }
  }
  return best;
}

const langName = (c: string) => LANGS.find((l) => l.code === c)?.name || c;

// Free public TTS endpoint (StreamElements) — returns an MP3 with no API key.
// Has a per-request length cap, so we chunk long text and stitch the MP3 parts.
const SE_VOICES = [
  "Brian", "Amy", "Emma", "Joanna", "Matthew", "Ivy", "Justin", "Kendra",
  "Kimberly", "Salli", "Joey", "Russell", "Nicole", "Geraint", "Raveena",
  "Mizuki", "Takumi", "Celine", "Mathieu", "Hans", "Marlene", "Vicki",
  "Conchita", "Enrique", "Carla", "Giorgio", "Ricardo", "Vitoria",
];

const chunkText = (text: string, max = 480): string[] => {
  const parts: string[] = [];
  const sentences = text.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]?\s*/g) || [text];
  let buf = "";
  for (const s of sentences) {
    if ((buf + s).length > max) {
      if (buf) parts.push(buf.trim());
      if (s.length > max) {
        for (let i = 0; i < s.length; i += max) parts.push(s.slice(i, i + max));
        buf = "";
      } else buf = s;
    } else buf += s;
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
};

function Page() {
  const [text, setText] = useState("Hello! Pdfica turns your text into speech you can preview or download as MP3.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  // Language: "auto" runs detection on every text change; any other value pins.
  const [langChoice, setLangChoice] = useState<string>("auto");
  const detected = useMemo(() => detectLang(text), [text]);
  const activeLang = langChoice === "auto" ? detected : langChoice;

  const [dlVoice, setDlVoice] = useState("Brian");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  // Voices filtered by the active language (fallback to all if none match).
  const matchingVoices = useMemo(() => {
    const m = voices.filter((v) => v.lang.toLowerCase().startsWith(activeLang.toLowerCase()));
    return m.length ? m : voices;
  }, [voices, activeLang]);

  useEffect(() => {
    if (!matchingVoices.length) return;
    if (!voice || !matchingVoices.some((v) => v.name === voice)) {
      setVoice(matchingVoices[0].name);
    }
  }, [matchingVoices, voice]);

  useEffect(() => {
    if (SE_VOICE_LANG[dlVoice] === activeLang) return;
    const match = Object.entries(SE_VOICE_LANG).find(([, l]) => l === activeLang);
    if (match) setDlVoice(match[0]);
  }, [activeLang, dlVoice]);

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  const speak = () => {
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find((x) => x.name === voice);
    if (v) u.voice = v;
    u.lang = v?.lang || activeLang;
    u.rate = rate; u.pitch = pitch;
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };
  const stop = () => { window.speechSynthesis.cancel(); setSpeaking(false); };

  const generateDownload = async () => {
    if (!text.trim()) return;
    setError(""); setGenerating(true); setProgress(0);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(""); setAudioBlob(null);
    try {
      const chunks = chunkText(text);
      const blobs: Blob[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(dlVoice)}&text=${encodeURIComponent(chunks[i])}`;
        const r = await fetch(url);
        if (!r.ok) throw new Error(`Request failed (${r.status}).`);
        blobs.push(await r.blob());
        setProgress(Math.round(((i + 1) / chunks.length) * 100));
      }
      const merged = new Blob(blobs, { type: "audio/mpeg" });
      setAudioBlob(merged);
      setAudioUrl(URL.createObjectURL(merged));
    } catch (e: any) {
      setError(e?.message || "Failed to generate audio. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const download = () => {
    if (!audioBlob) return;
    const name = `tts-${Date.now()}.mp3`;
    downloadBlob(audioBlob, name);
  };

  return (
    <UtilityPage title="Text to Speech" description="Preview text in your browser's voices, or generate a downloadable MP3 file. Free, no signup.">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8}
        className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border bg-muted/20 p-3">
        <div className="flex items-center gap-2 text-sm">
          <Languages className="h-4 w-4 text-primary" />
          <span className="font-medium">Language</span>
        </div>
        <select value={langChoice} onChange={(e) => setLangChoice(e.target.value)}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm">
          {LANGS.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>
        <span className="text-xs text-muted-foreground">
          {langChoice === "auto" ? <>Auto-detected: <b>{langName(activeLang)}</b></> : <>Pinned for better pronunciation.</>}
        </span>
      </div>

      <div className="mt-6 rounded-2xl border bg-muted/30 p-4">
        <h3 className="text-sm font-semibold">Browser preview</h3>
        <p className="mt-1 text-xs text-muted-foreground">Instant playback using your system voices (cannot be saved as a file).</p>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <label className="block text-sm"><span className="font-medium">Voice ({langName(activeLang)})</span>
            <select value={voice} onChange={(e) => setVoice(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2">
              {matchingVoices.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
            </select>
          </label>
          <label className="block text-sm"><span className="font-medium">Rate: {rate.toFixed(1)}</span>
            <input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={(e) => setRate(+e.target.value)} className="mt-1 w-full accent-primary" />
          </label>
          <label className="block text-sm"><span className="font-medium">Pitch: {pitch.toFixed(1)}</span>
            <input type="range" min={0} max={2} step={0.1} value={pitch} onChange={(e) => setPitch(+e.target.value)} className="mt-1 w-full accent-primary" />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {speaking ? (
            <button onClick={stop} className="inline-flex items-center gap-2 rounded-full border bg-surface px-5 py-2.5 text-sm font-semibold hover:bg-muted"><Square className="h-4 w-4" /> Stop</button>
          ) : (
            <button onClick={speak} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform"><Play className="h-4 w-4" /> Speak</button>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-muted/30 p-4">
        <h3 className="text-sm font-semibold">Generate downloadable MP3</h3>
        <p className="mt-1 text-xs text-muted-foreground">Creates a real audio file you can save and use anywhere.</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <label className="block text-sm"><span className="font-medium">Voice ({langName(activeLang)})</span>
            <select value={dlVoice} onChange={(e) => setDlVoice(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2">
              <optgroup label={`Matches ${langName(activeLang)}`}>
                {SE_VOICES.filter((v) => SE_VOICE_LANG[v] === activeLang).map((v) => <option key={v} value={v}>{v} ({SE_VOICE_LANG[v]})</option>)}
              </optgroup>
              <optgroup label="All voices">
                {SE_VOICES.map((v) => <option key={v} value={v}>{v} ({SE_VOICE_LANG[v] || "?"})</option>)}
              </optgroup>
            </select>
          </label>
          <div className="flex items-end justify-end">
            <button onClick={generateDownload} disabled={generating || !text.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform disabled:opacity-60 disabled:hover:scale-100">
              {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating… {progress}%</> : <>Generate MP3</>}
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

        {audioUrl && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border bg-background p-3">
            <audio controls src={audioUrl} className="w-full" />
            <button onClick={download} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform">
              <Download className="h-4 w-4" /> Download MP3
            </button>
          </div>
        )}
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/text-to-speech")({
  head: () => ({ meta: [{ title: "Text to Speech — Free Online MP3 Download | Pdfica" }, { name: "description", content: "Convert text to speech and download as MP3. Free, unlimited, with multiple voices and instant browser preview." }] }),
  component: Page,
});
