"use client";

import {
  // Megaphone,
  // Circle,
  // UserRoundPen,
  BookText,
  // Bell,
  User2,
  ChevronUp,
  UserRoundCog,
  SpeechIcon,
} from "lucide-react";

import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "./mode-toggle";
import { usePathname } from "next/navigation";
import { getPageAspectsByPath } from "./nav-utils";

// Menu items.
// const items = [
//   // {
//   //   title: "──────────────",
//   //   url: "#",
//   //   icon: Circle,
//   //   subItems: [],
//   // },
//   // {
//   //   title: "Announcements",
//   //   url: "/",
//   //   icon: Megaphone,
//   //   subItems: [],
//   // },
//   {
//     title: "Enrolled",
//     url: "/classroom",
//     icon: BookText,
//     isActive: false,
//   },
//   {
//     title: "Manage courses",
//     url: "/classroom",
//     icon: UserRoundCog,
//     isActive: false,
//   },

//   // {
//   //   title: "──────────────",
//   //   url: "#",
//   //   icon: Circle,
//   //   subItems: [],
//   // },
//   // {
//   //   title: "Profile",
//   //   url: "/profile",
//   //   icon: UserRoundPen,
//   //   subItems: [],
//   // },
//   // {
//   //   title: "Notifications",
//   //   url: "/notifications",
//   //   icon: Bell,
//   //   subItems: [],
//   // },
// ];
const items = {
  enrolled: {
    title: "Enrolled",
    url: "/classroom",
    icon: BookText,
    isActive: false,
  },
  adminManage: {
    title: "Manage courses",
    url: "/classroom",
    icon: UserRoundCog,
    isActive: false,
  },
};

const enrolledClassItems = {
  chat: {
    title: "Personal Assistant",
    suffixURL: "/chat",
    icon: SpeechIcon,
    isActive: false,
  },
};

// const manageClassItems = {
//   chat: {
//     title: "Personal Assistant",
//     suffixURL: "/chat",
//     icon: SpeechIcon,
//     isActive: false,
//   },
//   upload: {
//     title: "Material Uploading",
//     suffixURL: "/upload",
//     icon: UploadIcon,
//     isActive: false,
//   }
// }

export function AppSidebar(props: { username: string }) {
  // get username
  // get path from URL
  // parallel rendering for upload/new classroom

  const pathname = usePathname();
  const activePageHierarchy = getPageAspectsByPath(pathname);
  if (activePageHierarchy?.classroomLanding) {
    items.enrolled.isActive = true;
  }

  if (activePageHierarchy?.activeClassroom) {
    items.enrolled.isActive = true;
    // enrolledClassItems.
  }
  // items[0].subItems[0].subitems?.push("")

  return (
    <Sidebar
      style={{
        backgroundImage:
          "linear-gradient(to bottom, #263843, #25374e, #223457, #203160, #1c2d71, #1f3073, #273574, #2b3875)",
      }}
      collapsible="icon"
      variant="inset"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center text-sidebar-primary-foreground">
                  <div className="relative h-[90%] w-[90%] object-contain">
                    <Image src={"/logo.svg"} fill alt="Logo" />
                  </div>
                </div>
                <div className="grid flex-1 text-left text-lg leading-tight">
                  <span className="truncate font-semibold">ClassroomLM</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/**  <SidebarGroup>
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
                      <SidebarMenuButton isActive
                        // asChild
                        // style={{
                        //   pointerEvents: item.url != "#" ? "auto" : "none",
                        // }}
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
        </SidebarGroup> */}
        <SidebarGroup>
          <SidebarGroupLabel>Classes</SidebarGroupLabel>
          <SidebarMenu>
            {Object.values(items).map((item) => (
              // <Collapsible
              //   key={item.title}
              //   asChild
              //   defaultOpen={item.isActive}
              //   className="group/collapsible"
              // >
              <SidebarMenuItem key={item.title}>
                {/* <CollapsibleTrigger asChild> */}
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={item.isActive}
                  asChild
                >
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                  {/* <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" /> */}
                </SidebarMenuButton>
                {/* </CollapsibleTrigger> */}
                {/* <CollapsibleContent>
                <SidebarMenuSub> */}
                {/* {item.subItems?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))} */}
                {/* </SidebarMenuSub> */}
                {/* </CollapsibleContent> */}
              </SidebarMenuItem>
              // </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {activePageHierarchy?.activeClassroom && (
          <SidebarGroup>
            <SidebarGroupLabel>
              {activePageHierarchy?.activeClassroom?.id}
            </SidebarGroupLabel>
            <SidebarMenu>
              {Object.values(enrolledClassItems).map((item) => (
                // <Collapsible
                //   key={item.title}
                //   asChild
                //   defaultOpen={item.isActive}
                //   className="group/collapsible"
                // >
                <SidebarMenuItem key={item.title}>
                  {/* <CollapsibleTrigger asChild> */}
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.isActive}
                    asChild
                  >
                    <a href={item.suffixURL}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                    {/* <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" /> */}
                  </SidebarMenuButton>
                  {/* </CollapsibleTrigger> */}
                  {/* <CollapsibleContent>
                <SidebarMenuSub> */}
                  {/* {item.subItems?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))} */}
                  {/* </SidebarMenuSub> */}
                  {/* </CollapsibleContent> */}
                </SidebarMenuItem>
                // </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex-col items-end">
          <ModeToggle />
        </div>
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
