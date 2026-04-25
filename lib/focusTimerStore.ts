// Simple module-level singleton store so TopBar and Focus page share the same timer state.
// Using a pub/sub pattern — no external libraries needed.

type TimerMode = 'work' | 'break' | 'custom';

export interface FocusTimerState {
  totalSeconds: number;       // The full duration set by the user
  timeLeft: number;           // Seconds remaining
  isRunning: boolean;
  mode: TimerMode;
  label: string;              // Custom session label (e.g. "Deep Work", "Reading", etc.)
}

type Listener = (state: FocusTimerState) => void;

const DEFAULT_STATE: FocusTimerState = {
  totalSeconds: 25 * 60,
  timeLeft: 25 * 60,
  isRunning: false,
  mode: 'work',
  label: 'Focus Session',
};

let state: FocusTimerState = { ...DEFAULT_STATE };
const listeners = new Set<Listener>();
let intervalId: NodeJS.Timeout | null = null;

function notify() {
  listeners.forEach((fn) => fn({ ...state }));
}

export function subscribe(fn: Listener) {
  listeners.add(fn);
  fn({ ...state }); // immediately call with current state
  return () => listeners.delete(fn);
}

export function getState() {
  return { ...state };
}

export function setTimer(seconds: number, label: string, mode: TimerMode = 'custom') {
  stopTimer();
  state = { ...state, totalSeconds: seconds, timeLeft: seconds, isRunning: false, mode, label };
  notify();
}

export function startTimer() {
  if (state.isRunning || state.timeLeft <= 0) return;
  state = { ...state, isRunning: true };
  notify();

  intervalId = setInterval(() => {
    if (state.timeLeft <= 1) {
      clearInterval(intervalId!);
      intervalId = null;
      state = { ...state, timeLeft: 0, isRunning: false };
      notify();

      // Fire notification
      if (typeof window !== 'undefined' && Notification.permission === 'granted') {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(state.label || 'Session Complete!', {
              body: 'Your focus session has ended. Great work!',
              icon: '/favicon.ico',
            });
          });
        } else {
          new Notification(state.label || 'Session Complete!', {
            body: 'Your focus session has ended. Great work!',
            icon: '/favicon.ico',
          });
        }
      }
      return;
    }
    state = { ...state, timeLeft: state.timeLeft - 1 };
    notify();
  }, 1000);
}

export function pauseTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  state = { ...state, isRunning: false };
  notify();
}

export function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  state = { ...state, isRunning: false, timeLeft: state.totalSeconds };
  notify();
}

export function resetTimer() {
  stopTimer();
}
