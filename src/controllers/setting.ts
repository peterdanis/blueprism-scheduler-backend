import Setting from "../entities/Setting";

export const defaultPriority = 50;
export const checkInterval = 5000; // Min delay between two checks of job queue
export const recheckDelay = 30000; // Min delay between two "check status" request sent to runtime resource
export const maxRetryTime = 120000; // Maximum time for network / SQL retries
export const defaultTimezone = (() =>
  Intl.DateTimeFormat().resolvedOptions().timeZone)();
export const preferedTimezone = (() =>
  Intl.DateTimeFormat().resolvedOptions().timeZone)();

let settingsCache: Setting[] | undefined;

export const getSettings = async (): Promise<Setting[]> => {
  if (settingsCache) {
    return settingsCache;
  }
  settingsCache = await Setting.find();
  return settingsCache;
};

const loadDefaultSettingsToDb = async () => {
  const settings = await getSettings();
  const settingsKeys = settings.map((setting) => setting.key);
  if (!settingsKeys.includes("defaultPriority")) {
    const setting = Setting.create();
    setting.key = "defaultPriority";
  }
};
