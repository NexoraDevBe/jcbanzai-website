const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("nl-BE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("nl-BE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const currentYear = new Date().getFullYear();

const formatAgesToBirthYears = (ages: number[]): string => {
  if (!ages.length) return "";
  if (ages.length === 1) return `${currentYear - ages[0]!}`;

  const [minAge, maxAge] = ages.sort((a, b) => a - b);
  if (maxAge! >= 99) return `${currentYear - minAge!} of ouder`;

  return `${currentYear - maxAge!} - ${currentYear - minAge!}`;
};

export { formatDateTime, formatDate, formatAgesToBirthYears };
