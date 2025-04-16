import { signInWithGoogle } from "@/app/login/actions";
import GoogleSignInButton from "@/shared/components/GoogleSignInButton";

export default async function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[linear-gradient(0deg,_#FFF4D9,_#FFEFD2_52%,_#67C5FF)] text-center dark:bg-[linear-gradient(0deg,_#443461,_#130F5A_38%,_#1F1F1F)]">
      <div className="flex h-[50vh] min-h-fit max-w-[80%] flex-col items-center justify-around rounded-xl bg-foreground/20 p-5">
        <div className="mb-3 flex flex-col gap-2">
          <h1 className="mb-3 text-5xl font-bold tracking-tight lg:text-7xl">
            Learn and grow
          </h1>
          <h2 className="text-2xl font-medium tracking-tight lg:text-4xl">
            with your personalized classroom agent
          </h2>
        </div>
        <div className="flex w-2/5 min-w-[50vw] flex-col items-center gap-10">
          <h3 className="text-lg italic lg:text-xl">
            A collaborative space for students and teachers to interact with the
            future of LLM-enhanced education.
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
  );
}
