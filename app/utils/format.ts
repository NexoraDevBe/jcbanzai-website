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

export { formatDateTime, formatDate };
