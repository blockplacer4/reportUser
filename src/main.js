import { Client, Databases, ID, Query } from 'node-appwrite';

export default async function (req) {
    const client = new Client();
    const databases = new Databases(client);

    client
        .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    try {
        const payload = JSON.parse(req.payload || '{}');
        const { chat_id, reporter_user_id, reason } = payload;

        if (!chat_id || !reporter_user_id || !reason_category) {
            return { error: "Missing required fields" };
        }

        // Alle Nachrichten des Chats abrufen
        const messagesList = await databases.listDocuments(
            process.env.DB_ID,
            process.env.MESSAGES_COLLECTION_ID,
            [Query.equal('chat_id', chat_id)]
        );

        const createdReports = [];

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
        }

        return { success: true, reports: createdReports };

    } catch (error) {
        console.error(error);
        return { error: error.message };
    }
}
