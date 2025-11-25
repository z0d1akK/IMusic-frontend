import axiosInstance from "../api/axiosInstance";

export const downloadReport = async (url, filename) => {
    try {
        const response = await axiosInstance.get(url, {
            responseType: "blob"
        });

        const blob = new Blob([response.data], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    } catch (err) {
        console.error("Ошибка загрузки отчета:", err);
    }
};
