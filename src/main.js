import { Client, Databases, ID, Query } from 'node-appwrite';

export default async function (context) {
    try {
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_FUNCTION_API_KEY);
        
        const databases = new Databases(client);
        
        const body = typeof context.req.body === 'string' ? JSON.parse(context.req.body) : context.req.body;
        const { chat_id, reporter_user_id, reason } = body;

        const messagesList = await databases.listDocuments(
            process.env.DB_ID,
            process.env.MESSAGES_COLLECTION_ID,
            [Query.equal('chatId', chat_id)]
        );

        const createdReports = [];
        
        for (const msg of messagesList.documents) {
            const report = await databases.createDocument(
                process.env.DB_ID,
                process.env.REPORTS_COLLECTION_ID,
                ID.unique(),
                {
                    chatid: chat_id,
                    reason: reason || "",
                    content: msg.content || "",
                    sender_id: msg.senderId,
                    reportetid: reporter_user_id,
                    uniqueSenderID: msg.uniqueSenderID,
                }
            );
            createdReports.push(report);
        }

        return context.res.json({ success: true, reports: createdReports });

    } catch (error) {
        return context.res.json({ error: error.message });
    }
}
