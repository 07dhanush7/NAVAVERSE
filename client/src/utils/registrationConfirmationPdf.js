import { jsPDF } from "jspdf";
import { sanitizePdfFileName } from "./eventRegistrationSuccess";

export const generateRegistrationConfirmationPdf = async ({ eventName, templateElement }) => {
  if (!templateElement) {
    throw new Error("Confirmation template is not ready");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  await pdf.html(templateElement, {
    autoPaging: "text",
    margin: [24, 24, 24, 24],
    width: 547,
    windowWidth: 760,
    html2canvas: {
      scale: 0.62,
      useCORS: true,
      backgroundColor: "transparent",
    },
  });

  pdf.save(sanitizePdfFileName(eventName));
};


