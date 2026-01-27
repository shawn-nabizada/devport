'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface ContactSectionProps {
    username: string; // The owner's username to send the message to
}

export function ContactSection({ username }: ContactSectionProps) {
    const { t } = useTranslation();
    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleContact(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    senderName: contactForm.name,
                    senderEmail: contactForm.email,
                    subject: contactForm.subject,
                    message: contactForm.message
                }),
            });

            if (res.ok) {
                setSent(true);
                setContactForm({ name: '', email: '', subject: '', message: '' });
                toast.success(t('contact.success'));
            } else {
                toast.error(t('common.error'));
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error(t('common.error'));
        } finally {
            setSending(false);
        }
    }

    return (
        <section id="contact" className="py-16 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-3xl font-bold mb-12 text-center flex items-center justify-center gap-3">
                    <Mail className="h-8 w-8 text-primary" />
                    {t('nav.contact')}
                </h2>

                {sent ? (
                    <Card className="border-green-500/20 bg-green-500/5">
                        <CardContent className="py-16 text-center">
                            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                <Send className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{t('contact.sentTitle') || 'Message Sent!'}</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                {t('contact.success')}
                            </p>
                            <Button
                                variant="outline"
                                className="mt-8"
                                onClick={() => setSent(false)}
                            >
                                Send another message
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="shadow-lg border-muted">
                        <CardContent className="pt-8 md:p-8">
                            <form onSubmit={handleContact} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t('contact.name')}</Label>
                                        <Input
                                            id="name"
                                            value={contactForm.name}
                                            onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                            required
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">{t('contact.email')}</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={contactForm.email}
                                            onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                            required
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">{t('contact.subject')}</Label>
                                    <Input
                                        id="subject"
                                        value={contactForm.subject}
                                        onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                                        placeholder="Project inquiry..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">{t('contact.message')}</Label>
                                    <textarea
                                        id="message"
                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        rows={5}
                                        value={contactForm.message}
                                        onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                                        required
                                        placeholder="Hello, I'd like to talk about..."
                                    />
                                </div>
                                <Button type="submit" disabled={sending} className="w-full md:w-auto min-w-[150px]">
                                    <Send className="mr-2 h-4 w-4" />
                                    {sending ? t('common.sending') : t('contact.send')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </section>
    );
}
