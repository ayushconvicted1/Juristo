"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ModeToggle({ className = "" }) {
  // Default className to empty string
  const { setTheme, theme } = useTheme();
  const [selectedTab, setSelectedTab] = React.useState("tab1"); // Track the selected tab

  // Generate dynamic content based on the selected tab
  const getTabContent = (tab) => {
    switch (tab) {
      case "tab1":
        return "Response for Tab 1: This is the content based on your first question.";
      case "tab2":
        return "Response for Tab 2: This content is generated when the second tab is clicked.";
      case "tab3":
        return "Response for Tab 3: This content appears when the third tab is selected.";
      default:
        return "Select a tab to view content.";
    }
  };

  return (
    <div>
      {/* Theme Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className={`relative ${className}`} // Ensure className is passed correctly
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <Sun
          className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
            theme === "dark" ? "rotate-0 scale-0" : "rotate-0 scale-100"
          }`}
        />
        <Moon
          className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
            theme === "light" ? "rotate-90 scale-0" : "rotate-0 scale-100"
          }`}
        />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Tabs and Cards */}
      <Tabs
        defaultValue="tab1"
        value={selectedTab}
        onValueChange={setSelectedTab}
      >
        <TabsList className="my-4 flex gap-4">
          <TabsTrigger
            value="tab1"
            className="py-2 px-4 cursor-pointer rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Tab 1
          </TabsTrigger>
          <TabsTrigger
            value="tab2"
            className="py-2 px-4 cursor-pointer rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Tab 2
          </TabsTrigger>
          <TabsTrigger
            value="tab3"
            className="py-2 px-4 cursor-pointer rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Tab 3
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TabsContent value="tab1">
            <Card className="bg-white p-6 shadow-md rounded-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold">Tab 1 Content</h3>
              </CardHeader>
              <CardContent>
                <p>{getTabContent("tab1")}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tab2">
            <Card className="bg-white p-6 shadow-md rounded-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold">Tab 2 Content</h3>
              </CardHeader>
              <CardContent>
                <p>{getTabContent("tab2")}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tab3">
            <Card className="bg-white p-6 shadow-md rounded-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold">Tab 3 Content</h3>
              </CardHeader>
              <CardContent>
                <p>{getTabContent("tab3")}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
