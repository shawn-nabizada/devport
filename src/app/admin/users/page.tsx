'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { toast } from 'sonner';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface User {
    _id: string;
    name?: string;
    email: string;
    image?: string;
    role: string;
    username: string;
    emailVerified?: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string; username: string } | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteDialog = (userId: string, username: string) => {
        setUserToDelete({ id: userId, username });
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            const res = await fetch(`/api/admin/users?userId=${userToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success(t('admin.userDeleted'));
                setUsers(users.filter(u => u._id !== userToDelete.id));
            } else {
                toast.error(t('admin.deleteFailed'));
            }
        } catch {
            toast.error(t('admin.deleteFailed'));
        } finally {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('admin.usersTitle')}</h1>
                    <p className="text-muted-foreground">{t('admin.usersDescription').replace('{count}', users.length.toString())}</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('admin.searchUsers')}
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">{t('admin.table.user')}</th>
                                    <th className="px-4 py-3 font-medium">{t('admin.table.role')}</th>
                                    <th className="px-4 py-3 font-medium">{t('admin.table.status')}</th>
                                    <th className="px-4 py-3 font-medium">{t('admin.table.joined')}</th>
                                    <th className="px-4 py-3 font-medium text-right">{t('admin.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                                    {user.image ? <Image src={user.image} alt={user.name || 'User avatar'} width={32} height={32} className="w-full h-full rounded-full object-cover" /> : user.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.name || 'No Name'}</div>
                                                    <div className="text-xs text-muted-foreground">@{user.username}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {user.role === 'admin' ? t('admin.role.admin') : t('admin.role.user')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {user.emailVerified ? t('admin.status.verified') : t('admin.status.pending')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" asChild title={t('admin.viewProfile')}>
                                                    <Link href={`/${user.username}`} target="_blank">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {user.role !== 'admin' && (
                                                    <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(user._id, user.username)} className="text-red-500 hover:text-red-700 hover:bg-red-50" title={t('admin.deleteUser')}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title={t('admin.deleteUserTitle') || 'Delete User'}
                description={userToDelete ? t('admin.deleteConfirm').replace('{username}', userToDelete.username) : ''}
                confirmLabel={t('common.delete') || 'Delete'}
                cancelLabel={t('common.cancel') || 'Cancel'}
                variant="destructive"
                onConfirm={handleDelete}
            />
        </div>
    );
}
