import { useEffect, useState, useMemo } from "react";
import { api } from "../axios";
import {
    Users,
    UserCheck,
    Clock,
    UserX,
    Search,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar,
    Shield
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

interface RegisteredUser {
    user_id: number;
    name: string;
    email: string;
    role: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
}

export function AdminDashboard() {
    const [users, setUsers] = useState<RegisteredUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
    const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        try {
            setError("");
            const res = await api.get<{ success: boolean; users: RegisteredUser[] }>("/api/admin/users");
            if (res.data.success) {
                setUsers(res.data.users);
            }
        } catch (err: any) {
            console.error("Error fetching users:", err);
            setError(err.response?.data?.error || "Failed to fetch registered users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdateStatus = async (userId: number, newStatus: "approved" | "rejected") => {
        try {
            setActionLoading((prev) => ({ ...prev, [userId]: true }));
            const res = await api.put<{ success: boolean; message: string }>(`/api/admin/users/${userId}/status`, {
                status: newStatus
            });
            if (res.data.success) {
                // Update local state
                setUsers((prev) =>
                    prev.map((u) => (u.user_id === userId ? { ...u, status: newStatus } : u))
                );
            }
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to update user status.");
        } finally {
            setActionLoading((prev) => ({ ...prev, [userId]: false }));
        }
    };

    // Stats
    const stats = useMemo(() => {
        const total = users.length;
        const approved = users.filter((u) => u.status === "approved").length;
        const pending = users.filter((u) => u.status === "pending").length;
        const rejected = users.filter((u) => u.status === "rejected").length;
        return { total, approved, pending, rejected };
    }, [users]);

    // Filtering
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || user.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [users, searchQuery, statusFilter]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-gray-500 font-medium">Loading user directory...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                    Admin Dashboard
                </h1>
                <p className="text-gray-500">
                    Manage registered accounts, review access requests, and control API utilization.
                </p>
            </div>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                    {error}
                </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Registrations", value: stats.total, icon: Users, color: "text-indigo-600 bg-indigo-50 border-indigo-100 animate-in fade-in duration-300" },
                    { label: "Pending Approval", value: stats.pending, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100 animate-in fade-in duration-300 delay-75" },
                    { label: "Approved Accounts", value: stats.approved, icon: UserCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-100 animate-in fade-in duration-300 delay-150" },
                    { label: "Rejected Requests", value: stats.rejected, icon: UserX, color: "text-rose-600 bg-rose-50 border-rose-100 animate-in fade-in duration-300 delay-225" },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={i} className={`p-5 flex items-center justify-between border shadow-sm rounded-2xl ${stat.color}`}>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-xs font-medium text-gray-500 mt-1">{stat.label}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white shadow-xs">
                                <Icon className="w-6 h-6" />
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 bg-white border-gray-200 focus:border-indigo-400 rounded-xl"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-gray-100/80 border p-1 rounded-xl gap-1 self-start md:self-auto">
                    {(["all", "pending", "approved", "rejected"] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setStatusFilter(filter)}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                                statusFilter === filter
                                    ? "bg-white text-indigo-700 shadow-sm border border-gray-100"
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Directory Card */}
            <Card className="overflow-hidden border border-gray-200 shadow-lg rounded-2xl bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">User Details</th>
                                <th className="px-6 py-4">Security Role</th>
                                <th className="px-6 py-4">Registration Date</th>
                                <th className="px-6 py-4">API Access Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No registered users match the criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.user_id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* User Details */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-semibold shadow-xs">
                                                    {user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Role */}
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1">
                                                {user.role === "admin" ? (
                                                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                                                ) : null}
                                                <span className={`font-medium ${user.role === "admin" ? "text-indigo-700 font-semibold" : "text-gray-600"}`}>
                                                    {user.role}
                                                </span>
                                            </span>
                                        </td>
                                        {/* Registration Date */}
                                        <td className="px-6 py-4 text-gray-500">
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {new Date(user.created_at).toLocaleDateString(undefined, {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric"
                                                })}
                                            </div>
                                        </td>
                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <Badge
                                                className={`capitalize px-2.5 py-1 text-[11px] font-semibold border-0 ${
                                                    user.status === "approved"
                                                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                        : user.status === "rejected"
                                                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                                                        : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                }`}
                                            >
                                                {user.status}
                                            </Badge>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.status !== "approved" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(user.user_id, "approved")}
                                                        disabled={actionLoading[user.user_id]}
                                                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-3 text-xs flex items-center gap-1"
                                                    >
                                                        {actionLoading[user.user_id] ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                        )}
                                                        Approve
                                                    </Button>
                                                )}
                                                {user.status !== "rejected" && user.role !== "admin" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleUpdateStatus(user.user_id, "rejected")}
                                                        disabled={actionLoading[user.user_id]}
                                                        className="h-8 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer px-3 text-xs flex items-center gap-1"
                                                    >
                                                        {actionLoading[user.user_id] ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <XCircle className="w-3.5 h-3.5" />
                                                        )}
                                                        Reject
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
