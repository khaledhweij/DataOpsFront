// utils/PdfUtils.ts
import { PDFDocument } from 'pdf-lib';

export class PdfUtils {
    async mergePdfs(files: File[]): Promise<Uint8Array> {
        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        return await mergedPdf.save();
    }

    async removePages(file: File, fromPage: number, toPage: number): Promise<{restPdf: Uint8Array }> {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();

        // Validate range
        const start = Math.max(0, fromPage - 1); // Convert to 0-based index
        const end = Math.min(pageCount, toPage);

        // Create PDF with the rest (everything except the range)
        const restPdf = await PDFDocument.create();
        const restIndices = [
            ...Array.from({ length: start }, (_, i) => i), // Pages before range
            ...Array.from({ length: pageCount - end }, (_, i) => end + i) // Pages after range
        ];

        if (restIndices.length > 0) {
            const restPages = await restPdf.copyPages(pdf, restIndices);
            restPages.forEach((page) => restPdf.addPage(page));
        }

        return {
            restPdf: await restPdf.save()
        };
    }

    async extractPages(file: File, fromPage: number, toPage: number): Promise<Uint8Array> {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const newPdf = await PDFDocument.create();

        const pageCount = pdf.getPageCount();
        const start = Math.max(0, fromPage - 1);
        const end = Math.min(pageCount, toPage);

        const pageIndices = Array.from({ length: end - start }, (_, i) => start + i);
        const copiedPages = await newPdf.copyPages(pdf, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        return await newPdf.save();
    }

    downloadPdf(pdfBytes: Uint8Array, filename: string) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    downloadMultiplePdfs(pdfs: Uint8Array[], baseFilename: string) {
        pdfs.forEach((pdf, index) => {
            this.downloadPdf(pdf, `${baseFilename}_page_${index + 1}.pdf`);
        });
    }
}