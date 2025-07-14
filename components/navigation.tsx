"use client"

import { BarChart3, FolderOpen, Home, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserProfile } from "@/components/auth/user-profile"

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "folders", label: "Folders", icon: FolderOpen },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ]

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-semibold text-gray-900">BackupBase</h1>
            <nav className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    onClick={() => onTabChange(tab.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </Button>
                )
              })}
            </nav>
          </div>
          <UserProfile />
        </div>
      </div>
    </div>
  )
}
