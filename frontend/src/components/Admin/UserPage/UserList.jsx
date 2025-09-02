import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import userService from '../../../services/userService';
import ConfirmationModal from '../../common/ConfirmationModal';
import { Loader2, Info, Trash2, Shield, User, Search, CheckCircle } from 'lucide-react';

const UserList = () => {
    const { t } = useLanguage();
    const { token } = useAuth();
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await userService.getAllUsers(token);
            setUsers(response.data);
        } catch (err) {
            setError(t('userManagement.fetchError'));
        } finally {
            setLoading(false);
        }
    }, [token, t]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            await userService.deleteUser(userToDelete._id, token);
            showToast(t('userManagement.deleteSuccess'), 'success');
            fetchUsers();
        } catch (err) {
            showToast(t('userManagement.deleteError'), 'error');
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
        }
    };
    
    const handleRoleChange = async (userId, newRole) => {
        try {
            await userService.updateUserRole(userId, newRole, token);
            showToast(t('userManagement.roleUpdateSuccess'), 'success');
            setUsers(prevUsers => prevUsers.map(user => 
                user._id === userId ? { ...user, role: newRole } : user
            ));
        } catch (err) {
            showToast(t('userManagement.roleUpdateError'), 'error');
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const term = searchTerm.toLowerCase();
        return users.filter(user =>
            user.name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term)
        );
    }, [users, searchTerm]);

    if (loading) { return (<div className="flex min-h-[60vh] w-full items-center justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>); }
    if (error) { return (<div className="flex min-h-[60vh] w-full items-center justify-center p-4"><div className="text-center"><Info size={40} className="mx-auto mb-4 text-red-500" /><h3>{t('common.error')}</h3><p className="text-red-600">{error}</p></div></div>); }

    return (
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('userManagement.listTitle')}</h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{t('userManagement.listSubtitle', { count: filteredUsers.length })}</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-zinc-500" />
                    <input type="text" placeholder={t('general.search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-full border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-800 py-2 pl-10 pr-4 text-sm text-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition" />
                </div>
            </header>
            
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-800">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-zinc-800">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr className="text-left">
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider">{t('userManagement.table.user')}</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider">{t('userManagement.table.email')}</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider text-center">{t('userManagement.table.role')}</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider text-center">{t('userManagement.table.activated')}</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider text-center">{t('userManagement.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                        {filteredUsers.map(user => (
                            <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="p-4 font-semibold text-gray-800 dark:text-white">{user.name}</td>
                                <td className="p-4 text-gray-600 dark:text-zinc-400">{user.email}</td>
                                <td className="p-4 text-center">
                                    <select value={user.role} onChange={(e) => handleRoleChange(user._id, e.target.value)} className="rounded-md border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-800 text-xs shadow-sm focus:ring-primary-light/50 focus:border-primary-light transition">
                                        <option value="user">{t('userManagement.roles.user')}</option>
                                        <option value="admin">{t('userManagement.roles.admin')}</option>
                                    </select>
                                </td>
                                <td className="p-4 text-center">
                                    {user.isActivated ? 
                                        <CheckCircle size={18} className="text-green-500 inline-block" /> : 
                                        <Info size={18} className="text-amber-500 inline-block" />
                                    }
                                </td>
                                <td className="p-4 text-center">
                                    <button onClick={() => handleDeleteClick(user)} className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-500 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-red-400 rounded-full transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ConfirmationModal 
                isOpen={!!userToDelete} 
                onClose={() => setUserToDelete(null)} 
                onConfirm={handleConfirmDelete} 
                isConfirming={isDeleting} 
                title={t('userManagement.deleteConfirmTitle')} 
                message={t('userManagement.deleteConfirmMessage', { userName: userToDelete?.name || '' })} 
            />
        </div>
    );
};

export default UserList;