export function downloadCSV(data: any[], filename = "data.csv") {
    if (!Array.isArray(data) || data.length === 0) {
        console.error("Invalid or empty data");
        return;
    }

    const headers = Object.keys(data[0]);

    const csvRows = [
        headers.join(","),
        ...data.map(row =>
            headers.map(field => {
                let value = row[field] ?? "";
                value = String(value).replace(/"/g, '""');

                if (value.search(/("|,|\n)/g) >= 0) {
                    value = `"${value}"`;
                }

                return value;
            }).join(",")
        )
    ];

    // 👇 Add BOM here
    const csvContent = "\uFEFF" + csvRows.join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}