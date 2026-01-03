export const SoundManager = {
  correctSynth: null,
  wrongSynth: null,
  volumeNode: null,
  init: function () {
    this.volumeNode = new Tone.Gain(0.3).toDestination();

    this.correctSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.1, release: 0.5 },
    }).connect(this.volumeNode);

    this.wrongSynth = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
    }).connect(this.volumeNode);
  },
  playCorrect: function () {
    try {
      if (Tone.context.state !== "running") Tone.start();
      this.correctSynth.releaseAll();
      this.correctSynth.triggerAttackRelease(["C6", "E6"], "16n");
    } catch (e) {
      console.warn("Audio blocked", e);
    }
  },
  playWrong: function () {
    try {
      if (Tone.context.state !== "running") Tone.start();
      this.wrongSynth.triggerAttackRelease("A2", "8n");
    } catch (e) {
      console.warn("Audio blocked", e);
    }
  },
};
