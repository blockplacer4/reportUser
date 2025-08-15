import { Client, Databases, ID, Query } from 'node-appwrite';

export default async function ({req, res, log, error}) {
    const client = new Client();
    
    log("test");
    client
        .setEndpoint(process.env.ENDPOINT.trim())
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID);
    const databases = new Databases(client);
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        ;
        log("GOT TO P1");
        const { chat_id, reporter_user_id, reason } = body;
        log("GOT TO P2");

        // Alle Nachrichten des Chats abrufen
        const messagesList = await databases.listDocuments(
            process.env.DB_ID,
            process.env.MESSAGES_COLLECTION_ID,
            [Query.equal('chatId', chat_id)],
            100
        );

        const createdReports = [];
        log(messagesList.length);
        // Für jede Nachricht ein eigenes Report-Dokument erstellen
        for (const msg of messagesList.documents) {
            const report = await databases.createDocument(
                process.env.DB_ID,
                process.env.REPORTS_COLLECTION_ID,
                ID.unique(),
                {
                    chatid: chat_id,
                    reason: reason_detail || "",
                    content: msg.content,
                    sender_id: msg.senderid,
                    reportetid: reporter_user_id,
                }
                
            );
            createdReports.push(report);
            log("Document created");
        }

        return { success: true, reports: createdReports };

    } catch (error) {
        console.error(error);
        return { error: error.message };
    }
}
