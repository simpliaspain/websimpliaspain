import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import demoVideo from "@/assets/services/simplia-demo-1024.mp4";
import demoPoster from "@/assets/services/simplia-demo-poster-1024.webp";
import { ServiceDemoVideo } from "@/components/ServiceDemoVideo";
import { ExampleChat } from "@/components/ExampleChat";
import { DemoLink } from "@/components/DemoLinks";
import { cn } from "@/lib/utils";

/**
 * The answer to the hero: the same question, this time with the agent on it.
 * The 40-second video on one side, Marta's conversation playing out on the
 * other, and the invitation to write to the agent yourself in the space the
 * video's shape leaves beside it.
 *
 * That invitation waits its turn. It holds its place from the first paint,
 * so nothing moves and nothing is hidden from anyone, but while the demo is
 * still running its button is the quiet outline - the page is not asking for
 * anything yet. The moment the clip has been seen through once the panel
 * lifts and the button arrives in full, in the redesign's own entrance.
 * Someone who never plays the video still has a working button; it simply
 * never shouts at them.
 *
 * The video still fetches nothing until the reader comes near it, which is
 * what tests/demo-video.spec.ts guards; the chat is in the prerendered HTML
 * in full and only plays back when it comes into view.
 */
export function HomeAnswer() {
  const { t } = useLanguage();
  const [demoSeen, setDemoSeen] = useState(false);

  return (
    <section
      id="accion"
      aria-labelledby="h-accion"
      className="scroll-mt-[68px] border-t border-border py-[clamp(48px,7vw,104px)]"
    >
      <div className="wrap grid gap-[clamp(24px,3vw,40px)]">
        <h2
          id="h-accion"
          className="m-0 text-[clamp(28px,3.1vw,42px)] font-bold leading-[1.1] text-foreground"
        >
          {t("answer.title")}
        </h2>

        {/* Two columns from lg, and the row is explicit rather than auto-fit
            so the invitation has somewhere to be: the video is 4:3 and the
            conversation is a tall card, which left a sixth of the left column
            empty under the caption. The invitation fills it, right under the
            demo it is inviting you to try. Stacked, the three read in source
            order - video, conversation, invitation - and the invitation is
            full width at the foot of the section, which is where it was. */}
        <div className="grid gap-x-[clamp(20px,3vw,40px)] gap-y-8 lg:grid-cols-2 lg:[grid-template-rows:auto_1fr]">
          <figure id="video" className="m-0 grid min-w-0 content-start scroll-mt-[88px] lg:col-start-1 lg:row-start-1">
            {/* content-start, or the equal-height columns stretch the 4:3 box
                and leave a grey band under the picture. */}
            <ServiceDemoVideo
              src={demoVideo}
              poster={demoPoster}
              width={1024}
              height={768}
              labelKey="features.videoLabel"
              className="w-full"
              onFinished={() => setDemoSeen(true)}
            />
          </figure>

          <ExampleChat className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1" />

          <div
            className={cn(
              "flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-border pt-[clamp(20px,3vw,32px)] lg:col-start-1 lg:row-start-2 lg:content-center lg:rounded-[18px] lg:border-t-0 lg:bg-secondary lg:p-[clamp(20px,2vw,28px)]",
              demoSeen && "motion-safe:animate-lift",
            )}
          >
            <p className="m-0 flex-[1_1_280px] text-[clamp(17px,1.4vw,19px)] font-semibold text-foreground">
              {t("answer.tryIt")}
            </p>
            {/* Keyed on the state so the button is a new element when the
                demo finishes and the entrance actually runs. */}
            <DemoLink
              key={demoSeen ? "loud" : "quiet"}
              lugar="banda-final"
              quiet={!demoSeen}
              className={cn(demoSeen && "motion-safe:animate-rise")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
