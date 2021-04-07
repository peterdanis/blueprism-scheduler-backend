import Setting from "../entities/Setting";

export const defaultPriority = 50;
export const checkInterval = 5000; // Min delay between two checks of job queue
export const recheckDelay = 30000; // Min delay between two "check status" request sent to runtime resource
export const maxRetryTime = 120000; // Maximum time for network / SQL retries
export const defaultTimezone = (() =>
  Intl.DateTimeFormat().resolvedOptions().timeZone)();
export const preferedTimezone = (() =>
  Intl.DateTimeFormat().resolvedOptions().timeZone)();

export const getSettings = async (): Promise<Setting[]> => {
  return Setting.find();
};

// const loadDefaultSettingsToDb = () => {
//   const settings = await getSettings();
// };
