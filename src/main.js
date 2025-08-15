import { Client, Databases, ID, Query } from 'node-appwrite';

export default async function (context) {
    context.log("Function started");
    
    try {
        // Funktionierende Client-Konfiguration verwenden
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_FUNCTION_API_KEY);
        
        context.log("Client initialized");
        
        const databases = new Databases(client);
        
        const body = typeof context.req.body === 'string' ? JSON.parse(context.req.body) : context.req.body;
        context.log("GOT TO P1");
        
        const { chat_id, reporter_user_id, reason } = body;
        context.log("GOT TO P2");
        context.log(`Chat ID: ${chat_id}, Reporter: ${reporter_user_id}, Reason: ${reason}`);

        // Alle Nachrichten des Chats abrufen
        context.log("Fetching messages...");
        const messagesList = await databases.listDocuments(
            process.env.DB_ID,
            process.env.MESSAGES_COLLECTION_ID,
            [Query.equal('chatId', chat_id)]
        );

        const createdReports = [];
        context.log(`Found ${messagesList.documents.length} messages`);
        
        // Für jede Nachricht ein eigenes Report-Dokument erstellen
        for (const msg of messagesList.documents) {
            const report = await databases.createDocument(
                process.env.DB_ID,
                process.env.REPORTS_COLLECTION_ID,
                ID.unique(),
                {
                    chatid: chat_id,
                    reason: reason || "",
                    content: msg.content,
                    sender_id: msg.senderid,
                    reportetid: reporter_user_id,
                }
            );
            createdReports.push(report);
            context.log("Document created");
        }

        return context.res.json({ success: true, reports: createdReports });

    } catch (error) {
        context.error(`Function error: ${error.message}`);
        context.error(`Stack trace: ${error.stack}`);
        return context.res.json({ error: error.message });
    }
}
