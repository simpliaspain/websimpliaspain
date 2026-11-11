/**
 * El sonido de la conversación de ejemplo.
 *
 * Es el ding del vídeo de Simplia, el de verdad, sacado del propio vídeo:
 * dos campanadas separadas 80 ms, 1318 Hz y 1758 Hz -una cuarta justa- y
 * medio segundo de cola. Antes aquí había dos tonos sintetizados; sonaban
 * bien, pero no eran los de la casa. Cómo se extrajo está en
 * src/assets/sounds/sacar-ding.py, junto al archivo.
 *
 * Dónde suena y dónde no. La web sólo suena en un sitio: los mensajes de la
 * conversación al aterrizar. Es el único lugar donde el sonido *significa*
 * algo - la página va de un WhatsApp que contesta, y un mensaje que llega
 * hace ruido - y no un adorno pegado a un botón. Un sitio B2B que suena al
 * pulsar cualquier cosa es un sitio que alguien abre en una oficina y cierra
 * de golpe.
 *
 * Apagado de fábrica, y el control está debajo del cuadro, al lado de
 * «volver a reproducir»: justo donde alguien querría encenderlo. La
 * preferencia se recuerda, pero no basta con ella - el contexto de audio sólo
 * se crea con un gesto de la persona, que es además lo que exigen los
 * navegadores. Así, recién cargada la página, no suena nada hasta que alguien
 * toca algo, y eso es por construcción y no por suerte.
 *
 * De ahí que haya dos preguntas y no una: `sonidoEncendido` es la
 * preferencia, que viaja entre visitas, y `sonidoListo` es el permiso del
 * navegador, que no viaja. Confundirlas fue un fallo real: quien volvía con
 * el sonido encendido se encontraba la conversación muda y el botón
 * diciéndole «Silenciar». `despertarSonido` devuelve si el permiso se ha
 * conseguido de verdad, para que la pantalla no prometa un sonido que no va
 * a salir.
 *
 * El archivo tampoco se descarga al cargar la página: se pide al encender el
 * interruptor, que es la primera vez que hace falta. Son 7 KB.
 */

import ding from "@/assets/sounds/ding.mp3";

const CLAVE = "chatSonido";

type Tono = "cliente" | "agente";

/**
 * Cuánto suena cada uno. El archivo está normalizado a -1 dBFS, así que
 * estos números son el volumen de verdad. El mensaje del cliente suena algo
 * más bajo que la respuesta: es la misma campana, y la diferencia de nivel
 * basta para que el oído lea un ida y vuelta sin inventarse un segundo tono
 * que el vídeo no tiene.
 */
const VOLUMEN: Record<Tono, number> = { cliente: 0.16, agente: 0.22 };

/**
 * Si al pulsar el interruptor el archivo aún no ha llegado, el ding se queda
 * esperando - pero no para siempre. Pasado este tiempo se descarta: una
 * notificación que suena tarde es peor que una que no suena.
 */
const PACIENCIA = 1200;

let contexto: AudioContext | null = null;
let muestra: AudioBuffer | null = null;
let pedido: Promise<void> | null = null;
let fallido = false;
let enEspera: { tipo: Tono; caduca: number } | null = null;

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

/** Trae el archivo y lo decodifica. Una sola vez, aunque se llame mil veces. */
function cargar(ctx: AudioContext) {
  if (muestra || pedido) return pedido;
  pedido = fetch(ding)
    .then((r) => r.arrayBuffer())
    .then((bytes) => ctx.decodeAudioData(bytes))
    .then((buffer) => {
      muestra = buffer;
      // Lo que se pidió mientras llegaba, si todavía llega a tiempo.
      if (enEspera && Date.now() < enEspera.caduca) tono(enEspera.tipo);
      enEspera = null;
    })
    .catch(() => {
      // Sin archivo se sintetiza la misma campana. Es peor, pero suena, y
      // `fallido` hace que suene también en los mensajes siguientes: sin esa
      // marca sólo habría sonado el que estaba esperando y el resto de la
      // conversación se habría quedado en silencio sin que nadie lo notara.
      muestra = null;
      fallido = true;
      if (enEspera && Date.now() < enEspera.caduca) campana(enEspera.tipo);
      enEspera = null;
    });
  return pedido;
}

/**
 * ¿Puede sonar ahora mismo? Es una pregunta distinta de si el sonido está
 * encendido, y la diferencia es justo donde estaba el fallo: la preferencia
 * se guarda entre visitas, pero el permiso del navegador no. Quien volvía
 * con el sonido encendido se encontraba la conversación muda y un botón
 * diciendo «Silenciar». Ahora el botón pregunta esto para saber qué poner.
 */
export function sonidoListo(): boolean {
  return contexto !== null && contexto.state === "running";
}

/**
 * Prepara el audio y dice si ha quedado listo. Sólo funciona llamado desde
 * un gesto de la persona: en cualquier otro momento el navegador deja el
 * contexto suspendido, y entonces devuelve `false` para que quien llama
 * pueda decir la verdad en pantalla en vez de prometer un sonido que no va
 * a salir.
 */
export async function despertarSonido(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const Contexto =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Contexto) return false;
  if (!contexto) contexto = new Contexto();
  if (contexto.state === "suspended") {
    try {
      await contexto.resume();
    } catch {
      /* Sin gesto el navegador lo rechaza; se dirá que no está listo. */
    }
  }
  if (contexto.state !== "running") return false;
  // Espera a tener el archivo antes de decir que sí: así el primer ding de
  // la reproducción que viene detrás ya suena, sin depender de la espera.
  await cargar(contexto);
  return true;
}

/**
 * La campana sintetizada, para cuando el archivo no se puede cargar ni
 * decodificar. Son los dos parciales que mide el ding de verdad, 1318 y 1758
 * Hz, con la misma caída: no es el sonido del vídeo, pero es su pariente y no
 * un pitido cualquiera.
 */
function campana(tipo: Tono) {
  if (!contexto) return;
  const ahora = contexto.currentTime;
  const vol = contexto.createGain();
  vol.gain.setValueAtTime(0.0001, ahora);
  vol.gain.exponentialRampToValueAtTime(VOLUMEN[tipo], ahora + 0.006);
  vol.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.45);
  vol.connect(contexto.destination);
  for (const [hz, parte] of [
    [1318, 1],
    [1758, 0.55],
  ] as const) {
    const osc = contexto.createOscillator();
    const mezcla = contexto.createGain();
    osc.type = "sine";
    osc.frequency.value = hz;
    mezcla.gain.value = parte;
    osc.connect(mezcla).connect(vol);
    osc.start(ahora);
    osc.stop(ahora + 0.5);
  }
}

/** Un mensaje que aterriza. No hace nada si no hay permiso o no hay ganas. */
export function tono(tipo: Tono) {
  if (!contexto || contexto.state !== "running" || !leer()) return;

  if (fallido) {
    campana(tipo);
    return;
  }

  if (!muestra) {
    // Aún no ha llegado el archivo: que suene al llegar, si no tarda mucho.
    enEspera = { tipo, caduca: Date.now() + PACIENCIA };
    void cargar(contexto);
    return;
  }

  const fuente = contexto.createBufferSource();
  const vol = contexto.createGain();
  fuente.buffer = muestra;
  vol.gain.value = VOLUMEN[tipo];
  fuente.connect(vol).connect(contexto.destination);
  fuente.start();
}
