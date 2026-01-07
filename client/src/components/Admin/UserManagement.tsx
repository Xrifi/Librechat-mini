import React, { useState } from 'react';
import { Search, UserPlus, Coins, MoreVertical, Edit2 } from 'lucide-react';
import { useGetAdminUsers, useAdjustUserCredits } from '~/data-provider/admin';
import { Button, Input } from '@librechat/client';
import UserEditModal from './UserEditModal';
import { useLocalize } from '~/hooks';

const UserManagement = () => {
    const localize = useLocalize();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState<any>(null);
    const { data, isLoading } = useGetAdminUsers({ page, search });
    const adjustMutation = useAdjustUserCredits();

    const handleCreditAction = (userId: string) => {
        const amount = window.prompt('Entrez le montant à ajouter (positif) ou retirer (négatif):');
        if (amount) {
            const numAmount = parseInt(amount, 10);
            if (!isNaN(numAmount)) {
                const reason = window.prompt('Raison de l\'ajustement (optionnel):');
                adjustMutation.mutate({ userId, amount: numAmount, reason: reason || undefined });
            }
        }
    };

    if (isLoading && page === 1) {
        return <div className="p-4 text-center animate-pulse">Chargement des utilisateurs...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
                <Input
                    placeholder="Rechercher par email ou nom..."
                    className="pl-10 h-10 border-border-light bg-surface-tertiary"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />
            </div>

            <div className="overflow-hidden rounded-xl border border-border-light bg-surface-primary shadow-sm">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-surface-secondary/50 text-text-secondary font-semibold border-b border-border-light">
                        <tr>
                            <th className="px-4 py-3">Utilisateur</th>
                            <th className="px-4 py-3">Rôle / Quota</th>
                            <th className="px-4 py-3">Usage (Mois)</th>
                            <th className="px-4 py-3">Solde (cr)</th>
                            <th className="px-4 py-3 border-l border-border-light w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                        {data?.users?.map((user: any) => (
                            <tr key={user._id} className="hover:bg-surface-tertiary/30 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="font-bold text-text-primary">{user.name || 'N/A'}</div>
                                    <div className="text-[11px] text-text-secondary truncate max-w-[150px]">{user.email}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${user.role === 'ADMIN' ? 'text-red-500 border-red-500/30 bg-red-500/5' : 'text-text-secondary border-border-light bg-surface-primary'}`}>
                                        {user.role}
                                    </span>
                                    <div className="mt-1">
                                        <span className="text-[10px] text-text-secondary bg-surface-primary px-1 py-0.5 rounded border border-border-light">
                                            {user.quota || 'Défaut'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-text-primary font-bold">{user.usageMonth?.toLocaleString() || 0}</div>
                                    <div className="text-[10px] text-text-secondary">
                                        ≈ ${((user.usageMonth || 0) / 1000000).toFixed(4)}
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-primary">
                                    {user.balance?.toLocaleString()}
                                    <div className="text-[10px] text-text-secondary font-normal">
                                        ≈ ${(user.balance / 1000000).toFixed(4)}
                                    </div>
                                </td>
                                <td className="px-4 py-3 border-l border-border-light text-center flex items-center justify-center gap-1">
                                    <button
                                        onClick={() => handleCreditAction(user._id)}
                                        className="p-1.5 hover:bg-primary/10 rounded-lg text-text-secondary hover:text-primary transition-all"
                                        title="Ajuster les crédits"
                                    >
                                        <Coins className="size-4" />
                                    </button>
                                    <button
                                        onClick={() => setEditingUser(user)}
                                        className="p-1.5 hover:bg-primary/10 rounded-lg text-text-secondary hover:text-primary transition-all"
                                        title="Modifier rôle et quota"
                                    >
                                        <Edit2 className="size-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <UserEditModal
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
                user={editingUser}
            />

            {data?.totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs text-text-secondary">
                        Page {data.currentPage} sur {data.totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-semibold"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Précédent
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-semibold"
                            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                            disabled={page === data.totalPages}
                        >
                            Suivant
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
