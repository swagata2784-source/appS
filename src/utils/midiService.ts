import { MidiDevice, MidiNoteEvent } from '../types';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToPitchName(midiNumber: number): string {
  if (midiNumber < 0 || midiNumber > 127) return '';
  const noteIndex = midiNumber % 12;
  const octave = Math.floor(midiNumber / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function pitchNameToMidi(pitchName: string): number {
  const match = pitchName.trim().toUpperCase().match(/^([A-G][#B]?)(-?\d+)$/);
  if (!match) return 60;
  const name = match[1];
  const oct = parseInt(match[2], 10);
  let semitone = 0;
  switch (name) {
    case 'C': semitone = 0; break;
    case 'C#': case 'DB': semitone = 1; break;
    case 'D': semitone = 2; break;
    case 'D#': case 'EB': semitone = 3; break;
    case 'E': semitone = 4; break;
    case 'F': semitone = 5; break;
    case 'F#': case 'GB': semitone = 6; break;
    case 'G': semitone = 7; break;
    case 'G#': case 'AB': semitone = 8; break;
    case 'A': semitone = 9; break;
    case 'A#': case 'BB': semitone = 10; break;
    case 'B': semitone = 11; break;
    default: semitone = 0;
  }
  return (oct + 1) * 12 + semitone;
}

export interface MidiServiceCallbacks {
  onNoteOn: (event: MidiNoteEvent) => void;
  onNoteOff: (event: MidiNoteEvent) => void;
  onDevicesChange: (devices: MidiDevice[]) => void;
  onDeviceDisconnect: (deviceName: string) => void;
}

class MidiManager {
  private midiAccess: any = null;
  private isInitialized = false;
  private callbacks: MidiServiceCallbacks | null = null;
  private boundInputs = new Set<string>();

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
  }

  public async initialize(callbacks: MidiServiceCallbacks): Promise<{
    supported: boolean;
    devices: MidiDevice[];
    error?: string;
  }> {
    this.callbacks = callbacks;

    if (!this.isSupported()) {
      return {
        supported: false,
        devices: [],
        error: 'Web MIDI API is not supported in this browser.',
      };
    }

    try {
      const midiAccess = await (navigator as any).requestMIDIAccess({ sysex: false });
      this.midiAccess = midiAccess;
      this.isInitialized = true;

      // Handle connection/disconnection events
      this.midiAccess.onstatechange = (e: any) => {
        this.handleStateChange(e);
      };

      // Bind all existing inputs
      this.bindInputs();

      const devices = this.getConnectedDevices();
      return {
        supported: true,
        devices,
      };
    } catch (err: any) {
      console.warn('Could not acquire MIDI access:', err?.message || err);
      return {
        supported: true,
        devices: [],
        error: 'MIDI access was not granted by the browser.',
      };
    }
  }

  public getConnectedDevices(): MidiDevice[] {
    if (!this.midiAccess) return [];
    const devices: MidiDevice[] = [];
    const inputs = this.midiAccess.inputs.values();
    for (const input of inputs) {
      if (input.state === 'connected') {
        devices.push({
          id: input.id,
          name: input.name || 'MIDI Keyboard',
          manufacturer: input.manufacturer || 'General MIDI',
          connectionType: 'usb',
          state: 'connected',
        });
      }
    }
    return devices;
  }

  private bindInputs() {
    if (!this.midiAccess) return;
    const inputs = this.midiAccess.inputs.values();
    for (const input of inputs) {
      if (!this.boundInputs.has(input.id)) {
        input.onmidimessage = (message: any) => this.handleMidiMessage(message);
        this.boundInputs.add(input.id);
      }
    }
  }

  private handleStateChange(e: any) {
    const port = e?.port;
    if (!port || port.type !== 'input') return;

    if (port.state === 'disconnected') {
      this.boundInputs.delete(port.id);
      if (this.callbacks) {
        this.callbacks.onDeviceDisconnect(port.name || 'MIDI Keyboard');
      }
    } else if (port.state === 'connected') {
      port.onmidimessage = (message: any) => this.handleMidiMessage(message);
      this.boundInputs.add(port.id);
    }

    if (this.callbacks) {
      this.callbacks.onDevicesChange(this.getConnectedDevices());
    }
  }

  private handleMidiMessage(event: any) {
    if (!event || !event.data || !this.callbacks) return;
    const data = event.data;
    const status = data[0] & 0xf0;
    const midiNumber = data[1];
    const velocity = data.length > 2 ? data[2] : 64;

    if (midiNumber === undefined) return;

    const noteName = midiToPitchName(midiNumber);
    const octave = Math.floor(midiNumber / 12) - 1;
    const timestamp = event.timeStamp || Date.now();

    if (status === 0x90 && velocity > 0) {
      // Note On
      this.callbacks.onNoteOn({
        type: 'noteon',
        midiNumber,
        noteName,
        octave,
        velocity,
        timestamp,
      });
    } else if (status === 0x80 || (status === 0x90 && velocity === 0)) {
      // Note Off
      this.callbacks.onNoteOff({
        type: 'noteoff',
        midiNumber,
        noteName,
        octave,
        velocity,
        timestamp,
      });
    }
  }

  public triggerSimulatedNoteOn(midiNumber: number, velocity = 80) {
    if (!this.callbacks) return;
    const noteName = midiToPitchName(midiNumber);
    const octave = Math.floor(midiNumber / 12) - 1;
    this.callbacks.onNoteOn({
      type: 'noteon',
      midiNumber,
      noteName,
      octave,
      velocity,
      timestamp: Date.now(),
    });
  }

  public triggerSimulatedNoteOff(midiNumber: number) {
    if (!this.callbacks) return;
    const noteName = midiToPitchName(midiNumber);
    const octave = Math.floor(midiNumber / 12) - 1;
    this.callbacks.onNoteOff({
      type: 'noteoff',
      midiNumber,
      noteName,
      octave,
      velocity: 0,
      timestamp: Date.now(),
    });
  }

  public cleanup() {
    if (this.midiAccess) {
      try {
        const inputs = this.midiAccess.inputs.values();
        for (const input of inputs) {
          input.onmidimessage = null;
        }
        this.midiAccess.onstatechange = null;
      } catch {}
      this.boundInputs.clear();
      this.midiAccess = null;
      this.isInitialized = false;
      this.callbacks = null;
    }
  }
}

export const midiManager = new MidiManager();
