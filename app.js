import { AudioPlayer } from "./audio-player.js";

document.addEventListener("DOMContentLoaded", () => {

    const audio = document.querySelectorAll("audio");
    for (let el of audio) {
        new AudioPlayer(el);
    }

});