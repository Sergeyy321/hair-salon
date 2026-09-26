export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 18;
export const TOTAL_HOURS = 10;
export const HOUR_HEIGHT = 72;
export const MINUTE_HEIGHT = 1.2;

export const parseTimeToMinutes = (timeVal: string | Date): number => {
  if (timeVal instanceof Date) {
    return timeVal.getHours() * 60 + timeVal.getMinutes();
  }

  if (timeVal.includes('T')) {
    const d = new Date(timeVal);
    return d.getHours() * 60 + d.getMinutes();
  }

  const parts = timeVal.split(':');
  const hours = Number(parts[0]) || 0;
  const minutes = Number(parts[1]) || 0;
  return hours * 60 + minutes;
};

export const formatMinutesToTimeString = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const calculateTimelineGeometry = (
  startTimeVal: string | Date,
  endTimeVal: string | Date
) => {
  const startMinutes = parseTimeToMinutes(startTimeVal);
  const endMinutes = parseTimeToMinutes(endTimeVal);
  const dayStartMinutes = DAY_START_HOUR * 60;

  const topOffsetMinutes = Math.max(0, startMinutes - dayStartMinutes);
  const duration = Math.max(15, endMinutes - startMinutes);

  const top = topOffsetMinutes * MINUTE_HEIGHT;
  const height = Math.max(28, duration * MINUTE_HEIGHT - 2);

  return {
    top: `${top}px`,
    height: `${height}px`,
  };
};

export const getCurrentTimeInfo = (): { offsetPx: number; timeString: string } | null => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const dayStartMinutes = DAY_START_HOUR * 60;
  const dayEndMinutes = DAY_END_HOUR * 60;

  if (currentMinutes < dayStartMinutes || currentMinutes > dayEndMinutes) {
    return null;
  }

  const offsetPx = (currentMinutes - dayStartMinutes) * MINUTE_HEIGHT;
  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return { offsetPx, timeString };
};
