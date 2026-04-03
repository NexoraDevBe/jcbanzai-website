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

export async function convertToWebP(file: any, quality = 0.8) {
    return new Promise((resolve, reject) => {
        if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
            return reject(new Error("Unsupported file type"));
        }

        const img = new Image();
        const reader = new FileReader();

        reader.onload = function (e) {
            img.src = <string>e.target?.result;
        };

        reader.onerror = reject;

        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        return reject(new Error("Conversion failed"));
                    }
                    // Construct a proper File from the blob
                    const webpFile = new File(
                        [blob],
                        file.name.replace(/\.(png|jpe?g)$/i, ".webp"),
                        { type: "image/webp" }
                    );
                    resolve(webpFile);
                },
                "image/webp",
                quality
            );
        };

        img.onerror = reject;

        reader.readAsDataURL(file);
    });
}