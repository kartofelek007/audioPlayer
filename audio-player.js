export class AudioPlayer {
    constructor(audioElement) {
        this.audioElement = audioElement;
        this.audioElement.style.display = "none";
        this.DOM = {};
        this.#makeHTML();
        this.bindEvents();
    }

    #getTimeCodeFromNum(num) {
        let seconds = parseInt(num);
        let minutes = parseInt(seconds / 60);
        seconds -= minutes * 60;
        const hours = parseInt(minutes / 60);
        minutes -= hours * 60;

        if (hours === 0) return `${String(minutes).padStart(2, 0)}:${String(seconds % 60).padStart(2, 0)}`;
        return `${String(hours).padStart(2, 0)}:${minutes}:${String(seconds % 60).padStart(2, 0)}`;
    }

    #makeHTML() {
        const div = document.createElement("div");
        div.classList.add("audio-player");
        div.innerHTML = `
            <button class="audio-player-play"></button>
            <div class="audio-player-timeline">
                <span class="audio-player-timeline-text">00:00</span>
                <span class="audio-player-timeline-progress">
                    <span class="audio-player-timeline-progress-text">00:00</span>
                </span>
            </div>
            <div class="audio-player-volume">
                <span class="audio-player-volume-progress"></span>
            </div>
            <button class="audio-player-mute"></button>
        `;
        this.DOM.cnt = div;
        this.DOM.play = div.querySelector(".audio-player-play");
        this.DOM.timeline = div.querySelector(".audio-player-timeline");
        this.DOM.timelineProgress = div.querySelector(".audio-player-timeline-progress");
        this.DOM.mute = div.querySelector(".audio-player-mute");
        this.DOM.volume = div.querySelector(".audio-player-volume");
        this.DOM.volumeProgress = div.querySelector(".audio-player-volume-progress");
        this.DOM.volumeProgressText = div.querySelector(".audio-player-volume-progress-text");
        this.DOM.timelineText = div.querySelector(".audio-player-timeline-text");
        this.audioElement.after(this.DOM.cnt);
    }

    bindEvents() {
        let changeAudioVolume = (vol) => {
            vol = Math.min(Math.max(vol, 0), 1);
            this.audioElement.volume = vol;
            this.DOM.volumeProgress.style.width = `${vol * 100}%`;
            this.DOM.mute.classList.toggle("audio-player-mute--muted", vol === 0)
        }

        let changeProgress = false;
        let changeVolume = false;

        this.DOM.mute.addEventListener("click", () => {
            this.audioElement.muted = !this.audioElement.muted;
            this.DOM.mute.classList.toggle("audio-player-mute--muted", this.audioElement.muted);
            changeAudioVolume(this.audioElement.muted ? 0 : 1);
        })

        this.DOM.play.addEventListener("click", () => {
            if (this.audioElement.paused || this.audioElement.ended) {
                this.audioElement.play();
                this.DOM.play.classList.add("audio-player-play--pause");
            } else {
                this.audioElement.pause();
                this.DOM.play.classList.remove("audio-player-play--pause");
            }
        })

        this.audioElement.addEventListener("loadedmetadata", () => {
            this.DOM.timeline.dataset.max = this.audioElement.duration;
        })

        this.audioElement.addEventListener("timeupdate", () => {
            if (!this.DOM.timeline.dataset.max) this.DOM.timeline.dataset.max = this.audioElement.duration;
            this.DOM.timelineProgress.style.width = `${Math.floor(this.audioElement.currentTime * 100 / this.audioElement.duration)}%`;
            this.DOM.timelineText.innerText = this.#getTimeCodeFromNum(this.audioElement.currentTime);
            this.DOM.timelineProgressText.innerText = this.#getTimeCodeFromNum(this.audioElement.currentTime);
        })

        this.audioElement.addEventListener("ended", () => {
            this.DOM.play.classList.remove("video-play--pause");
        })

        this.DOM.timeline.addEventListener("mousedown", e => {
            changeProgress = true;
            const rect = this.DOM.timeline.getBoundingClientRect();
            const pos = (e.pageX - rect.left) / this.DOM.timeline.offsetWidth;
            this.audioElement.currentTime = pos * this.audioElement.duration;
        })

        document.addEventListener("mouseup", () => {
            changeProgress = false;
        })

        document.addEventListener("mousemove", (e) => {
            if (changeProgress) {
                const rect = this.DOM.timeline.getBoundingClientRect();
                const pos = (e.pageX - rect.left) / this.DOM.timeline.offsetWidth;
                this.audioElement.currentTime = pos * this.audioElement.duration;
            }
        })

        this.DOM.volume.addEventListener("mousedown", e => {
            changeVolume = true;
            const rect = this.DOM.volume.getBoundingClientRect();
            let pos = 1 - (rect.right - e.pageX) / this.DOM.volume.offsetWidth;
            changeAudioVolume(pos);
        })

        document.addEventListener("mouseup", () => {
            changeVolume = false;
        })

        document.addEventListener("mousemove", (e) => {
            if (changeVolume) {
                const rect = this.DOM.volume.getBoundingClientRect();
                let pos = 1 - (rect.right - e.pageX) / this.DOM.volume.offsetWidth;
                changeAudioVolume(pos);
            }
        })

        changeAudioVolume(this.audioElement.volume);
    }
}