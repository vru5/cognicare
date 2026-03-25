import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Share } from '@capacitor/share';

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
        windowWidth: 800, // Standardize width for capture
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
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el.hasAttribute('style')) {
              const style = el.getAttribute('style') || '';
              if (/oklch|lab\(|lch\(|hwb\(|color-mix/.test(style)) {
                // Remove the offending property or just clear the style if it's too much.
                // For safety in this context, we'll try to just remove the modern color usage
                // but usually resetting it to a safe fallback or clearing it is safer.
                el.removeAttribute('style'); 
              }
            }
          }

          // 4. Inject report-specific styles (Safe HEX/RGB only)
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            .report-page-container { display: flex; flex-direction: column; align-items: center; background-color: #f3f4f6; padding: 40px 0; }
            .report-page { width: 794px; min-height: 1123px; background-color: #ffffff; font-family: 'Inter', system-ui, -apple-system, sans-serif; position: relative; overflow: hidden; box-sizing: border-box; }
            .report-header { background: #1a1a2e; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%); padding: 26px 40px 22px; display: flex; justify-content: space-between; align-items: flex-start; color: #ffffff; }
            .header-badge { width: 34px; height: 34px; border-radius: 9px; background: linear-gradient(135deg, #5fa8d3, #3d6b8f); display: flex; align-items: center; justify-content: center; font-size: 17px; }
            .header-subtitle { color: rgba(255,255,255,0.45); font-size: 9px; letter-spacing: 3px; text-transform: uppercase; }
            .header-title { color: #ffffff; font-size: 12px; font-weight: 700; }
            .patient-name { color: #ffffff; font-size: 20px; font-weight: 800; line-height: 1.2; margin-top: 5px; }
            .patient-meta { color: rgba(255,255,255,0.5); font-size: 11px; margin-top: 3px; }
            .report-scope-box { background: rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 16px; border: 1px solid rgba(255,255,255,0.12); text-align: right; }
            .scope-label { color: #5fa8d3; font-size: 12px; font-weight: 800; }
            .scope-count { color: rgba(255,255,255,0.4); font-size: 9px; margin-top: 3px; }
            .report-body { padding: 30px 40px; }
            .stats-grid { display: flex; background: #f8f6f1; border-radius: 12px; border: 1.5px solid #e8e4dc; overflow: hidden; margin-bottom: 30px; }
            .stat-item { flex: 1; text-align: center; padding: 12px 8px; border-right: 1px solid #e8e4dc; }
            .stat-item:last-child { border-right: none; }
            .stat-label { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
            .stat-value { font-size: 17px; font-weight: 900; }
            .section-title { font-size: 14px; font-weight: 800; color: #1a1a2e; margin-bottom: 15px; }
            .trend-table { background: #ffffff; border: 1.5px solid #e8e4dc; border-radius: 12px; overflow: hidden; }
            .trend-header { display: flex; background: #f8f6f1; padding: 8px 16px; border-bottom: 1px solid #e8e4dc; font-size: 10px; color: #999; font-weight: 700; text-transform: uppercase; }
            .trend-row { display: flex; align-items: center; padding: 10px 16px; border-bottom: 1px solid #f0ece6; }
            .insight-card { background: #f8f6f1; border-radius: 10px; padding: 12px; border-left-width: 4px; border-left-style: solid; }
            .insight-title { font-size: 11px; font-weight: 800; color: #1a1a2e; }
            .insight-body { margin: 0; font-size: 10px; color: #555; line-height: 1.5; }
            .report-footer { position: absolute; bottom: 0; left: 0; right: 0; border-top: 1px solid #eeeeee; padding: 10px 40px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #bbbbbb; }
            .radar-section { display: flex; gap: 20px; margin-bottom: 30px; }
            .comp-insight-card { background: #f8f6f1; padding: 10px; border-radius: 8px; border-left-width: 2px; border-left-style: solid; }
            .comp-pillar-card { margin-bottom: 10px; background: #fdfcfa; border: 1px solid #e8e4dc; border-radius: 8px; padding: 8px 12px; }
            .pro-header { background: #1a1a2e; padding: 22px 40px; color: #ffffff; }
            .pro-disclaimer { background: #fffbf0; border: 1px solid #f0d080; border-radius: 10px; padding: 12px; font-size: 10.5px; color: #a07830; margin-bottom: 25px; display: flex; gap: 10px; }
            .points-card { background: #1a1a2e; border-radius: 15px; padding: 20px; color: #ffffff; }
          `;
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
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (Capacitor.isNativePlatform()) {
      onProgress?.("Preparing for mobile viewing...");
      try {
        const pdfBase64 = pdf.output('datauristring').split(',')[1];
        const fileName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
        
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: pdfBase64,
          directory: Directory.Documents,
          recursive: true
        });
        
        onProgress?.("Opening PDF...");
        await new Promise(r => setTimeout(r, 200));
        
        await FileOpener.open({
          filePath: savedFile.uri,
          contentType: 'application/pdf'
        });
      } catch (err) {
        console.error("Native Open Error:", err);
        const pdfBase64 = pdf.output('datauristring').split(',')[1];
        const fileName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: pdfBase64,
          directory: Directory.Documents,
          recursive: true
        });
        
        await Share.share({
          title: 'Symptom Report',
          text: 'Sharing your clinical symptom report.',
          url: savedFile.uri,
          dialogTitle: 'Share Report'
        });
      }
    } else if (isMobile && navigator.share) {
      // For mobile browsers, use the Web Share API if available
      onProgress?.("Opening share options...");
      try {
        const blob = pdf.output('blob');
        const file = new File([blob], filename, { type: 'application/pdf' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Symptom Report',
            text: 'Your clinical symptom report is ready.'
          });
        } else {
          // Fallback to opening in a new tab if sharing files isn't supported
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        }
      } catch (err) {
        console.error("Web Share Error:", err);
        pdf.save(filename);
      }
    } else {
      // Desktop or fallback
      pdf.save(filename);
      // Also open in new tab for immediate viewing if requested
      const blobUrl = URL.createObjectURL(pdf.output('blob'));
      window.open(blobUrl, '_blank');
    }
    return true;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
}
