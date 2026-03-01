import { useState } from "react";
import { VoiceRecorder } from "capacitor-voice-recorder";


export const useVoiceCapture = () => {
    const [isRecording, setIsRecording] = useState(false);

    const startRecording = async () => {
        const hasPermission = await VoiceRecorder.requestAudioRecordingPermission();
        if(hasPermission.value) {
            await VoiceRecorder.startRecording();
            setIsRecording(true);
        }
    };

    const stopRecording = async () => {
        const result = await VoiceRecorder.stopRecording();
        setIsRecording(false);
        return result.value;
    };

    return { isRecording, startRecording, stopRecording };
}