'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, MailOpen, Trash2, Clock } from 'lucide-react';

interface Message {
    _id: string;
    senderName: string;
    senderEmail: string;
    subject: string | null;
    message: string;
    read: boolean;
    createdAt: string;
}

export default function MessagesPage() {
    const { t, language } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    useEffect(() => { fetchMessages(); }, []);

    async function fetchMessages() {
        try {
            const res = await fetch('/api/messages');
            if (res.ok) setMessages(await res.json());
        } finally { setIsLoading(false); }
    }

    async function openMessage(msg: Message) {
        setSelectedMessage(msg);
        if (!msg.read) {
            await fetch(`/api/messages/${msg._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read: true }),
            });
            setMessages(messages.map(m => m._id === msg._id ? { ...m, read: true } : m));
        }
    }

    async function handleDelete(id: string) {
        if (!confirm(t('messages.deleteConfirm'))) return;
        await fetch(`/api/messages/${id}`, { method: 'DELETE' });
        setMessages(messages.filter(m => m._id !== id));
        if (selectedMessage?._id === id) setSelectedMessage(null);
    }

    const formatDate = (date: string) => new Date(date).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const unreadCount = messages.filter(m => !m.read).length;

    if (isLoading) return <div className="text-muted-foreground">{t('common.loading')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('nav.messages')}</h1>
                    <p className="text-muted-foreground">
                        {unreadCount > 0 ? `${unreadCount} ${t('messages.unreadCount')}` : t('messages.yourInbox')}
                    </p>
                </div>
            </div>

            {messages.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{t('messages.noMessages')}</p>
                        <p className="text-sm text-muted-foreground">{t('messages.noMessagesDescription')}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {messages.map((msg) => (
                        <Card
                            key={msg._id}
                            className={`cursor-pointer transition-colors hover:bg-accent/50 ${!msg.read ? 'border-primary/50 bg-primary/5' : ''}`}
                            onClick={() => openMessage(msg)}
                        >
                            <CardContent className="flex items-center gap-4 py-4">
                                <div className={`rounded-full p-2 ${msg.read ? 'bg-muted' : 'bg-primary/10'}`}>
                                    {msg.read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4 text-primary" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-medium ${!msg.read ? 'text-foreground' : 'text-muted-foreground'}`}>{msg.senderName}</span>
                                        <span className="text-sm text-muted-foreground">&lt;{msg.senderEmail}&gt;</span>
                                    </div>
                                    <p className={`truncate ${!msg.read ? 'font-medium' : ''}`}>{msg.subject || t('common.noSubject')}</p>
                                    <p className="text-sm text-muted-foreground truncate">{msg.message}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(msg.createdAt)}
                                </div>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(msg._id); }}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Message Detail Dialog */}
            <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
                <DialogContent className="max-w-2xl">
                    {selectedMessage && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedMessage.subject || t('common.noSubject')}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <div>
                                        <span className="font-medium text-foreground">{selectedMessage.senderName}</span>
                                        <span className="ml-2">&lt;{selectedMessage.senderEmail}&gt;</span>
                                    </div>
                                    <span>{formatDate(selectedMessage.createdAt)}</span>
                                </div>
                                <div className="border-t pt-4 whitespace-pre-wrap">{selectedMessage.message}</div>
                                <div className="flex gap-2">
                                    <Button variant="outline" asChild>
                                        <a href={`mailto:${selectedMessage.senderEmail}`}>{t('contact.replyViaEmail')}</a>
                                    </Button>
                                    <Button variant="destructive" onClick={() => { handleDelete(selectedMessage._id); setSelectedMessage(null); }}>
                                        {t('common.delete')}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
