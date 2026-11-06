import { useLanguage } from "@/contexts/LanguageContext";
import demoVideo from "@/assets/services/simplia-demo-1024.mp4";
import demoPoster from "@/assets/services/simplia-demo-poster-1024.webp";
import { ServiceDemoVideo } from "@/components/ServiceDemoVideo";
import { ExampleChat } from "@/components/ExampleChat";
import { DemoLink } from "@/components/DemoLinks";

/**
 * The answer to the hero: the same question, this time with the agent on it.
 * The 40-second video on one side, Lucía's conversation playing out on the
 * other, and a single line underneath inviting the reader to write to the
 * agent themselves.
 *
 * The video still fetches nothing until the reader comes near it, which is
 * what tests/demo-video.spec.ts guards; the chat is in the prerendered HTML
 * in full and only plays back when it comes into view.
 */
export function HomeAnswer() {
  const { t } = useLanguage();

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

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] gap-x-[clamp(20px,3vw,40px)] gap-y-8">
          <figure id="video" className="m-0 grid min-w-0 content-start scroll-mt-[88px] gap-3">
            {/* content-start, or the equal-height columns stretch the 4:3 box
                and leave a grey band under the picture. */}
            <ServiceDemoVideo
              src={demoVideo}
              poster={demoPoster}
              width={1024}
              height={768}
              labelKey="features.videoLabel"
              className="w-full"
            />
            <figcaption className="text-[15px] text-muted-foreground">{t("answer.videoCaption")}</figcaption>
          </figure>

          <ExampleChat className="min-w-0" />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-[clamp(20px,3vw,32px)]">
          <p className="m-0 flex-[1_1_320px] text-[clamp(17px,1.4vw,19px)] font-semibold text-foreground">
            {t("answer.tryIt")}
          </p>
          <DemoLink lugar="banda-final" />
        </div>
      </div>
    </section>
  );
}
