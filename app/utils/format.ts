const currentYear = new Date().getFullYear();

const formatDateTime = (dateString: string) => {
  return new Date(dateString)
    .toLocaleString('nl-BE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(/\//g, '-');
};

const formatDateToWeekDay = (dateString: string) => {
  return new Date(dateString).toLocaleString('nl-BE', {
    weekday: 'long',
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString)
    .toLocaleString('nl-BE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '-');
};

const formatDateTo = (
  dateString: string,
  format: 'DMY' | 'YMD' | 'MMD' | 'MD' | 'YM' | 'MMD' | 'WMD' = 'DMY',
) => {
  const date = new Date(dateString);
  switch (format) {
    case 'DMY':
      return date.toLocaleString('nl-BE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    case 'YMD':
      return date
        .toLocaleString('nl-BE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\//g, '-');
    case 'YM':
      return (
        date.toLocaleString('nl-BE', {
          year: 'numeric',
        }) +
        ' ' +
        date.toLocaleString('nl-BE', {
          month: 'short',
        })
      );
    case 'WMD':
      return date.toLocaleString('nl-BE', {
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
      });
    case 'MMD':
      return date.toLocaleString('nl-BE', {
        month: 'short',
        day: '2-digit',
      });
    case 'MD':
      return date.toLocaleString('nl-BE', {
        month: '2-digit',
        day: '2-digit',
      });
    default:
      return date.toLocaleString('nl-BE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
  }
};

const formatAgesToBirthYears = (ages: number[]): string => {
  if (!ages.length) return '';
  if (ages.length === 1) return `${currentYear - ages[0]!}`;

  const [minAge, maxAge] = ages.sort((a, b) => a - b);
  if (maxAge! >= 99) return `${currentYear - minAge!} of ouder`;

  return `${currentYear - maxAge!} - ${currentYear - minAge!}`;
};

export {
  formatDateTime,
  formatDate,
  formatAgesToBirthYears,
  currentYear,
  formatDateToWeekDay,
  formatDateTo,
};
