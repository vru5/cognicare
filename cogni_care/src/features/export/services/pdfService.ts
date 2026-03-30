import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Share } from '@capacitor/share';
import { PDF_REPORT_STYLES } from "../constants/pdfStyles";

export async function generatePdfFromElement(
  element: HTMLDivElement, 
  filename: string,
  onProgress?: (msg: string) => void
) {
  try {
    onProgress?.("Capturing report pages...");
    const pages = element.querySelectorAll(".report-page");
    if (!pages.length) throw new Error("No report pages found");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();

    for (let i = 0; i < pages.length; i++) {
      onProgress?.(`Processing page ${i + 1} of ${pages.length}...`);
      
      const canvas = await html2canvas(pages[i] as HTMLElement, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 950,
        windowWidth: 950,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          // 1. Remove all linked stylesheets (they might contain lab/oklch and innerHTML is empty)
          clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach(l => l.remove());

          // 2. Remove internal styles that contain any unsupported color functions
          clonedDoc.querySelectorAll('style').forEach(s => {
            const content = s.innerHTML || '';
            const isModern = /oklch|lab\(|lch\(|hwb\(|color-mix/.test(content);
            if (isModern) s.remove();
          });

          // 3. Recursive inline style cleanup (just in case)
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let k = 0; k < allElements.length; k++) {
            const el = allElements[k] as HTMLElement;
            if (el.hasAttribute('style')) {
              const styleAttr = el.getAttribute('style') || '';
              if (/oklch|lab\(|lch\(|hwb\(|color-mix/.test(styleAttr)) {
                el.removeAttribute('style'); 
              }
            }
          }

          // 4. Inject report-specific styles (Safe HEX/RGB only)
          const style = clonedDoc.createElement('style');
          style.innerHTML = PDF_REPORT_STYLES;
          clonedDoc.head.appendChild(style);
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      
      if (i > 0) pdf.addPage();
      
      // Calculate height to maintain aspect ratio
      const imgProps = pdf.getImageProperties(imgData);
      const displayHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, displayHeight, undefined, 'FAST');
    }

    onProgress?.("Downloading PDF...");
    
    // Check if we are on a mobile device (even if in a browser)
    // Improved device detection: only match true mobile devices (excluding desktop OSs)
    const isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) && !(/Windows|Macintosh|Linux/i.test(navigator.userAgent));

    if (Capacitor.isNativePlatform()) {
      onProgress?.("Preparing for mobile viewing...");
      // ... (Capacitor logic remains correct as is)
      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      const fileName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: pdfBase64,
        directory: Directory.Documents,
        recursive: true
      });
      try {
        await FileOpener.open({ filePath: savedFile.uri, contentType: 'application/pdf' });
      } catch {
        await Share.share({ title: 'Symptom Report', text: 'Clinical report', url: savedFile.uri });
      }
    } else {
      // BROWSER (Desktop & Mobile)
      onProgress?.("Downloading Report...");
      
      // 1. Force a direct download (Save)
      pdf.save(filename);

      // 2. ONLY for actual mobile browsers, ALSO attempt to trigger share if they might prefer it
      if (isMobile && navigator.share) {
        try {
          const blob = pdf.output('blob');
          const file = new File([blob], filename, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
             await navigator.share({ files: [file], title: 'Symptom Report' });
          }
        } catch (e) {
          console.warn("Share failed, but file should be downloaded.", e);
        }
      } else {
        // 3. For Desktop, also open in new tab for immediate viewing if not blocked
        try {
          const blobUrl = URL.createObjectURL(pdf.output('blob'));
          window.open(blobUrl, '_blank');
        } catch (e) {
          console.warn("Viewer blocked, but file should be downloaded.");
        }
      }
    }
    return true;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
}
