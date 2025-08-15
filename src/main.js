import { Client, Databases, ID, Query } from 'node-appwrite';

export default async function (req, res) {
    const client = new Client();
    const databases = new Databases(client);

    client
        .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    try {
        const payload = JSON.parse(req.payload || '{}');
        const { chat_id, reporter_user_id, reason_category, reason_detail } = payload;

        if (!chat_id || !reporter_user_id || !reason_category) {
            return res.json({ error: "Missing required fields" }, 400);
        }

        const messagesList = await databases.listDocuments(
            process.env.DB_ID,
            process.env.MESSAGES_COLLECTION_ID,
            [Query.equal('chat_id', chat_id)]
        );

        const chatContent = messagesList.documents.map(msg => ({
            sender_id: msg.senderid,
            message: msg.content,
            chatid: msg.chatId
        }));

        const report = await databases.createDocument(
            process.env.DB_ID,
            process.env.REPORTS_COLLECTION_ID,
            ID.unique(),
            {
                chatid: chat_id,
                reasonl: reason_detail || "",
                content: JSON.stringify(chatContent),
                reportetid: reporter_user_id,
                status: "pending"
            }
        );

        return res.json({ success: true, report });

    } catch (error) {
        console.error(error);
        return res.json({ error: error.message }, 500);
    }
}
