import { getAllNotes } from './noteManager.js';

/**
 * Exports all notes as a JSON file
 * @returns {Promise<success: boolean, filename?: string, noteCount?: number, error?: string>}
 */

export async function exportNotes(){
    try{
        const notes = getAllNotes();

        if(!notes || notes.length === 0){
            return {
                success: false,
                error: 'No notes found'
            };
        }

        // create export data structure
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            notes: notes
        };

        // Convert to JSON string with pretty formatting
        const jsonString = JSON.stringify(exportData, null, 2);

        // create blob and download link
        const blob = new Blob([jsonString], {type: 'application/json'});
        const url = URL.createObjectURL(blob);

        // create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename  = `notes-export-${timestamp}.json`;

        // create temporary download link
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        // trigger download
        document.body.appendChild(link);
        link.click();

        // cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);

        return {
            success: true,
            filename: filename,
            noteCount: notes.length
        };
    }catch(error){
        console.error('Error exporting notes:', error);
        return {
            success: false,
            error: 'Failed to export notes. Please try again.'
        };
    }
}


/**
 * Sets up export button handler
 * @param {HTMLElement | string} button - Button element or selector
 * @param {Function} onSucces - Optiional success callback
 * @param {Function} onError - Optional error callback
 * @returns {Function} Cleanup function
*/

export function setupExportButton(button, onSuccess, onError){
    const buttonElement = typeof button === 'string' ? document.querySelector(button) : button;

    if(!buttonElement){
        console.error('Export button not found:', button);
        return () => {};
    }

    const handleExport = async () => {
        const result = await exportNotes();

        if(result.success){
            if(onSuccess){
                onSuccess(result);
            }
        } else {
            if(onError){
                onError(result);
            }
        }
    };

    buttonElement.addEventListener('click', handleExport);

    // return cleanup function
    return () => {
        buttonElement.removeEventListener('click', handleExport);
    };
}