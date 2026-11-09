"""
Saca el «ding» del vídeo promocional de Simplia y lo deja limpio.

Esto es lo que produjo `ding.mp3`, que está aquí al lado. Se guarda para que
se pueda repetir si algún día cambia el vídeo. El vídeo con sonido no está en
el repositorio -el que sí está, src/assets/services/simplia-demo-1024.mp4, no
lleva pista de audio-, así que para volver a ejecutarlo hay que sacar antes el
audio del vídeo original:

    ffmpeg -i <el vídeo> -ac 1 -ar 48000 promo-audio.wav
    python3 sacar-ding.py
    ffmpeg -i ding.wav -codec:a libmp3lame -b:a 96k -ac 1 ding.mp3

El vídeo lleva música de fondo de principio a fin, así que no vale con
cortar un trozo: se oiría la música debajo. Lo que lo hace posible es que el
ding y la música no comparten frecuencias. Medido sobre el vídeo:

    banda          lo que pone el ding    lo que pone la música
    300- 700 Hz           nada                  256,9
    700- 900 Hz           nada                   28,7
    900-1200 Hz           nada                   33,6
   1200-2000 Hz          652,6                    7,0
   2000-6000 Hz           70,2                    7,3

El ding son dos campanas, 1318 Hz y 1758 Hz -una cuarta justa- y nada más.
Un paso alto en 1000 Hz se lleva la música entera y deja el ding intacto.

De los dos dings del vídeo (7,48 s y 18,28 s) se coge el segundo: es el que
tiene la música más callada justo debajo.
"""

import numpy as np
import wave
from scipy.signal import butter, sosfiltfilt

ORIGEN = "promo-audio.wav"
DESTINO = "ding.wav"

TOMA = 18.278         # el golpe
FIN = 18.830          # donde la cola ya está 18 dB por debajo
CORTE = 1000          # paso alto, en Hz
ENTRADA = 0.002       # fundido de entrada, 2 ms
SALIDA = 0.110        # fundido de salida, 110 ms

w = wave.open(ORIGEN)
sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768

# Se filtra con holgura por los dos lados y se recorta después: así el filtro
# no arrastra al corte lo que había antes del golpe.
i0, i1 = int((TOMA - 0.30) * sr), int((FIN + 0.30) * sr)
sos = butter(8, CORTE, btype="highpass", fs=sr, output="sos")
y = sosfiltfilt(sos, x[i0:i1])          # fase cero: no corre el ataque
ding = y[int(0.30 * sr) : int((0.30 + FIN - TOMA) * sr)].copy()

# Fundidos. Sin ellos el corte empieza y acaba en un escalón, y un escalón
# es un chasquido. El de salida es media campana de coseno, que acompaña la
# caída natural en vez de cortarla a cuchillo.
ent = int(sr * ENTRADA)
sal = int(sr * SALIDA)
ding[:ent] *= np.linspace(0, 1, ent)
ding[-sal:] *= (1 + np.cos(np.linspace(0, np.pi, sal))) / 2

ding = ding / np.abs(ding).max() * 0.891        # -1 dBFS; el volumen lo pone la web

env = np.abs(ding)
k = int(sr * 0.004)
env = np.convolve(env, np.ones(k) / k, "same")
pico = float(env.max())
print("duración   %.0f ms" % (len(ding) / sr * 1000))
print("ataque     %.1f ms" % (int(env.argmax()) / sr * 1000))
print("cola       acaba %.0f dB por debajo del pico" % (20 * np.log10(max(env[-int(sr * 0.001) :].max(), 1e-9) / pico)))

salida = wave.open(DESTINO, "wb")
salida.setnchannels(1)
salida.setsampwidth(2)
salida.setframerate(sr)
salida.writeframes((ding * 32767).astype("<i2").tobytes())
salida.close()
print("escrito %s" % DESTINO)
