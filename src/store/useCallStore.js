import { create } from "zustand";

export const useCallStore = create((set, get) => ({
    callStatus: "idle", // idle, incoming, outgoing, connected, ending
    callType: "audio", // "audio" or "video"
    caller: null,
    callerSignal: null,
    localStream: null,
    remoteStream: null,
    callDuration: 0,
    timerInterval: null,
    peer: null,

    setCallStatus: (status) => set({ callStatus: status }),
    setCallType: (type) => set({ callType: type }),
    setCaller: (caller) => set({ caller }),
    setCallerSignal: (signal) => set({ callerSignal: signal }),
    setLocalStream: (stream) => set({ localStream: stream }),
    setRemoteStream: (stream) => set({ remoteStream: stream }),
    setPeer: (peer) => set({ peer }),

    startCallDurationTimer: () => {
        // Clear any existing timer
        if (get().timerInterval) clearInterval(get().timerInterval);

        set({ callDuration: 0 });
        const interval = setInterval(() => {
            set((state) => ({ callDuration: state.callDuration + 1 }));
        }, 1000);
        set({ timerInterval: interval });
    },

    stopCallDurationTimer: () => {
        if (get().timerInterval) {
            clearInterval(get().timerInterval);
            set({ timerInterval: null });
        }
    },

    resetCall: () => {
        get().stopCallDurationTimer();
        const { localStream, peer } = get();

        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
        }

        if (peer) {
            peer.destroy();
        }

        set({
            callStatus: "idle",
            callType: "audio", // Reset to default
            caller: null,
            callerSignal: null,
            localStream: null,
            remoteStream: null,
            callDuration: 0,
            peer: null,
        });
    },

    initiateCall: () => {
        set({ callStatus: "outgoing" });
    }
}));
