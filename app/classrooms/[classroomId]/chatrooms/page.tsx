import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { createClient } from "@shared/utils/supabase/server";
import { ArrowRightIcon, DoorOpen } from "lucide-react";
import Link from "next/link";
import { CreateChatroomDialog } from "./_components/create-chatroom-dialog";

const ChatroomsPage = async ({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No authenticated user found");
  }

  const { classroomId } = await params;

  const currentUser = user.id;

  // Get all chatrooms that user joined for this classroom
  const { data: chatroomMembers, error: chatroomMembersError } = await supabase
    .from("Chatroom_Members")
    .select(
      `
        *,
        Chatrooms(
          id,
          name,
          classroom_id,
          creater_user_id,
          Classrooms(
            name,
            chatroom_assistant_id
          ),
          Users (
            full_name
          )
        ),
        Classroom_Members!inner(
          user_id,
          classroom_id
        )
      `
    )
    .eq("Classroom_Members.user_id", currentUser)
    .eq("Classroom_Members.classroom_id", parseInt(classroomId, 10))
    .eq("is_active", true);

  if (chatroomMembersError) {
    console.error("Error fetching chatrooms:", chatroomMembersError);
    throw new Error("Error fetching chatrooms");
  }

  const chatrooms = chatroomMembers.map((member) => member.Chatrooms);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Chatrooms</h1>

        <CreateChatroomDialog classroomId={classroomId} />
      </div>

      <Separator />

      <div className="mt-10 grid auto-rows-min gap-4 min-[880px]:grid-cols-2 min-[1125px]:grid-cols-3 min-[1665px]:grid-cols-5">
        {chatrooms.length > 0 ? (
          chatrooms.map((chatroom) => (
            <Card key={chatroom.id} className="w-auto min-w-fit" animated>
              <CardHeader>
                <CardTitle animated className="flex justify-between">
                  {chatroom.name}
                </CardTitle>
                <CardDescription animated>
                  <div className="flex flex-row gap-3">
                    Owner: {chatroom.Users.full_name}
                  </div>
                </CardDescription>
              </CardHeader>

              <CardFooter
                animated
                className="m-0 justify-between pb-5 pt-2 align-bottom"
              >
                {/* <TooltipUtil
                  trigger={
                    <Button
                      type="button"
                      variant={"ghost"}
                      size={"iconLg"}
                      asChild
                    >
                      <Link href={`/chatrooms/${chatroom.id}`} passHref>
                        <DoorClosed className="scale-[200%]" />
                      </Link>
                    </Button>
                  }
                  content={"Enter"}
                /> */}
                <Button
                  effect="shineHover"
                  icon={ArrowRightIcon}
                  iconPlacement="right"
                  className="w-full"
                  asChild
                >
                  <Link href={`/chatrooms/${chatroom.id}`} passHref>
                    <div className="flex gap-3">
                      <DoorOpen className="scale-[200%]" />
                      Enter
                    </div>
                  </Link>
                </Button>
                {/* {chatroomMembers && chatroomMembers.length > 0 && ( */}
                {/**/}
                {/* )} */}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-8 text-center">
            <p className="text-gray-500">
              You don&apos;t have any chatrooms yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatroomsPage;
