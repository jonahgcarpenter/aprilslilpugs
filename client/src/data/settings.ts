export interface SettingsData {
  waitlist_enabled: boolean;
  stream_enabled: boolean;
  stream_down: boolean;
}

export const mockSettings: SettingsData = {
  waitlist_enabled: true,
  stream_enabled: true,
  stream_down: false,
};
