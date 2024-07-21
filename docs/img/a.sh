#!/data/data/com.termux/files/usr/bin/bash


for i in $(seq 1 200); do
	echo $i
	wget "https://www.aemet.es/imagenes/png/estado_cielo/${i}_g.png"
done