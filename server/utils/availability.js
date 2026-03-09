const MINUTES_IN_DAY = 24 * 60;

const parseTimeToMinutes = (time) => {
  if (!time || typeof time !== 'string' || !time.includes(':')) return null;
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const total = h * 60 + m;
  if (total < 0 || total > MINUTES_IN_DAY) return null;
  return total;
};

const formatMinutesToTime = (minutes) => {
  const clamped = Math.max(0, Math.min(minutes, MINUTES_IN_DAY));
  const hour = String(Math.floor(clamped / 60)).padStart(2, '0');
  const min = String(clamped % 60).padStart(2, '0');
  return `${hour}:${min}`;
};

const toDateOnlyKey = (dateInput) => {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const isTimeWithinWindow = ({ startTime, endTime, targetTime }) => {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const target = parseTimeToMinutes(targetTime);
  if (start === null || end === null || target === null) return false;
  return target >= start && target < end;
};

const getEffectiveAvailabilityForDate = (officer, dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  const dayOfWeek = date.getUTCDay();
  const weeklyRule = officer?.availability?.weekly?.find((slot) => slot.dayOfWeek === dayOfWeek);

  const normalizedDate = toDateOnlyKey(date);
  const exception = officer?.availability?.exceptions?.find(
    (item) => toDateOnlyKey(item.date) === normalizedDate
  );

  if (exception) {
    if (!exception.isAvailable) return null;
    if (!exception.startTime || !exception.endTime) return null;
    return {
      startTime: exception.startTime,
      endTime: exception.endTime,
      slotDurationMinutes: weeklyRule?.slotDurationMinutes || 30,
    };
  }

  if (!weeklyRule || !weeklyRule.enabled) return null;
  return {
    startTime: weeklyRule.startTime,
    endTime: weeklyRule.endTime,
    slotDurationMinutes: weeklyRule.slotDurationMinutes,
  };
};

const buildSlotsForDate = ({ officer, dateString, existingConsultations = [] }) => {
  const window = getEffectiveAvailabilityForDate(officer, dateString);
  if (!window) return [];

  const start = parseTimeToMinutes(window.startTime);
  const end = parseTimeToMinutes(window.endTime);
  const slotDuration = window.slotDurationMinutes || 30;

  if (start === null || end === null || end <= start) return [];

  const bookedTimes = new Set(
    existingConsultations
      .map((consultation) => consultation.scheduledTime)
      .filter(Boolean)
  );

  const slots = [];
  for (let pointer = start; pointer + slotDuration <= end; pointer += slotDuration) {
    const time = formatMinutesToTime(pointer);
    slots.push({
      time,
      available: !bookedTimes.has(time),
    });
  }

  return slots;
};

module.exports = {
  buildSlotsForDate,
  formatMinutesToTime,
  getEffectiveAvailabilityForDate,
  isTimeWithinWindow,
  parseTimeToMinutes,
  toDateOnlyKey,
};