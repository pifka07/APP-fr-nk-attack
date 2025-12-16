import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Trophy, MapPin, Coins, Hash, User as UserIcon, Pencil, Check, X, Shirt, LogOut, Trash2 } from "lucide-react";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [runs, setRuns] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userData = await base44.auth.me();
                const runsData = await base44.entities.Run.filter({ user_id: userData.id });
                
                // Get PlayerStats (created by server on first game)
                const statsData = await base44.entities.PlayerStats.filter({ user_id: userData.id });
                
                setUser(userData);
                setStats(statsData.length > 0 ? statsData[0] : {
                    best_score: 0,
                    best_distance: 0,
                    total_coins: 0,
                    total_runs: 0
                });
                setEditName(userData.username || userData.email?.split('@')[0] || 'Pilot');
                setRuns(runsData.sort((a, b) => b.score - a.score).slice(0, 10));
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSaveName = async () => {
        try {
            await base44.auth.updateMe({ username: editName });
            setUser({ ...user, username: editName });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update name", error);
        }
    };

    const handleLogout = () => {
        base44.auth.logout(createPageUrl('Home'));
    };

    const handleDeleteUser = async () => {
        setDeleting(true);
        setShowDeleteDialog(false);
        try {
            const response = await base44.functions.invoke('deleteUserData');
            
            if (response.data.success) {
                toast.success('Alle Daten gelöscht!');
                navigate(createPageUrl('Home'));
            } else {
                toast.error('Fehler beim Löschen der Daten');
                setDeleting(false);
            }
        } catch (error) {
            console.error('Error deleting user data:', error);
            toast.error('Fehler beim Löschen der Daten');
            setDeleting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pb-20">
            <div className="flex items-center gap-2 mb-6 sticky top-0 bg-slate-900/90 backdrop-blur-md z-20 py-4 border-b border-slate-800">
                <Link to={createPageUrl('Home')}>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400">PROFILE</h1>
            </div>

            {/* Profile Header */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-teal-500 flex items-center justify-center mb-4 shadow-lg overflow-hidden">
                    <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/5cbdbe7c2_Frnkprofilbild.png" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                    />
                </div>
                {isEditing ? (
                    <div className="flex items-center gap-2 mb-1">
                        <Input 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-white text-center h-10 w-48"
                        />
                        <Button size="icon" variant="ghost" onClick={handleSaveName} className="h-10 w-10 text-green-400 hover:text-green-300 hover:bg-slate-800">
                            <Check className="w-5 h-5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { setIsEditing(false); setEditName(user.username || user.email?.split('@')[0] || 'Pilot'); }} className="h-10 w-10 text-red-400 hover:text-red-300 hover:bg-slate-800">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-white">{user?.username || user?.email?.split('@')[0] || 'Pilot'}</h2>
                        <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)} className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800">
                            <Pencil className="w-4 h-4" />
                        </Button>
                    </div>
                )}
                <p className="text-slate-400 text-sm">Level 1 Pigeon</p>
                <p className="text-slate-500 text-[10px] mt-1">ID: {user?.id}</p>
            </div>

            {/* Skins Button */}
            <div className="mb-8 px-8">
                <Link to={createPageUrl('Skins')}>
                    <Button className="w-full h-12 font-bold text-lg bg-purple-600 hover:bg-purple-500 text-white shadow-lg border-2 border-purple-400/50 rounded-xl uppercase tracking-wider">
                        <Shirt className="mr-2 w-5 h-5" /> My Skins
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
                        <div className="text-2xl font-bold text-white">{user?.best_score || 0}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">High Score</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <MapPin className="w-8 h-8 text-teal-400 mb-2" />
                        <div className="text-2xl font-bold text-white">{user?.best_distance || 0}m</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Fartherst Flight</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Coins className="w-8 h-8 text-yellow-500 mb-2" />
                        <div className="text-2xl font-bold text-white">{user?.total_coins || 0}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Total Coins</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Hash className="w-8 h-8 text-purple-400 mb-2" />
                        <div className="text-2xl font-bold text-white">{user?.total_runs || 0}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Total Runs</div>
                    </CardContent>
                </Card>
            </div>

            {/* Account Actions */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <Button 
                    onClick={handleLogout}
                    variant="outline"
                    className="h-12 font-bold border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                    <LogOut className="mr-2 w-5 h-5" /> Logout
                </Button>
                <Button 
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={deleting}
                    variant="outline"
                    className="h-12 font-bold border-red-900 bg-red-950/50 hover:bg-red-900/50 text-red-400"
                >
                    <Trash2 className="mr-2 w-5 h-5" /> {deleting ? 'Lösche...' : 'Delete User'}
                </Button>
            </div>

            {/* Recent Runs */}
            <h3 className="text-lg font-bold mb-4 text-teal-300">Recent Runs</h3>
            <div className="space-y-2">
                {runs.length === 0 ? (
                    <div className="text-slate-500 text-center py-4">No runs recorded yet. Go poop!</div>
                ) : (
                    runs.map((run) => (
                        <div key={run.id} className="bg-slate-800/50 rounded-lg p-3 flex justify-between items-center border border-slate-700/50">
                            <div>
                                <div className="font-bold text-white">{run.score} pts</div>
                                <div className="text-xs text-slate-400">{new Date(run.created_date).toLocaleDateString()}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-teal-400 text-sm">{run.distance}m</div>
                                <div className="text-yellow-500 text-xs">+{run.coins_earned} coins</div>
                            </div>
                        </div>
                    ))
                    )}
                    </div>

                    {/* Delete Confirmation Dialog */}
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogContent className="bg-slate-800 border-slate-700 max-w-sm w-full mx-4">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                    Alle deine Daten werden gelöscht! Dies kann nicht rückgängig gemacht werden.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600">
                                    ESC
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={handleDeleteUser}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    DEL
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    </div>
                    );
                    }