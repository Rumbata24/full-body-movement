import { Card } from "@/components/ui/Card";

const TIPS = [
  {
    title: "Group by what you train together",
    detail:
      "e.g. \"Push Day\" (planche, dips, push-ups) or \"Pull Day\" (front lever, pull-ups, rows). One plan per session type you repeat often.",
  },
  {
    title: "Hardest skill first",
    detail:
      "Put your main skill work (Maltese, Planche, Front Lever) at the top, while you're fresh. Save easier accessory work for the end.",
  },
  {
    title: "Keep it short",
    detail:
      "3–6 exercises is usually enough to actually finish. You can always add more on the day if you have extra energy.",
  },
];

export function PlanGuideContent() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        A plan is just a reusable template — build it once, then load it
        anytime you train that session type.
      </p>

      {TIPS.map((tip) => (
        <Card key={tip.title} className="flex flex-col gap-1">
          <p className="text-[15px] font-medium">{tip.title}</p>
          <p className="text-sm text-text-muted">{tip.detail}</p>
        </Card>
      ))}

      <Card raised className="flex flex-col gap-1.5">
        <p className="text-[15px] font-medium">Using it later</p>
        <p className="text-sm text-text-muted">
          On the Log screen, tap &quot;Start from a plan&quot; to pre-fill your
          sets — then edit freely as you train. Changing it there never
          touches the saved plan.
        </p>
      </Card>
    </div>
  );
}
