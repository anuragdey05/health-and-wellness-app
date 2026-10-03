"use client";

import {
  ArrowLeftIcon,
  CameraIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  ShieldCheckIcon,
  SmileyIcon,
  SparkleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { animate } from "animejs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  DrawingUtils as DrawingUtilsType,
  NormalizedLandmark,
  PoseLandmarker as PoseLandmarkerType,
} from "@mediapipe/tasks-vision";
import { deskReset } from "@/lib/routines";
import { saveSession } from "@/lib/storage";
import { updateSquatState, type Landmark, type SquatState } from "@/lib/pose";
import type { CoachResponse, EnergyLevel, PoseStatus, SessionResult } from "@/lib/types";

type Screen = "energy-before" | "warmup" | "squats" | "breathe" | "energy-after" | "complete";

const energyChoices: Array<{ value: EnergyLevel; label: string; description: string }> = [
  { value: "low", label: "Low", description: "Keep it gentle" },
  { value: "steady", label: "Steady", description: "Ready to move" },
  { value: "bright", label: "Bright", description: "Plenty in the tank" },
];

function secondsLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function EnergyPicker({
  title,
  body,
  onSelect,
}: {
  title: string;
  body: string;
  onSelect: (energy: EnergyLevel) => void;
}) {
  return (
    <div className="energy-view">
      <div className="session-copy">
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <div className="energy-grid" role="group" aria-label="Choose your current energy">
        {energyChoices.map((choice, index) => (
          <button className="energy-choice" key={choice.value} onClick={() => onSelect(choice.value)}>
            <span>{index === 0 ? "01" : index === 1 ? "02" : "03"}</span>
            <strong>{choice.label}</strong>
            <small>{choice.description}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SessionFlow({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: (result: SessionResult) => void;
}) {
  const [screen, setScreen] = useState<Screen>("energy-before");
  const [energyBefore, setEnergyBefore] = useState<EnergyLevel>("steady");
  const [energyAfter, setEnergyAfter] = useState<EnergyLevel>("steady");
  const [seconds, setSeconds] = useState(30);
  const [reps, setReps] = useState(0);
  const [poseStatus, setPoseStatus] = useState<PoseStatus>("idle");
  const [coach, setCoach] = useState<CoachResponse | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [cameraLive, setCameraLive] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const repRef = useRef<HTMLSpanElement>(null);
  const breatheRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseRef = useRef<PoseLandmarkerType | null>(null);
  const drawRef = useRef<DrawingUtilsType | null>(null);
  const connectionsRef = useRef<Array<{ start: number; end: number }>>([]);
  const frameRef = useRef<number | null>(null);
  const lastInferenceRef = useRef(0);
  const squatRef = useRef<SquatState>({ phase: "unknown", reps: 0, lastTransitionAt: 0 });
  const startedAtRef = useRef<number | null>(null);
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const stopCamera = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    poseRef.current?.close();
    poseRef.current = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  useEffect(() => {
    if (!panelRef.current || reducedMotion) return;
    const animation = animate(panelRef.current, {
      opacity: [0.35, 1],
      translateY: [14, 0],
      duration: 420,
      ease: "out(4)",
    });
    return () => {
      animation.pause();
    };
  }, [screen, reducedMotion]);

  useEffect(() => {
    if (screen !== "warmup" && screen !== "breathe") return;
    const timer = window.setTimeout(() => {
      if (seconds <= 1) {
        setScreen(screen === "warmup" ? "squats" : "energy-after");
        setSeconds(screen === "warmup" ? 60 : 30);
      } else {
        setSeconds((value) => value - 1);
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [screen, seconds]);

  useEffect(() => {
    if (screen !== "breathe" || !breatheRef.current || reducedMotion) return;
    const animation = animate(breatheRef.current, {
      scale: [{ to: 1.18, duration: 4000 }, { to: 1, duration: 4000 }],
      loop: true,
      ease: "inOutSine",
    });
    return () => {
      animation.pause();
    };
  }, [screen, reducedMotion]);

  useEffect(() => {
    if (screen !== "squats") stopCamera();
  }, [screen, stopCamera]);

  const celebrateRep = useCallback(() => {
    if (!repRef.current || reducedMotion) return;
    animate(repRef.current, { scale: [1, 1.3, 1], duration: 360, ease: "out(4)" });
  }, [reducedMotion]);

  const manualRep = useCallback(
    (delta: number) => {
      setReps((value) => Math.max(0, Math.min(8, value + delta)));
      if (delta > 0) celebrateRep();
    },
    [celebrateRep],
  );

  const runPoseLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = poseRef.current;
    if (!video || !canvas || !landmarker || !streamRef.current) return;

    const loop = () => {
      const now = performance.now();
      if (video.readyState >= 2 && now - lastInferenceRef.current >= 125) {
        lastInferenceRef.current = now;
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        landmarker.detectForVideo(video, now, (poseResult) => {
          const context = canvas.getContext("2d");
          if (!context) return;
          context.clearRect(0, 0, canvas.width, canvas.height);
          const landmarks = poseResult.landmarks[0] as NormalizedLandmark[] | undefined;
          if (!landmarks) {
            setPoseStatus("framing");
            return;
          }
          if (drawRef.current) {
            drawRef.current.drawConnectors(landmarks, connectionsRef.current, {
              color: "#f26b53",
              lineWidth: 3,
            });
            drawRef.current.drawLandmarks(landmarks, { color: "#f7f8f4", radius: 2.4 });
          }
          const update = updateSquatState(squatRef.current, landmarks as Landmark[], Date.now());
          squatRef.current = {
            phase: update.phase,
            reps: update.reps,
            lastTransitionAt: update.lastTransitionAt,
          };
          if (!update.visible) setPoseStatus("framing");
          else setPoseStatus(update.phase === "bottom" ? "bottom" : "standing");
          if (update.counted) {
            setReps(Math.min(8, update.reps));
            celebrateRep();
          }
        });
      }
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
  }, [celebrateRep]);

  async function enableCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setPoseStatus("unavailable");
      return;
    }
    setPoseStatus("loading");
    try {
      const [{ FilesetResolver, PoseLandmarker, DrawingUtils }, stream] = await Promise.all([
        import("@mediapipe/tasks-vision"),
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 720 } },
          audio: false,
        }),
      ]);
      if (!videoRef.current || !canvasRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm",
      );
      poseRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.6,
        minPosePresenceConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });
      connectionsRef.current = PoseLandmarker.POSE_CONNECTIONS;
      drawRef.current = new DrawingUtils(canvasRef.current.getContext("2d")!);
      setPoseStatus("ready");
      setCameraLive(true);
      runPoseLoop();
    } catch (error) {
      stopCamera();
      setCameraLive(false);
      setPoseStatus(error instanceof DOMException && error.name === "NotAllowedError" ? "denied" : "unavailable");
    }
  }

  async function completeSession(after: EnergyLevel) {
    setEnergyAfter(after);
    const sessionResult: SessionResult = {
      id: crypto.randomUUID(),
      routineId: deskReset.id,
      routineName: deskReset.name,
      completedAt: new Date().toISOString(),
      durationSeconds: Math.max(1, Math.round((Date.now() - (startedAtRef.current ?? Date.now())) / 1000)),
      reps,
      energyBefore,
      energyAfter: after,
      completedSteps: deskReset.steps.map((step) => step.id),
    };
    saveSession(sessionResult);
    setResult(sessionResult);
    setScreen("complete");
    setCoachLoading(true);
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: sessionResult.durationSeconds / 60,
          energyBefore,
          energyAfter: after,
          completedSteps: sessionResult.completedSteps,
          reps,
        }),
      });
      if (response.ok) setCoach((await response.json()) as CoachResponse);
    } finally {
      setCoachLoading(false);
      onComplete(sessionResult);
    }
  }

  const poseMessage = {
    idle: "Camera stays off until you choose to enable it.",
    loading: "Loading the local pose model…",
    ready: "Step back until your hips, knees, and ankles are visible.",
    framing: "Move back a little so your full legs are in frame.",
    standing: "You are framed. Sit toward the chair.",
    bottom: "Good depth. Stand tall to count the rep.",
    unavailable: "Camera tracking is unavailable. Manual reps are ready.",
    denied: "Camera access was declined. Manual reps are ready.",
  }[poseStatus];

  return (
    <div className="session-shell" role="dialog" aria-modal="true" aria-labelledby="session-title">
      <header className="session-header">
        <button className="icon-button" onClick={screen === "energy-before" ? onClose : () => setScreen("energy-before")} aria-label="Go back">
          <ArrowLeftIcon aria-hidden size={20} />
        </button>
        <div className="session-brand"><span className="brand-mark small" />Between</div>
        <button className="icon-button" onClick={onClose} aria-label="Close session">
          <XIcon aria-hidden size={20} />
        </button>
      </header>

      <main className="session-main" ref={panelRef}>
        {screen === "energy-before" ? (
          <EnergyPicker
            title="How is your energy right now?"
            body="No score is better than another. This just sets the tone for your reset."
            onSelect={(energy) => {
              setEnergyBefore(energy);
              startedAtRef.current = Date.now();
              setSeconds(30);
              setScreen("warmup");
            }}
          />
        ) : null}

        {screen === "warmup" ? (
          <div className="timed-view">
            <span className="step-position">1 of 3</span>
            <div className="timer-orbit"><strong>{seconds}</strong><small>seconds</small></div>
            <div className="session-copy">
              <h1 id="session-title">Shoulder wake-up</h1>
              <p>{deskReset.steps[0].instruction}</p>
            </div>
            <button className="secondary-button" onClick={() => setScreen("squats")}>Ready for squats</button>
          </div>
        ) : null}

        {screen === "squats" ? (
          <div className="squat-view">
            <div className="squat-heading">
              <div>
                <span className="step-position">2 of 3</span>
                <h1 id="session-title">Chair squats</h1>
                <p>{deskReset.steps[1].instruction}</p>
              </div>
              <div className="rep-count" aria-live="polite"><span ref={repRef}>{reps}</span><small>of 8</small></div>
            </div>

            <div className={`camera-stage ${cameraLive ? "is-live" : ""}`}>
              <video ref={videoRef} playsInline muted aria-label="Local camera preview" />
              <canvas ref={canvasRef} aria-hidden />
              {!cameraLive ? (
                <div className="camera-empty">
                  <CameraIcon aria-hidden size={36} weight="duotone" />
                  <strong>Optional local rep counting</strong>
                  <span>No video leaves this device.</span>
                  <button className="camera-button" disabled={poseStatus === "loading"} onClick={enableCamera}>
                    {poseStatus === "loading" ? "Loading camera" : "Enable camera"}
                  </button>
                </div>
              ) : null}
              <div className="camera-status"><ShieldCheckIcon aria-hidden size={17} weight="fill" /><span>{poseMessage}</span></div>
            </div>

            <div className="manual-controls">
              <div>
                <strong>Manual rep controls</strong>
                <span>Use these anytime, with or without the camera.</span>
              </div>
              <div>
                <button className="icon-button" onClick={() => manualRep(-1)} disabled={reps === 0} aria-label="Remove one rep"><MinusIcon aria-hidden size={20} /></button>
                <button className="add-rep-button" onClick={() => manualRep(1)} disabled={reps >= 8}><PlusIcon aria-hidden size={19} weight="bold" />Add rep</button>
              </div>
            </div>
            <button className="primary-button wide" onClick={() => { setCameraLive(false); setSeconds(60); setScreen("breathe"); }} disabled={reps < 1}>
              {reps >= 8 ? "Finish with breathing" : `Continue with ${reps} ${reps === 1 ? "rep" : "reps"}`}
            </button>
          </div>
        ) : null}

        {screen === "breathe" ? (
          <div className="breathe-view">
            <span className="step-position">3 of 3</span>
            <div className="breathe-stage">
              <div className="breathe-ring" ref={breatheRef}><span>{secondsLabel(seconds)}</span></div>
            </div>
            <div className="session-copy">
              <h1 id="session-title">Settle your breath</h1>
              <p>{deskReset.steps[2].instruction}</p>
            </div>
            <button className="secondary-button" onClick={() => setScreen("energy-after")}>Complete breathing</button>
          </div>
        ) : null}

        {screen === "energy-after" ? (
          <EnergyPicker
            title="How is your energy now?"
            body="Notice what changed, even if the answer is simply that you paused."
            onSelect={completeSession}
          />
        ) : null}

        {screen === "complete" ? (
          <div className="complete-view">
            <div className="complete-mark"><CheckIcon aria-hidden size={34} weight="bold" /></div>
            <div className="session-copy">
              <h1 id="session-title">{coach?.headline ?? "You made room to move."}</h1>
              <p aria-live="polite">{coachLoading ? "Shaping your session reflection…" : coach?.encouragement ?? "Your reset is saved on this device."}</p>
            </div>
            <div className="result-row">
              <div><strong>{result?.reps ?? reps}</strong><span>chair squats</span></div>
              <div><strong>{result ? secondsLabel(result.durationSeconds) : "0:00"}</strong><span>time invested</span></div>
              <div><strong>{energyBefore === energyAfter ? "Steady" : "Shifted"}</strong><span>energy</span></div>
            </div>
            <div className="next-suggestion">
              <SparkleIcon aria-hidden size={22} weight="duotone" />
              <p>{coach?.nextSuggestion ?? "One short opening tomorrow is enough to continue."}</p>
            </div>
            <button className="primary-button wide" onClick={onClose}><SmileyIcon aria-hidden size={20} weight="duotone" />Back to my day</button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
