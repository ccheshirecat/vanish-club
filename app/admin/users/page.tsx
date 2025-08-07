"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useNotification } from "@/lib/notification-context"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProtectedRoute } from "@/components/protected-route"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface User {
  id: string
  username: string
  displayName: string
  isVendor: boolean
  isAdmin: boolean
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    setFilteredUsers(
      users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.displayName.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )
  }, [users, searchTerm])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        throw new Error("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
        showNotification("Failed to load users", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, field: "isVendor" | "isAdmin", currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentStatus }),
      })

      if (response.ok) {
        setUsers((prevUsers) => prevUsers.map((u) => (u.id === userId ? { ...u, [field]: !currentStatus } : u)))
        showNotification(
          `User ${currentStatus ? "removed from" : "promoted to"} ${field === "isVendor" ? "vendor" : "admin"} status`,
          "success",
        )
      } else {
        throw new Error("Failed to update user status")
      }
    } catch (error) {
      console.error("Error updating user status:", error)
        showNotification("Failed to update user status", "error")
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Manage Users</h1>
        <div className="mb-4 flex items-center">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm mr-2"
          />
          <Search className="text-gray-400" />
        </div>
        {isLoading ? (
          <p className="text-center text-gray-400">Loading users...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Vendor Status</TableHead>
                <TableHead>Admin Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>{user.isVendor ? "Vendor" : "User"}</TableCell>
                  <TableCell>{user.isAdmin ? "Admin" : "Non-Admin"}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => toggleUserStatus(user.id, "isVendor", user.isVendor)}
                      variant="outline"
                      size="sm"
                      className="mr-2"
                    >
                      {user.isVendor ? "Remove Vendor Status" : "Make Vendor"}
                    </Button>
                    <Button
                      onClick={() => toggleUserStatus(user.id, "isAdmin", user.isAdmin)}
                      variant="outline"
                      size="sm"
                    >
                      {user.isAdmin ? "Remove Admin Status" : "Make Admin"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </ProtectedRoute>
  )
}

