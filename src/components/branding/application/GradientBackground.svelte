<script lang="ts">
  import { cn } from "$lib";
  import { Motion } from "svelte-motion";

  export let className: string | undefined = undefined;
  export let containerClassName: string | undefined = undefined;
  export let animate: boolean | undefined = true;

  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };

  // const boarderColors = ["#00ccb1", "#7b61ff", "#ffc414", "#1ca0fb", "#141316"];
  // const shadowColors = ["#00ccb1", "#7b61ff", "#ffc414", "#1ca0fb", "#141316"];
  // const boarderColors = [
  //   "#f43f5e",
  //   "#f97316",
  //   "#fbbf24",
  //   "#84cc16",
  //   "#22c55e",
  // ];

  // const shadowColors = [
  //   "#f43f5e",
  //   "#f97316",
  //   "#fbbf24",
  //   "#84cc16",
  //   "#22c55e",
  // ];
</script>

<div class={cn("group relative p-[4px]", containerClassName)}>
  <Motion
    let:motion
    variants={animate ? variants : undefined}
    initial={animate ? "initial" : undefined}
    animate={animate ? "animate" : undefined}
    transition={animate
      ? {
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }
      : undefined}
    style={{
      backgroundSize: animate ? "400% 400%" : undefined,
    }}
  >
    <!-- "#f43f5e",
    "#f97316",
    "#fbbf24",
    "#84cc16",
    "#22c55e", -->
    <div
      use:motion
      class={cn(
        "absolute inset-0 z-[1] rounded-3xl opacity-60 blur-md transition  duration-500 group-hover:opacity-100",
        // " bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]",
        " bg-[radial-gradient(circle_farthest-side_at_0_100%,#f43f5e,transparent),radial-gradient(circle_farthest-side_at_100%_0,#f97316,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#fbbf24,transparent),radial-gradient(circle_farthest-side_at_0_0,#84cc16,#22c55e)]",
        // ` bg-[radial-gradient(circle_farthest-side_at_0_100%,#f43f5e,transparent),radial-gradient(circle_farthest-side_at_100%_0,#f97316,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#fbbf24,transparent),radial-gradient(circle_farthest-side_at_0_0,#84cc16,#22c55e]`,
        // ` bg-[radial-gradient(circle_farthest-side_at_0_100%,${shadowColors[0]},transparent),radial-gradient(circle_farthest-side_at_100%_0,${shadowColors[1]},transparent),radial-gradient(circle_farthest-side_at_100%_100%,${shadowColors[2]},transparent),radial-gradient(circle_farthest-side_at_0_0,${shadowColors[3]},${shadowColors[4]}]`,
      )}
    ></div>
  </Motion>

  <Motion
    let:motion
    variants={animate ? variants : undefined}
    initial={animate ? "initial" : undefined}
    animate={animate ? "animate" : undefined}
    transition={animate
      ? {
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }
      : undefined}
    style={{
      backgroundSize: animate ? "400% 400%" : undefined,
    }}
  >
    <div
      use:motion
      class={cn(
        "absolute inset-0 z-[1] rounded-lg",
        "bg-[radial-gradient(circle_farthest-side_at_0_100%,#f43f5e,transparent),radial-gradient(circle_farthest-side_at_100%_0,#f97316,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#fbbf24,transparent),radial-gradient(circle_farthest-side_at_0_0,#84cc16,#22c55e)]",
        // `bg-[radial-gradient(circle_farthest-side_at_0_100%,${boarderColors[0]},transparent),radial-gradient(circle_farthest-side_at_100%_0,${boarderColors[1]},transparent),radial-gradient(circle_farthest-side_at_100%_100%,${boarderColors[2]},transparent),radial-gradient(circle_farthest-side_at_0_0,${boarderColors[3]},${boarderColors[4]})]`,
      )}
    ></div>
  </Motion>

  <div class={cn("relative z-10", className)}><slot /></div>
</div>
