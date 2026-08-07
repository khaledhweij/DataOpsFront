// utils/PdfUtils.ts
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

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

    async imagesToPdf(files: File[]): Promise<Uint8Array> {
        const pdfDoc = await PDFDocument.create();

        for (const file of files) {
            const bytes = new Uint8Array(await file.arrayBuffer());
            const type = file.type.toLowerCase();

            let embeddedImage;
            if (type === 'image/jpeg' || type === 'image/jpg') {
                embeddedImage = await pdfDoc.embedJpg(bytes);
            } else if (type === 'image/png') {
                embeddedImage = await pdfDoc.embedPng(bytes);
            } else {
                throw new Error(`Unsupported image type: ${file.type} (${file.name})`);
            }

            const { width, height } = embeddedImage;
            const page = pdfDoc.addPage([width, height]);
            page.drawImage(embeddedImage, { x: 0, y: 0, width, height });
        }

        return await pdfDoc.save();
    }

    async compressPdf(file: File): Promise<Uint8Array> {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { updateMetadata: false });

        pdf.setTitle('');
        pdf.setAuthor('');
        pdf.setSubject('');
        pdf.setKeywords([]);
        pdf.setProducer('');
        pdf.setCreator('');

        return await pdf.save({ useObjectStreams: true });
    }


    async compressPdfByRasterizing(file: File, jpegQuality = 0.6, scale = 1.5): Promise<Uint8Array> {
        const arrayBuffer = await file.arrayBuffer();
        const srcDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const outDoc = await PDFDocument.create();

        for (let i = 1; i <= srcDoc.numPages; i++) {
            const page = await srcDoc.getPage(i);
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d')!;

            await page.render({
                canvas,           // <-- required in newer pdfjs-dist typings
                canvasContext: ctx,
                viewport,
            }).promise;

            const jpegDataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
            const jpegBytes = Uint8Array.from(atob(jpegDataUrl.split(',')[1]), c => c.charCodeAt(0));

            const embedded = await outDoc.embedJpg(jpegBytes);
            const outPage = outDoc.addPage([viewport.width, viewport.height]);
            outPage.drawImage(embedded, { x: 0, y: 0, width: viewport.width, height: viewport.height });
        }

        return await outDoc.save({ useObjectStreams: true });
    }

}