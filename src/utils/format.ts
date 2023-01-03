import dayjs from 'dayjs';

export const formatDate = (date: Date) => dayjs(date).format('YYYY/M/D');

export const formatElapsedTime = (from: Date): string => {
  const now = new Date();
  const elapsedTimeMS = now.getTime() - from.getTime();
  const secondMS = 1000;
  const minuteMS = secondMS * 60;
  const hourMS = minuteMS * 60;
  const dayMS = hourMS * 24;

  if (elapsedTimeMS >= dayMS) {
    const elapsedDays = Math.floor(elapsedTimeMS / dayMS);
    return `${elapsedDays} day${elapsedDays > 1 ? 's' : ''}`;
  }
  if (elapsedTimeMS >= hourMS) {
    const elapsedHours = Math.floor(elapsedTimeMS / hourMS);
    return `${elapsedHours} hour${elapsedHours > 1 ? 's' : ''}`;
  }
  if (elapsedTimeMS >= minuteMS) {
    const elapsedMinutes = Math.floor(elapsedTimeMS / minuteMS);
    return `${elapsedMinutes} minute${elapsedMinutes > 1 ? 's' : ''}`;
  }
  if (elapsedTimeMS >= secondMS) {
    const elapsedSeconds = Math.floor(elapsedTimeMS / secondMS);
    return `${elapsedSeconds} second${elapsedSeconds > 1 ? 's' : ''}`;
  }

  return `${elapsedTimeMS} ms`;
};
