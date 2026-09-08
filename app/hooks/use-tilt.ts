"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  detectTilt,
  initialTilt,
  screenTilt,
  type TiltAction,
} from "@/lib/motion";
type OrientationConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<string>;
};
export function useTilt(
  active: boolean,
  onAction: (action: TiltAction) => void,
) {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState(
    "Opcional: jogue inclinando o celular ou use os botões.",
  );
  const callback = useRef(onAction);
  useEffect(() => {
    callback.current = onAction;
  }, [onAction]);
  const enable = useCallback(async () => {
    if (
      typeof DeviceOrientationEvent === "undefined" ||
      !window.isSecureContext
    ) {
      setStatus("Sensor indisponível. Os botões funcionam normalmente.");
      return;
    }
    try {
      const Orientation = DeviceOrientationEvent as OrientationConstructor;
      if (
        Orientation.requestPermission &&
        (await Orientation.requestPermission()) !== "granted"
      ) {
        setStatus(
          "Permissão não concedida. Use os botões ou tente ativar novamente.",
        );
        return;
      }
      setEnabled(true);
      setStatus("Sensor ativado. Segure a tela na vertical para começar.");
    } catch {
      setStatus("Não foi possível ativar o sensor. Use os botões.");
    }
  }, []);
  useEffect(() => {
    if (!enabled) return;
    let state = initialTilt();
    let received = false;
    const timeout = setTimeout(() => {
      if (!received)
        setStatus("O aparelho não enviou movimentos. Continue pelos botões.");
    }, 4000);
    const listener = (event: DeviceOrientationEvent) => {
      const angle = screenTilt(event.beta, event.gamma);
      if (angle === null) return;
      if (!received) {
        received = true;
        setStatus(
          "Sensor pronto. Cima: acerto · baixo: passar · volte à vertical.",
        );
      }
      if (!active || document.hidden) {
        state = initialTilt();
        return;
      }
      const next = detectTilt(state, angle, performance.now());
      state = next.state;
      if (next.action) {
        callback.current(next.action);
        navigator.vibrate?.(60);
      }
    };
    window.addEventListener("deviceorientation", listener);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("deviceorientation", listener);
    };
  }, [enabled, active]);
  return {
    enabled,
    status,
    enable,
    disable: () => {
      setEnabled(false);
      setStatus("Movimentos desativados. Use os botões.");
    },
  };
}
