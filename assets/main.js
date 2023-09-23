window.console = window.console || function (t) {};
window.pianoAppConfig = {
  openAIKey: "",
  openAIModal: "gpt-3.5-turbo-16k-0613", // "gpt-4"
  startingA4: 240,
  durationRest: 90,
  backgroundImage: "",
  totalPiano: 1,
  presetPrompt: "",
  isTurnOff: false,
};
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const settingsIcon = document.getElementById("settings-icon");
const modal = document.getElementById("modal");
const close = document.getElementById("close");

const chatIcon = document.getElementById("chat-icon");
const modalAI = document.getElementById("modal-chat-ai");
const closeAI = document.getElementById("close-modal-chat-ai");

const infoIcon = document.getElementById("info-icon");
const modalInfo = document.getElementById("modal-info-ai");
const closeInfo = document.getElementById("close-modal-info-ai");

const melodySection1 = document.getElementById("melody-section-1");
const OPENAI_API_KEY = document.getElementById("openAIKey");
const OPENAI_API_MODAL = document.getElementById("openAIModal");
const STARTING_A4 = document.getElementById("startingA4");
const BACKGROUND_IMAGE = document.getElementById("backgroundImage");
const DURATION_REST = document.getElementById("durationRest");
const LOADER_CIRCLE = document.getElementById("loaderApi");

const CHAT_INVALID_API_KEY = document.getElementById("chat-invalid-api-key");
const CHAT_PRESET_API_PROMPT = document.getElementById(
  "chat-preset-api-prompt"
);
const COPY_TEXTAREA = document.querySelector(".copy-textarea");
const CHAT_PRESET_API_PROMPT_TEXTAREA = document.querySelector(
  "#chat-preset-api-prompt textarea"
);
const CHAT_INPUT = document.getElementById("chat-input");
const CHAT_INPUT_TEXTAREA = document.getElementById("chatInput");
const CHAT_CONTENT = document.getElementById("chat-content");

const getElementByNote = (note) =>
  note && document.querySelector(`[note="${note}"]`);

const keys = {
  A: { element: getElementByNote("C1"), note: "C", octaveOffset: 0 },
  Z: { element: getElementByNote("C#1"), note: "C#", octaveOffset: 0 },
  S: { element: getElementByNote("D1"), note: "D", octaveOffset: 0 },
  X: { element: getElementByNote("D#1"), note: "D#", octaveOffset: 0 },
  D: { element: getElementByNote("E1"), note: "E", octaveOffset: 0 },
  F: { element: getElementByNote("F1"), note: "F", octaveOffset: 0 },
  V: { element: getElementByNote("F#1"), note: "F#", octaveOffset: 0 },
  G: { element: getElementByNote("G1"), note: "G", octaveOffset: 0 },
  B: { element: getElementByNote("G#1"), note: "G#", octaveOffset: 0 },
  H: { element: getElementByNote("A1"), note: "A", octaveOffset: 1 },
  N: { element: getElementByNote("A#1"), note: "A#", octaveOffset: 1 },
  J: { element: getElementByNote("B1"), note: "B", octaveOffset: 1 },
  K: { element: getElementByNote("C2"), note: "C", octaveOffset: 1 },
  ",": { element: getElementByNote("C#2"), note: "C#", octaveOffset: 1 },
  L: { element: getElementByNote("D2"), note: "D", octaveOffset: 1 },
  ".": { element: getElementByNote("D#2"), note: "D#", octaveOffset: 1 },
  semicolon: {
    element: getElementByNote("E2"),
    note: "E",
    octaveOffset: 1,
  },
  Q: { element: getElementByNote("F2"), note: "F", octaveOffset: 1 },
  2: { element: getElementByNote("F#2"), note: "F#", octaveOffset: 1 },
  W: { element: getElementByNote("G2"), note: "G", octaveOffset: 1 },
  3: { element: getElementByNote("G#2"), note: "G#", octaveOffset: 1 },
  E: { element: getElementByNote("A2"), note: "A", octaveOffset: 2 },
  4: { element: getElementByNote("A#2"), note: "A#", octaveOffset: 2 },
  R: { element: getElementByNote("B2"), note: "B", octaveOffset: 2 },
  T: { element: getElementByNote("C3"), note: "C", octaveOffset: 2 },
};

const keysNoteMapping = {};
keysNoteMapping["C1"] = "A";
keysNoteMapping["C#1"] = "W";
keysNoteMapping["D1"] = "S";
keysNoteMapping["D#1"] = "E";
keysNoteMapping["E1"] = "D";
keysNoteMapping["F1"] = "F";
keysNoteMapping["F#1"] = "T";
keysNoteMapping["G1"] = "G";
keysNoteMapping["G#1"] = "Y";
keysNoteMapping["A1"] = "H";
keysNoteMapping["A#1"] = "U";
keysNoteMapping["B1"] = "J";
keysNoteMapping["C2"] = "K";
keysNoteMapping["C#2"] = "O";
keysNoteMapping["D2"] = "L";
keysNoteMapping["D#2"] = "P";
keysNoteMapping["E2"] = "semicolon";
keysNoteMapping["F2"] = "Q";
keysNoteMapping["F#2"] = "2";
keysNoteMapping["G2"] = "W";
keysNoteMapping["G#2"] = "3";
keysNoteMapping["A2"] = "E";
keysNoteMapping["A#2"] = "4";
keysNoteMapping["B2"] = "R";
keysNoteMapping["C3"] = "T";

const getHz = (note = "A", octave = 44) => {
  const A4 = window.pianoAppConfig.startingA4;

  let N = 0;
  switch (note) {
    default:
    case "A":
      N = 0;
      break;
    case "A#":
    case "Bb":
      N = 1;
      break;
    case "B":
      N = 2;
      break;
    case "C":
      N = 3;
      break;
    case "C#":
    case "Db":
      N = 4;
      break;
    case "D":
      N = 5;
      break;
    case "D#":
    case "Eb":
      N = 6;
      break;
    case "E":
      N = 7;
      break;
    case "F":
      N = 8;
      break;
    case "F#":
    case "Gb":
      N = 9;
      break;
    case "G":
      N = 10;
      break;
    case "G#":
    case "Ab":
      N = 11;
      break;
  }

  N += 12 * (octave - 4);
  return A4 * Math.pow(2, N / 12);
};

const pressedNotes = new Map();
let clickedKey = "";
const playKeyNote = (keyNote) => {
  const actualKeyNote = keysNoteMapping[keyNote];
  playKey(actualKeyNote);
  setTimeout(() => {
    stopKey(actualKeyNote);
  }, 600);
};

const playKey = (key) => {
  if (!keys[key]) {
    return;
  }

  const osc = audioContext.createOscillator();

  // osc.type = 'triangle';
  // "sine", "square", "sawtooth", "triangle" and "custom". The default is "sine".
  const noteGainNode = audioContext.createGain();
  noteGainNode.connect(audioContext.destination);

  const zeroGain = 0.00001;
  const maxGain = 0.5;
  const sustainedGain = 0.001;

  noteGainNode.gain.value = zeroGain;

  const setAttack = () =>
    noteGainNode.gain.exponentialRampToValueAtTime(
      maxGain,
      audioContext.currentTime + 0.01
    );

  const setDecay = () =>
    noteGainNode.gain.exponentialRampToValueAtTime(
      sustainedGain,
      audioContext.currentTime + 1
    );

  const setRelease = () =>
    noteGainNode.gain.exponentialRampToValueAtTime(
      zeroGain,
      audioContext.currentTime + 2
    );

  setAttack();
  setDecay();
  setRelease();

  osc.connect(noteGainNode);
  osc.type = "triangle";

  const freq = getHz(keys[key].note, (keys[key].octaveOffset || 0) + 3);

  if (Number.isFinite(freq)) {
    osc.frequency.value = freq;
  }

  keys[key].element.classList.add("pressed");
  pressedNotes.set(key, osc);
  pressedNotes.get(key).start();
};

const stopKey = (key) => {
  if (!keys[key]) {
    return;
  }

  keys[key].element.classList.remove("pressed");
  const osc = pressedNotes.get(key);

  if (osc) {
    setTimeout(() => {
      osc.stop();
    }, 2000);

    pressedNotes.delete(key);
  }
};

document.addEventListener("keydown", (e) => {
  const eventKey = e.key.toUpperCase();
  const key = eventKey === ";" ? "semicolon" : eventKey;

  if (!key || pressedNotes.get(key)) {
    return;
  }
  playKey(key);
});

document.addEventListener("keyup", (e) => {
  const eventKey = e.key.toUpperCase();
  const key = eventKey === ";" ? "semicolon" : eventKey;

  if (!key) {
    return;
  }
  stopKey(key);
});

for (const [key, { element }] of Object.entries(keys)) {
  element.addEventListener("mousedown", () => {
    playKey(key);
    clickedKey = key;
  });
}

document.addEventListener("mouseup", () => {
  stopKey(clickedKey);
});
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const playNotesFromJson = async (musicNotes) => {
  // E-G----C-D-E-G----C-D
  const notes = musicNotes.split("-");

  const playNote = async (note) => {
    const delayTimer = window.pianoAppConfig.durationRest;

    if (note === "-") {
      await delay(delayTimer);
    } else {
      playKeyNote(note);
      await delay(delayTimer);
    }
  };

  for (let i = 0; i < notes.length; i++) {
    if (window.pianoAppConfig.isTurnOff) {
      break;
      return false;
    }
    await playNote(notes[i]);
  }
};
const hasMusicNotes = (text) => {
  const regex = /[A-G]#?\d+(?:-)?/;
  return regex.test(text);
};
const extractNotes = (input) => {
  const regex = /[A-G]#?\d+(?:-)?/g;
  const matches = [...input.matchAll(regex)];
  const extractedNotes = matches.map((match) => match[0]).join("-");
  const replacedInput = input.replace(/.*?(?=[A-G]#?\d+(?:-)?)/, "");
  return replacedInput;
};

const showErrorChatApiKey = (isShowingError) => {
  CHAT_INVALID_API_KEY.style.display = isShowingError ? "block" : "none";
  CHAT_INPUT.style.display = isShowingError ? "none" : "block";
  CHAT_CONTENT.style.display = isShowingError ? "none" : "block";
  LOADER_CIRCLE.style.display = "none";
};

const showPresetChatApiPrompt = (isShowing) => {
  window.pianoAppConfig.presetPrompt = CHAT_PRESET_API_PROMPT_TEXTAREA.value;
  COPY_TEXTAREA.value = CHAT_PRESET_API_PROMPT_TEXTAREA.value;
  CHAT_PRESET_API_PROMPT.style.display = isShowing ? "block" : "none";
  CHAT_INPUT.style.display = isShowing ? "none" : "block";
  CHAT_CONTENT.style.display = isShowing ? "none" : "block";
  LOADER_CIRCLE.style.display = "none";
};
const getOpenAiResponse = async (prompt) => {
  const openAiApiKey = OPENAI_API_KEY.value;
  const openAIModal = OPENAI_API_MODAL.value;
  LOADER_CIRCLE.style.display = "";
  const regex = /[A-G]#?\d+/;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${openAiApiKey}`,
    },
    body: JSON.stringify({
      model: openAIModal,
      messages: [
        {
          role: "system",
          content: "Welcome, I'm Piano AI wizard!",
        },
        {
          role: "user",
          content: window.pianoAppConfig.presetPrompt + " \n" + prompt,
        },
      ],
      stream: true,
    }),
  });
  // error - handle api key
  if (response.status >= 400) {
    showErrorChatApiKey(true);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = await reader.read();

  const clonedElement2 = createBubbleChat(false, "");
  CHAT_CONTENT.append(clonedElement2);

  while (!result.done) {
    LOADER_CIRCLE.style.display = "none";
    const responseText = decoder.decode(result.value, { stream: true });
    // Update the UI with the responseText
    const parsedData = responseText.split("\n").map((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("data:")) {
        try {
          const jsonData = JSON.parse(trimmedLine.slice(5));
          const decodedContent = jsonData.choices[0].delta.content;

          document.getElementById(clonedElement2.id).innerHTML +=
            decodedContent || "";

          return decodedContent;
        } catch (e) {}
      }
    });
    result = await reader.read();
  }
  const melodyNotesResp = document.getElementById(clonedElement2.id).innerHTML;
  const playFromChatElement = document.createElement("span");
  playFromChatElement.className = "play-button-from-chat";
  playFromChatElement.onclick = () => {
    playNotesFromJson(extractNotes(melodyNotesResp));
  };
  document.getElementById(clonedElement2.id).append(playFromChatElement);
  // return data.choices[0].message.content;
};
const loadPlayMusic = () => {
  const totalPianos = window.pianoAppConfig.totalPiano;
  window.pianoAppConfig.isTurnOff = false;
  for (let i = 1; i <= totalPianos; i++) {
    playNotesFromJson(getMusicValue(`#melody-section-${i} textarea`));
  }
};
const loadMusic = () => {
  let timerWait = 0;
  if (!window.pianoAppConfig.isTurnOff) {
    window.pianoAppConfig.isTurnOff = true;
    timerWait = 600;
  }

  setTimeout(() => {
    loadPlayMusic();
  }, timerWait);
};
const stopMusic = () => {
  window.pianoAppConfig.isTurnOff = true;
};

const getMusicValue = (domId) => {
  let musicVal = document.querySelector(domId).value || ``;
  musicVal = musicVal.toUpperCase();
  musicVal = musicVal.replace(/\s+/g, "");
  return musicVal;
};
// copypaste

//setting modal
settingsIcon.addEventListener("click", () => {
  modal.style.display = "block";
});

const saveSettingConfig = () => {
  window.pianoAppConfig.openAIKey = OPENAI_API_KEY.value;
  window.pianoAppConfig.openAIModal = OPENAI_API_MODAL.value;
  window.pianoAppConfig.startingA4 = parseInt(STARTING_A4.value || 0);
  window.pianoAppConfig.durationRest = parseInt(DURATION_REST.value || 0);

  window.pianoAppConfig.backgroundImage = BACKGROUND_IMAGE.value;
  document.body.style.backgroundImage = `-`;
  if (window.pianoAppConfig.backgroundImage) {
    document.body.style.backgroundImage = `url('${window.pianoAppConfig.backgroundImage}')`;
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
  }
  modal.style.display = "none";
};
close.addEventListener("click", () => {
  saveSettingConfig();
  modal.style.display = "none";
});

// chat modal

chatIcon.addEventListener("click", () => {
  showErrorChatApiKey(false);
  showPresetChatApiPrompt(false);
  modalAI.style.display = "block";
});

closeAI.addEventListener("click", () => {
  modalAI.style.display = "none";
});

infoIcon.addEventListener("click", () => {
  modalInfo.style.display = "block";
});

closeInfo.addEventListener("click", () => {
  modalInfo.style.display = "none";
});

const addAnother = () => {
  window.pianoAppConfig.totalPiano++;
  const clonedSection = melodySection1.cloneNode(true);
  clonedSection.id = "melody-section-" + window.pianoAppConfig.totalPiano;
  melodySection1.parentNode.append(clonedSection);
  window.scrollTo(
    0,
    document.documentElement.scrollHeight || document.body.scrollHeight
  );
};
const generateUniqueId = () => {
  const timestamp = Date.now();
  const randomNum = Math.random() * 1000000;
  const uniqueId = `${timestamp}-${randomNum}`;
  return uniqueId;
};

const createBubbleChat = (isUser, valueHtml) => {
  const originalElement = document.getElementById(
    isUser ? "user-message-template" : "bot-message-template"
  );
  const clonedElement = originalElement.cloneNode(true);
  const timestamp = generateUniqueId() + "";

  clonedElement.id = "new-" + timestamp + (isUser ? "-user" : "-bot");
  clonedElement.innerHTML = valueHtml;
  clonedElement.style.whiteSpace = "pre-wrap";
  return clonedElement;
};

const submitChat = () => {
  const clonedElement1 = createBubbleChat(true, CHAT_INPUT_TEXTAREA.value);
  CHAT_CONTENT.append(clonedElement1);

  // Usage example
  const prompt = clonedElement1.innerHTML;
  getOpenAiResponse(prompt);
};

showErrorChatApiKey(false);
showPresetChatApiPrompt(false);
