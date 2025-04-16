"use client";
import { useTransition } from "react";
import { autogenerateMaterial } from "./actions";

type AutogenerateButtonProps = {
  classroomId: number;
};

export default function AutogenerateButton({
  classroomId,
}: AutogenerateButtonProps) {
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    startTransition(async () => {
      try {
        const result = await autogenerateMaterial(classroomId);
        console.log("Generated material:", result);
        // After autogeneration, reload the page to update generated content.
        window.location.reload();
      } catch (error) {
        console.error("Error during autogeneration:", error);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded bg-blue-500 px-4 py-2 text-white"
    >
      {isPending ? "Generating..." : "Autogenerate Material"}
    </button>
  );
}
