// Priority order for determining group status
const STATUS_PRIORITY = {
  PENDING: 5,
  APPROVED: 4,
  REJECTED: 3,
  AUTO_CANCELLED: 2,
  CANCELLED: 1,
};

// Given an array of bookings, group recurring ones by recurrenceGroupId
// Single bookings are returned as-is wrapped in a group object
export const groupBookings = (bookings) => {
  const groups = new Map();
  const singles = [];

  bookings.forEach((booking) => {
    if (booking.recurring && booking.recurrenceGroupId) {
      if (!groups.has(booking.recurrenceGroupId)) {
        groups.set(booking.recurrenceGroupId, []);
      }
      groups.get(booking.recurrenceGroupId).push(booking);
    } else {
      singles.push({
        type: 'single',
        booking,
        id: booking.id,
        createdAt: booking.createdAt,
      });
    }
  });

  const recurringGroups = [];
  groups.forEach((groupBookings, groupId) => {
    // Sort sessions by startTime ascending
    const sorted = [...groupBookings].sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime),
    );

    // Determine group status by highest priority status in the group
    const dominantStatus = sorted.reduce((best, b) => {
      return (STATUS_PRIORITY[b.status] || 0) > (STATUS_PRIORITY[best] || 0)
        ? b.status
        : best;
    }, sorted[0].status);

    recurringGroups.push({
      type: 'recurring',
      id: groupId,
      groupId,
      sessions: sorted,
      firstSession: sorted[0],
      lastSession: sorted[sorted.length - 1],
      sessionCount: sorted.length,
      dominantStatus,
      resourceName: sorted[0].resourceName,
      resourceLocation: sorted[0].resourceLocation,
      userName: sorted[0].userName,
      purpose: sorted[0].purpose,
      attendees: sorted[0].attendees,
      createdAt: sorted[0].createdAt,
    });
  });

  // Combine singles and recurring groups, sort by createdAt descending
  return [...singles, ...recurringGroups].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
};

// Get display color class for a status
export const getStatusBadgeClass = (status) => {
  const map = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-slate-100 text-slate-500',
    AUTO_CANCELLED: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-slate-100 text-slate-500';
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });
};

export const formatTimeRange = (startStr, endStr) => {
  const start = new Date(startStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const end = new Date(endStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${start} – ${end}`;
};
