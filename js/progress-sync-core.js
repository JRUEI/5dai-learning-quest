const positiveNumber = value => Math.max(0, Number(value) || 0);

const blankDay = () => ({
  resetAt: 0,
  assignments: {},
  assignmentSections: {},
  podcastSections: {},
  whitepaper: null
});

export const blankSyncState = () => ({
  version: 2,
  days: { day1: blankDay(), day2: blankDay() }
});

const assignmentRecord = value => {
  if (typeof value === "boolean") return { value, updatedAt: 1 };
  if (!value || typeof value !== "object") return null;
  return { value: Boolean(value.value), updatedAt: positiveNumber(value.updatedAt) };
};

const sectionRecords = value => {
  const records = {};
  Object.entries(value || {}).forEach(([id, entry]) => {
    const updatedAt = typeof entry === "number" ? positiveNumber(entry) : (entry ? 1 : 0);
    if (updatedAt) records[id] = updatedAt;
  });
  return records;
};

const whitepaperRecord = value => {
  if (!value || typeof value !== "object") return null;
  return {
    slide: positiveNumber(value.slide),
    opened: Boolean(value.opened || positiveNumber(value.slide) > 0),
    updatedAt: positiveNumber(value.updatedAt)
  };
};

const normalizeDay = value => {
  const day = blankDay();
  day.resetAt = positiveNumber(value?.resetAt);
  Object.entries(value?.assignments || {}).forEach(([id, entry]) => {
    const record = assignmentRecord(entry);
    if (record?.updatedAt) day.assignments[id] = record;
  });
  day.assignmentSections = sectionRecords(value?.assignmentSections);
  day.podcastSections = sectionRecords(value?.podcastSections);
  day.whitepaper = whitepaperRecord(value?.whitepaper);
  return day;
};

export function normalizeSyncState(value = {}) {
  if (value?.days) {
    return {
      version: 2,
      days: {
        day1: normalizeDay(value.days.day1),
        day2: normalizeDay(value.days.day2)
      }
    };
  }

  const migrated = blankSyncState();
  migrated.days.day1 = normalizeDay({
    assignments: value.assignments,
    podcastSections: value.podcastSections,
    whitepaper: {
      slide: positiveNumber(value.whitepaperSlide),
      opened: Boolean(value.whitepaperOpened),
      updatedAt: value.whitepaperOpened || positiveNumber(value.whitepaperSlide) ? 1 : 0
    }
  });
  return migrated;
}

function mergeAssignments(left, right, resetAt) {
  const merged = {};
  for (const records of [left || {}, right || {}]) {
    Object.entries(records).forEach(([id, entry]) => {
      const record = assignmentRecord(entry);
      if (!record || record.updatedAt <= resetAt) return;
      if (!merged[id] || record.updatedAt >= merged[id].updatedAt) merged[id] = record;
    });
  }
  return merged;
}

function mergeSections(left, right, resetAt) {
  const merged = {};
  for (const records of [left || {}, right || {}]) {
    Object.entries(records).forEach(([id, entry]) => {
      const updatedAt = positiveNumber(entry);
      if (updatedAt > resetAt) merged[id] = Math.max(merged[id] || 0, updatedAt);
    });
  }
  return merged;
}

function mergeWhitepaper(left, right, resetAt) {
  const candidates = [whitepaperRecord(left), whitepaperRecord(right)]
    .filter(record => record && record.updatedAt > resetAt);
  if (!candidates.length) return null;
  return candidates.reduce((best, record) => {
    if (!best || record.slide > best.slide) return record;
    if (record.slide === best.slide && record.updatedAt >= best.updatedAt) return record;
    return best;
  }, null);
}

function mergeDay(left, right) {
  const resetAt = Math.max(positiveNumber(left?.resetAt), positiveNumber(right?.resetAt));
  return {
    resetAt,
    assignments: mergeAssignments(left?.assignments, right?.assignments, resetAt),
    assignmentSections: mergeSections(left?.assignmentSections, right?.assignmentSections, resetAt),
    podcastSections: mergeSections(left?.podcastSections, right?.podcastSections, resetAt),
    whitepaper: mergeWhitepaper(left?.whitepaper, right?.whitepaper, resetAt)
  };
}

export function mergeSyncStates(...values) {
  return values.map(normalizeSyncState).reduce((merged, value) => ({
    version: 2,
    days: {
      day1: mergeDay(merged.days.day1, value.days.day1),
      day2: mergeDay(merged.days.day2, value.days.day2)
    }
  }), blankSyncState());
}

function effectiveDay(day) {
  const normalized = normalizeDay(day);
  const activeAssignments = {};
  Object.entries(normalized.assignments).forEach(([id, record]) => {
    if (record.updatedAt > normalized.resetAt) activeAssignments[id] = record.value;
  });
  const activeSections = records => Object.fromEntries(
    Object.entries(records).filter(([, updatedAt]) => updatedAt > normalized.resetAt).map(([id]) => [id, true])
  );
  const whitepaper = normalized.whitepaper?.updatedAt > normalized.resetAt
    ? normalized.whitepaper
    : { slide: 0, opened: false, updatedAt: 0 };
  return {
    assignments: activeAssignments,
    assignmentSections: activeSections(normalized.assignmentSections),
    podcastSections: activeSections(normalized.podcastSections),
    whitepaper: { slide: whitepaper.slide, opened: whitepaper.opened }
  };
}

export function effectiveProgress(value) {
  const normalized = normalizeSyncState(value);
  return {
    day1: effectiveDay(normalized.days.day1),
    day2: effectiveDay(normalized.days.day2)
  };
}

const truthyMap = value => Object.fromEntries(
  Object.entries(value || {}).filter(([, enabled]) => Boolean(enabled)).map(([id]) => [id, true])
);

function captureDay(metaDay, localDay, timestamp) {
  let day = normalizeDay(metaDay);
  const before = effectiveDay(day);
  const local = {
    assignments: Object.fromEntries(Object.entries(localDay?.assignments || {}).map(([id, value]) => [id, Boolean(value)])),
    assignmentSections: truthyMap(localDay?.assignmentSections),
    podcastSections: truthyMap(localDay?.podcastSections),
    whitepaper: {
      slide: positiveNumber(localDay?.whitepaper?.slide),
      opened: Boolean(localDay?.whitepaper?.opened || positiveNumber(localDay?.whitepaper?.slide) > 0)
    }
  };

  const readingWasRemoved = ["assignmentSections", "podcastSections"].some(key =>
    Object.keys(before[key]).some(id => !local[key][id])
  );
  const whitepaperWasReset = local.whitepaper.slide < before.whitepaper.slide ||
    (before.whitepaper.opened && !local.whitepaper.opened);
  if (readingWasRemoved || whitepaperWasReset) {
    day.resetAt = Math.max(day.resetAt, timestamp);
  }

  const changeAt = day.resetAt === timestamp ? timestamp + 1 : timestamp;
  const active = effectiveDay(day);
  const assignmentIds = new Set([...Object.keys(active.assignments), ...Object.keys(local.assignments)]);
  assignmentIds.forEach(id => {
    const localValue = Boolean(local.assignments[id]);
    if (localValue !== Boolean(active.assignments[id])) {
      day.assignments[id] = { value: localValue, updatedAt: changeAt };
    }
  });

  for (const key of ["assignmentSections", "podcastSections"]) {
    Object.keys(local[key]).forEach(id => {
      if (!effectiveDay(day)[key][id]) day[key][id] = changeAt;
    });
  }

  const currentWhitepaper = effectiveDay(day).whitepaper;
  if (local.whitepaper.slide > currentWhitepaper.slide || local.whitepaper.opened !== currentWhitepaper.opened) {
    day.whitepaper = { ...local.whitepaper, updatedAt: changeAt };
  }
  return day;
}

export function captureLocalProgress(meta, local, timestamp = Date.now()) {
  const normalized = normalizeSyncState(meta);
  return {
    version: 2,
    days: {
      day1: captureDay(normalized.days.day1, local?.day1, positiveNumber(timestamp)),
      day2: captureDay(normalized.days.day2, local?.day2, positiveNumber(timestamp))
    }
  };
}
