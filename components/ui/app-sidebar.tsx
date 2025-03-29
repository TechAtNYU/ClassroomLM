import {
  Megaphone,
  Circle,
  UserRoundPen,
  BookText,
  Bell,
  User2,
  ChevronUp,
} from "lucide-react";

import LogoImg from "@/components/ui/logoImg";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Menu items.
const items = [
  {
    title: "──────────────",
    url: "#",
    icon: Circle,
    subItems: [],
  },
  {
    title: "Announcements",
    url: "/",
    icon: Megaphone,
    subItems: [],
  },
  {
    title: "Courses",
    url: "/",
    icon: BookText,
    subItems: [
      {
        title: "Enrolled",
        url: "/classroom",
        icon: BookText,
      },
      {
        title: "My Courses",
        url: "/classroom",
        icon: BookText,
      },
    ],
  },
  {
    title: "──────────────",
    url: "#",
    icon: Circle,
    subItems: [],
  },
  {
    title: "Profile",
    url: "/profile",
    icon: UserRoundPen,
    subItems: [],
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    subItems: [],
  },
];

export function AppSidebar(props: { username: string }) {
  return (
    <Sidebar
      style={{
        backgroundImage:
          "linear-gradient(to bottom, #263843, #25374e, #223457, #203160, #1c2d71, #1f3073, #273574, #2b3875)",
      }}
    >
      <SidebarContent>
        <SidebarGroup>
          <div className="m-2 flex flex-row">
            <LogoImg />
            <SidebarGroupLabel className="text-white">
              Classroom LM
            </SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <Collapsible
                  defaultOpen
                  className="group/collapsible"
                  key={item.title}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        asChild
                        style={{
                          pointerEvents: item.url != "#" ? "auto" : "none",
                        }}
                      >
                        <a href={item.url == "/" ? "#" : item.url}>
                          {item.icon != null ? <item.icon /> : <span></span>}
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      {item.subItems.map((sub) => (
                        <SidebarMenuSub
                          key={sub.title}
                          className="rounded-r-lg hover:bg-[#858fad]"
                        >
                          <SidebarMenuSubItem>
                            <a href={sub.url}>
                              <span>{sub.title}</span>
                            </a>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      ))}
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {props.username ?? "Username"}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
