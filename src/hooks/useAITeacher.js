import { create } from "zustand";

export const teachers = ["Neerja", "Prabhat"];

export const useAITeacher = create((set, get) => ({
  messages: [],
  currentMessage: null,
  teacher: teachers[0],
  setTeacher: (teacher) => {
    set(() => ({
      teacher,
      messages: get().messages.map((message) => {
        message.audioPlayer = null; // New teacher, new Voice
        return message;
      }),
    }));
  },
  classroom: "default",
  setClassroom: (classroom) => {
    set(() => ({
      classroom,
    }));
  },
  loading: false,
  furigana: true,
  setFurigana: (furigana) => {
    set(() => ({
      furigana,
    }));
  },
  english: true,
  setEnglish: (english) => {
    set(() => ({
      english,
    }));
  },
  speech: "formal",
  setSpeech: (speech) => {
    set(() => ({
      speech,
    }));
  },
  askAI: async (question) => {
    if (!question) {
      return;
    }
    const message = {
      question,
      id: get().messages.length,
    };
    set(() => ({
      loading: true,
    }));

    const speech = get().speech;

    // Ask AI
    try {
      const res = await fetch(`/api/ai?question=${question}&speech=${speech}`);
      const data = await res.json();
      message.answer = data.answer;
      message.explanation = data.explanation;
      message.additional_info = data.additional_info;
      message.speech = speech;

      set(() => ({
        currentMessage: message,
      }));

      set((state) => ({
        messages: [...state.messages, message],
        loading: false,
      }));
      get().playMessage(message);
    } catch (error) {
      console.error("Error asking AI:", error);
      set(() => ({
        loading: false,
      }));
    }
  },
  playMessage: async (message) => {
    set(() => ({
      currentMessage: message,
    }));

    if (!message.audioPlayer) {
      set(() => ({
        loading: true,
      }));
      // Get TTS
      try {
        
        const audioRes = await fetch(
          `/api/tts?teacher=${get().teacher}&text=${message.answer}`
        );
        const audio = await audioRes.blob();
        const visemes = JSON.parse(await audioRes.headers.get("visemes"));
        const audioUrl = URL.createObjectURL(audio);
        const audioPlayer = new Audio(audioUrl);

        message.visemes = visemes;
        message.audioPlayer = audioPlayer;
        message.audioPlayer.onended = () => {
          set(() => ({
            currentMessage: null,
          }));
        };
        set(() => ({
          loading: false,
          messages: get().messages.map((m) => {
            if (m.id === message.id) {
              return message;
            }
            return m;
          }),
        }));
      } catch (error) {
        console.error("Error fetching TTS:", error);
        set(() => ({
          loading: false,
        }));
      }
    }

    if (message.audioPlayer) {
      message.audioPlayer.currentTime = 0;
      message.audioPlayer.play();
    } else {
      console.error("Audio player is not defined for message:", message);
    }
  },
  stopMessage: (message) => {
    if (message.audioPlayer) {
      message.audioPlayer.pause();
    }
    set(() => ({
      currentMessage: null,
    }));
  },
}));
