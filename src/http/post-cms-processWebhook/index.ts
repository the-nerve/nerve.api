import { PostRequest, Response } from '../../shared/global/types';

import { isValidProject } from './src/validators';
import { hasDocumentsToProcess, runDocumentProcessors } from './src/processors';
import { getDocumentTypeMap } from './src/sanity';

import { SanityCMSWebhook } from './src/types';

export async function handler(req: PostRequest): Response {
    const { body } = req;

    const data: SanityCMSWebhook = JSON.parse(body);
    const { transactionId, projectId, ids } = data;

    // 1. validate event based on project ID
    if (!isValidProject(projectId)) {
        // response is no bueno -- project ID check did not pass
        // Set proper response code and message
        return {
            statusCode: 200,
            body: JSON.stringify({
                transactionId,
                message: 'Invalid project ID. Shutting down.',
                projectId,
            }),
        };
    }

    // Check to see if there are documents that need to be processed
    if (!hasDocumentsToProcess(ids)) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                transactionId,
                message: 'No documents to process. Shutting down',
            }),
        };
    }

    // ToDo: Clean up events that don't have any documents to process
    // const cleanedDocumentEvents =

    // Get document types for each document to process
    const documentTypeMap = await getDocumentTypeMap(ids);
    console.log('FINAL DOCUMENT TYPE MAP:', documentTypeMap);

    // Document type map is what is passed in to runDocumentProcessors()
    // Update runDocumentProcessors() to use a switch/case check on each document: 'type'
    // Then assign processors for a specific document type within the case for the document type we are targeting.

    // 3. For each array of events, check to see if we have a processor in place
    // -- each event type probably needs an array of "processors" that should be fired on each event
    runDocumentProcessors(ids);

    return {
        statusCode: 200,
        body: JSON.stringify({
            transactionId,
            message: 'All documents processed successfully.',
            documentsProcessed: ids.all,
        }),
    };
}