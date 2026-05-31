export default async function handler(req, res) {
    // Enable CORS for testing
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { type, name, phone, date, packageVal, message, style, budget, preference, answers } = body;

        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8592519452:AAEWum8JW3ZgB1MU_IKaCokhpZxokTO3KmI';

        // 1. Discover Chat IDs from Telegram Bot Updates
        const updatesUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;
        const updatesRes = await fetch(updatesUrl);
        const updatesData = await updatesRes.json();

        let chatIds = [];
        if (updatesData.ok && updatesData.result && updatesData.result.length > 0) {
            const ids = updatesData.result
                .filter(u => u.message && u.message.chat)
                .map(u => u.message.chat.id);
            chatIds = [...new Set(ids)];
        }

        if (process.env.TELEGRAM_CHAT_ID) {
            chatIds.push(parseInt(process.env.TELEGRAM_CHAT_ID));
            chatIds = [...new Set(chatIds)];
        }

        const DEFAULT_CHAT_ID = 1830703861; // Updated with user's chat_id
        if (DEFAULT_CHAT_ID) {
            chatIds.push(DEFAULT_CHAT_ID);
            chatIds = [...new Set(chatIds)];
        }

        if (chatIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No active chat sessions found. Please search for @verwelldecor_bot in Telegram and click Start.'
            });
        }

        // Clean phone number to construct Telegram/WhatsApp direct links
        const digitsOnly = phone.replace(/\D/g, '');
        let formattedPhone = digitsOnly;
        if (formattedPhone.startsWith('8') && formattedPhone.length === 11) {
            formattedPhone = '7' + formattedPhone.substring(1);
        } else if (formattedPhone.length === 10) {
            formattedPhone = '7' + formattedPhone;
        }
        
        const telegramLink = `https://t.me/+${formattedPhone}`;
        const telegramDeepLink = `tg://resolve?phone=${formattedPhone}`;
        const whatsappLink = `https://wa.me/${formattedPhone}`;
        const maxLink = `https://max.ru/u/+${formattedPhone}`;

        // 2. Format Message
        let text = '';
        const prefText = preference === 'telegram' ? 'Telegram' : preference === 'max' ? 'MAX' : 'WhatsApp';
        
        if (type === 'quiz') {
            text = `🎯 *Новый результат квиза!*\n\n` +
                   `👤 *Имя:* ${name}\n` +
                   `📞 *Телефон:* ${phone}\n` +
                   `📅 *Дата:* ${date || 'Не указана'}\n` +
                   `🎨 *Стиль:* ${style}\n` +
                   `💰 *Бюджет:* ${budget}\n` +
                   `✉️ *Способ связи:* ${prefText}\n`;

            if (answers) {
                text += `\n📝 *Ответы на вопросы квиза:*\n` +
                       `• *Локация:* ${answers.location || 'Не выбрана'}\n` +
                       `• *Гамма:* ${answers.color || 'Не выбрана'}\n` +
                       `• *Количество гостей:* ${answers.guests || 'Не указано'}\n` +
                       `• *Атмосфера:* ${answers.vibe || 'Не выбрана'}\n\n`;
            }

            if (preference === 'telegram') {
                text += `🔗 *Telegram:* [Открыть чат](${telegramLink}) | [В приложении](${telegramDeepLink})\n`;
            } else if (preference === 'whatsapp') {
                text += `🔗 *WhatsApp:* [Открыть чат](${whatsappLink})\n`;
            } else if (preference === 'max') {
                text += `🔗 *MAX:* [Открыть чат](${maxLink})\n`;
            }
        } else {
            text = `🔔 *Новая заявка на расчет сметы!*\n\n` +
                   `👤 *Имя:* ${name}\n` +
                   `📞 *Телефон:* ${phone}\n` +
                   `📅 *Дата свадьбы:* ${date || 'Не указана'}\n` +
                   `📦 *Пакет:* ${packageVal || 'Пока не определились'}\n` +
                   `✉️ *Способ связи:* ${prefText}\n`;
            if (preference === 'telegram') {
                text += `🔗 *Telegram:* [Открыть чат](${telegramLink}) | [В приложении](${telegramDeepLink})\n`;
            } else if (preference === 'whatsapp') {
                text += `🔗 *WhatsApp:* [Открыть чат](${whatsappLink})\n`;
            } else if (preference === 'max') {
                text += `🔗 *MAX:* [Открыть чат](${maxLink})\n`;
            }
            if (message) {
                text += `💬 *Пожелания:* ${message}\n`;
            }
        }

        // 3. Send Message to all discovered Chat IDs
        let sentCount = 0;
        for (const chatId of chatIds) {
            const sendUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
            const sendRes = await fetch(sendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                })
            });
            const sendData = await sendRes.json();
            if (sendData.ok) sentCount++;
        }

        return res.status(200).json({ success: true, sentCount });
    } catch (err) {
        console.error('Error sending Telegram notification:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}
