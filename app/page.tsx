import Balloon, { PurpleBalloon } from "@/shared/components/background/Balloon";
import Star from "@/shared/components/background/Star";
import { StarsBackground } from "@/shared/components/background/StarBackground";
import StarSwoop from "@/shared/components/background/StarSwoop";
import { Button } from "@/shared/components/ui/button";
import { ArrowRightCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-clip text-center">
      <div className="absolute left-0 top-0 ml-[100px] mt-[100px] h-[1080px] w-[1920px]">
        <StarSwoop className="absolute right-[10px] top-[-300px] z-10 rotate-[15deg] scale-50" />
        <Star className="absolute left-[40px] top-[-50px] z-10 scale-50" />
        <Balloon className="absolute left-[40px] top-[400px] z-10 size-[20em]" />
        <PurpleBalloon className="absolute bottom-[200px] right-[40px] z-10 size-[15em]" />
      </div>
      <StarsBackground minTwinkleSpeed={0.8} twinkleProbability={0.9} />
      <div className="relative z-20 break-words">
        <div className="relative left-[20px] flex h-[50vh] min-h-fit min-w-[55vw] max-w-[80%] flex-col items-center justify-around rounded-xl bg-foreground/20 p-5">
          <div className="mb-3 flex flex-col gap-2">
            <h1 className="mb-3 text-5xl font-bold tracking-tight lg:text-8xl">
              Learn and grow
            </h1>
            <h2 className="text-2xl font-medium tracking-tight lg:text-4xl">
              with your personalized classroom agent
            </h2>
          </div>
          <div className="flex w-2/5 min-w-[50vw] flex-col items-center gap-10">
            <h3 className="text-lg italic lg:text-xl">
              A collaborative space for students and teachers to interact with
              the future of LLM-enhanced education.
            </h3>
            <Button
              effect="hoverUnderlineWhiteExpand"
              icon={ArrowRightCircle}
              iconPlacement="right"
              className="h-12 w-full min-w-fit max-w-[20vw] bg-[#200092] text-white shadow-[0px_0px_45px_1px_#6083FF] hover:bg-[#200092]/90"
            >
              <Link href="classrooms" className="text-lg">
                Start your journey today
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  {
    /* <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-center font-[family-name:var(--font-geist-mono)] text-sm sm:text-left">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="rounded bg-black/[.05] px-1 py-0.5 font-semibold dark:bg-white/[.06]">
              app/page.tsx
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
          <li>This is automatically deployed with tekton CD 3</li>
          <li>
            Org name from env: {process.env.NEXT_PUBLIC_ORGANIZATION_NAME}
          </li>
        </ol>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <a
            className="flex h-10 items-center justify-center gap-2 rounded-full border border-solid border-transparent bg-foreground px-4 text-sm text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] sm:h-12 sm:px-5 sm:text-base"
            href="classrooms"
          >
            My classrooms
          </a>
          <a
            className="flex h-10 items-center justify-center rounded-full border border-solid border-black/[.08] px-4 text-sm transition-colors hover:border-transparent hover:bg-[#f2f2f2] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] sm:h-12 sm:min-w-44 sm:px-5 sm:text-base"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
          <form action={logout}>
            <button
              type="submit"
              className="flex h-10 items-center justify-center rounded-full border border-solid border-black/[.08] px-4 text-sm transition-colors hover:border-transparent hover:bg-[#f2f2f2] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] sm:h-12 sm:min-w-44 sm:px-5 sm:text-base"
            >
              Logout
            </button>
          </form>
        </div> */
  }

  {
    /* <footer className="row-start-3 flex flex-wrap items-center justify-center gap-6">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer> */
  }
}
