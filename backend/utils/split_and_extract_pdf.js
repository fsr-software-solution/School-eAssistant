import { readFile } from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import { PDFParse } from 'pdf-parse';

async function splitAndExtract(pdfBytes) {
    if (!pdfBytes) {
        throw new Error('PDF bytes cannot be null or undefined');
    }
    
    let buffer;
    if (typeof pdfBytes === 'string') {
        buffer = await readFile(pdfBytes);
    } else if (pdfBytes instanceof Uint8Array || pdfBytes instanceof ArrayBuffer || Buffer.isBuffer(pdfBytes)) {
        buffer = pdfBytes;
    } else {
        throw new Error('`pdf` must be of type `string` (file path) or `Uint8Array` or `ArrayBuffer` or `Buffer`');
    }
    
    const srcDoc = await PDFDocument.load(buffer);
    const pageCount = srcDoc.getPageCount();
    
    const results = [];

    for (let i = 0; i < pageCount; i++) {
        const subDoc = await PDFDocument.create();
        const [copiedPage] = await subDoc.copyPages(srcDoc, [i]);
        subDoc.addPage(copiedPage);
        const subDocBytes = await subDoc.save();
        
        const pdfParser = new PDFParse({ data: subDocBytes });
        const textResult = await pdfParser.getText();
        const pageText = textResult.text.trim();
        
        results.push({
            physicalPage: i + 1,
            content: pageText.length > 0 ? pageText : ""
        });
        
        // Clean up the parser instance
        await pdfParser.destroy();
    }

    return results;
}

export default splitAndExtract