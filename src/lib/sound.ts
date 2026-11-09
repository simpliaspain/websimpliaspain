/**
 * Los tonos de la conversación de ejemplo.
 *
 * Dónde suena y dónde no. La web sólo suena en un sitio: los mensajes de la
 * conversación al aterrizar. Es el único lugar donde el sonido *significa*
 * algo - la página va de un WhatsApp que contesta, y un mensaje que llega
 * hace ruido - y no un adorno pegado a un botón. Un sitio B2B que suena al
 * pulsar cualquier cosa es un sitio que alguien abre en una oficina y cierra
 * de golpe.
 *
 * Apagado de fábrica, y el interruptor está debajo del cuadro, al lado de
 * «volver a reproducir»: justo donde alguien querría encenderlo. La
 * preferencia se recuerda, pero no basta con ella - el contexto de audio sólo
 * se crea con un gesto de la persona, que es además lo que exigen los
 * navegadores. Así, recién cargada la página, no suena nada hasta que alguien
 * toca algo, y eso es por construcción y no por suerte.
 *
 * Los tonos están sintetizados, no son archivos: nada que descargar y el
 * timbre se puede afinar aquí mismo. Son muy cortos y muy flojos a propósito
 * - un golpecito de uña en un vaso, no una notificación.
 */

const CLAVE = "chatSonido";

/** Pico de volumen. 0,05 es un susurro; por encima de 0,1 ya es una alerta. */
const VOLUMEN = 0.05;

type Tono = "cliente" | "agente";

/**
 * El cliente escribe más grave; el agente contesta una quinta por encima.
 * Subir al contestar es lo que hace que la pareja se lea como una pregunta y
 * su respuesta, y no como dos golpes iguales.
 */
const FRECUENCIA: Record<Tono, number> = { cliente: 587.33, agente: 880 };

let contexto: AudioContext | null = null;

function leer(): boolean {
  try {
    return localStorage.getItem(CLAVE) === "1";
  } catch {
    return false;
  }
}

export function sonidoEncendido(): boolean {
  return leer();
}

export function guardarSonido(encendido: boolean) {
  try {
    localStorage.setItem(CLAVE, encendido ? "1" : "0");
  } catch {
    /* En privado, o con el almacenamiento bloqueado, vale con esta sesión. */
  }
}

/**
 * Prepara el audio. Sólo tiene efecto llamado desde un gesto de la persona;
 * en cualquier otro momento el navegador deja el contexto suspendido y los
 * tonos se descartan solos.
 */
export function despertarSonido() {
  if (typeof window === "undefined") return;
  const Contexto = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Contexto) return;
  if (!contexto) contexto = new Contexto();
  if (contexto.state === "suspended") void contexto.resume();
}

/** Un mensaje que aterriza. No hace nada si no hay permiso o no hay ganas. */
export function tono(tipo: Tono) {
  if (!contexto || contexto.state !== "running" || !leer()) return;

  const ahora = contexto.currentTime;
  const osc = contexto.createOscillator();
  const vol = contexto.createGain();

  // Seno y no cuadrada ni diente de sierra: sin armónicos agudos no hay
  // nada que raspe al repetirlo cinco veces seguidas.
  osc.type = "sine";
  osc.frequency.value = FRECUENCIA[tipo];

  // Ataque de 8 ms - instantáneo pero sin el chasquido de empezar en seco -
  // y una caída exponencial de 160 ms, que es como se apaga algo al que se
  // ha dado un golpecito.
  vol.gain.setValueAtTime(0.0001, ahora);
  vol.gain.exponentialRampToValueAtTime(VOLUMEN, ahora + 0.008);
  vol.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.16);

  osc.connect(vol).connect(contexto.destination);
  osc.start(ahora);
  osc.stop(ahora + 0.18);
}
