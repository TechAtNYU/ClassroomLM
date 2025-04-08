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
  UploadIcon,
} from "lucide-react";

// import Image from "next/image";

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
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuSub,
} from "@shared/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@shared/components/ui/dropdown-menu";
import { ModeToggle } from "./mode-toggle";
import { usePathname } from "next/navigation";
import { getPageAspectsByPath } from "./nav-utils";
import { Skeleton } from "../skeleton";
import { useContext } from "react";
import { UserContext } from "@shared/lib/userContext/userContext";
import { ClassroomWithMembers } from "@shared/lib/userContext/contextFetcher";
import LogoComponent from "@shared/components/Logo";

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

export function AppSidebar() {
  // props: { userData: User | null }
  // get username
  // get path from URL
  // parallel rendering for upload/new classroom

  // make items bigger

  const items = {
    enrolled: {
      title: "Enrolled",
      url: "/classrooms",
      icon: BookText,
      isActive: false,
    },
    adminManage: {
      title: "Manage courses",
      url: "/classrooms",
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

  const adminManageClassItems = {
    chat: {
      title: "Personal Assistant",
      suffixURL: "/chat",
      icon: SpeechIcon,
      isActive: false,
    },
    upload: {
      title: "Material Uploading",
      suffixURL: "upload",
      icon: UploadIcon,
      isActive: false,
    },
  };

  const pathname = usePathname();
  const activePageHierarchy = getPageAspectsByPath(pathname);

  const userContext = useContext(UserContext);
  if (!userContext) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }
  const user = userContext.userAndClassData.userData;
  const username = user.user_metadata?.full_name ?? "User Name";

  let classroomInfo: ClassroomWithMembers | undefined,
    isAdminOfActiveClass: boolean = false;
  if (activePageHierarchy?.classroomLanding) {
    items.enrolled.isActive = true;
  } else if (activePageHierarchy?.activeClassroom) {
    classroomInfo = userContext.userAndClassData.classroomsData.find(
      (x) => x.id === activePageHierarchy?.activeClassroom.id
    );
    isAdminOfActiveClass = user.id === classroomInfo?.admin_user_id;
  }
  // } else if (activePageHierarchy?.activeClassroom) {
  //   items.enrolled.isActive = true;
  //   // enrolledClassItems.
  // }
  // items[0].subItems[0].subitems?.push("")

  return (
    <Sidebar
      // style={{
      //   backgroundImage:
      //     "linear-gradient(to bottom, #263843, #25374e, #223457, #203160, #1c2d71, #1f3073, #273574, #2b3875)",
      // }}
      // className="bg-[linear-gradient(to bottom, #263843, #25374e, #223457, #203160, #1c2d71, #1f3073, #273574, #2b3875)]"
      collapsible="icon"
      variant="inset"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {/* <div className="relative h-[90%] w-[90%] object-contain"> */}
                  {/* <Image src={"/logo.svg"} fill alt="Logo" className="fill-red-600"/> */}
                  <LogoComponent className="fill-sidebar-primary-foreground" />
                  {/* </div> */}
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
        <SidebarGroup >
          <SidebarGroupLabel       className="text-lg"
          >Classes</SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {Object.entries(items).map(([itemKey, item]) => (
              <SidebarMenuItem  key={item.title}>
                <SidebarMenuButton
                      className="text-lg"

                  tooltip={item.title}
                  isActive={item.isActive}
                  asChild
                  size="default"
                >
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
                {activePageHierarchy?.activeClassroom &&
                  classroomInfo &&
                  ((itemKey == "enrolled" && !isAdminOfActiveClass) ||
                    (itemKey == "adminManage" && isAdminOfActiveClass)) && (
                    <SidebarMenuSub >
                      <SidebarMenuSubItem
                        key={activePageHierarchy?.activeClassroom?.id}
                        
                      >
                        <SidebarMenuSubButton
                          // size="md"
                          isActive
                          className="mt-2 text-lg"
                        >
                          {/* {item.icon && <item.icon />} */}
                          <span>{classroomInfo.name}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {activePageHierarchy?.activeClassroom && classroomInfo && (
          <SidebarGroup>
            <SidebarGroupLabel>{classroomInfo.name}</SidebarGroupLabel>
            <SidebarMenu>
              {Object.values(
                isAdminOfActiveClass
                  ? adminManageClassItems
                  : enrolledClassItems
              ).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.isActive}
                    asChild
                  >
                    <a href={item.suffixURL}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
                  <User2 />
                  {username}
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
