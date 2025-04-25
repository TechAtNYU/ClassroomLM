import { signInWithGoogle } from "@/app/login/actions";
import Balloon, {
  GreenBalloon,
  PurpleBalloon,
} from "@/shared/components/background/Balloon";
import CloudLeft from "@/shared/components/background/CloudLeft";
import CloudRight from "@/shared/components/background/CloudRight";
import Star from "@/shared/components/background/Star";
import { StarsBackground } from "@/shared/components/background/StarBackground";
import StarSwoop from "@/shared/components/background/StarSwoop";
import GoogleSignInButton from "@/shared/components/GoogleSignInButton";
import Logo from "@/shared/components/Logo";

export default async function LoginPage() {
  return (
    <>
      <CloudLeft className="absolute bottom-0 left-0 z-40 origin-bottom-left scale-[0.35] min-[500px]:scale-[0.25] min-[1270px]:scale-[0.15]" />
      <CloudRight className="absolute bottom-0 right-0 z-40 origin-bottom-right scale-[0.35] min-[500px]:scale-[0.25] min-[1270px]:scale-[0.15]" />
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-clip text-center dark:bg-[linear-gradient(0deg,_#443461,_#130F5A_38%,_#1F1F1F)]">
        <div className="absolute left-0 top-0 h-[1080px] w-[1920px]">
          <StarSwoop className="absolute right-[10%] top-[-33%] z-10 rotate-[15deg] scale-[0.3] dark:visible" />
          <Star className="invisible absolute left-[7%] top-[10%] z-10 scale-[0.4] dark:visible" />
          <Balloon className="absolute bottom-[40%] left-[5%] z-10 size-[10em]" />
          <PurpleBalloon className="absolute bottom-[28%] right-[9%] z-10 size-[9em]" />
          <GreenBalloon className="absolute bottom-[29%] right-[45%] z-10 size-[3em]" />
        </div>
        <StarsBackground
          minTwinkleSpeed={0.8}
          twinkleProbability={0.9}
          className="z-[0]"
        />
        <div className="relative z-20 flex content-center justify-center break-words">
          <div className="relative flex h-[50vh] min-h-fit min-w-[55vw] max-w-[80%] flex-col items-center justify-around rounded-xl bg-foreground/20 p-5">
            <div className="justify-content mb-3 flex flex-col items-center gap-2">
              <div className="w-fit rounded-xl border-[4px] border-border bg-muted/50 px-2 text-center dark:border-none dark:bg-inherit">
                <Logo className="size-[9vh] fill-foreground stroke-foreground stroke-[1em]" />
              </div>
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
              {/* <Button
    effect="hoverUnderlineWhiteExpand"
    icon={ArrowRightCircle}
    iconPlacement="right"
    className="h-12 w-full max-w-[20vw] bg-[#200092] text-white shadow-[0px_0px_45px_1px_#6083FF] hover:bg-[#200092]/90"
  >
    <Link href="classrooms" className="text-lg">
      Start your journey today
    </Link>
  </Button> */}
              <form action={signInWithGoogle}>
                <GoogleSignInButton className="h-12 w-full min-w-fit shadow-[0px_0px_45px_1px_#6083FF]" />
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
