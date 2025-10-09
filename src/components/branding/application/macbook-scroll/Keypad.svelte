<script>
  import KBtn from "./KBtn.svelte";

  import {
    IconBrightnessDown,
    IconBrightnessUp,
    IconCaretRightFilled,
    IconCaretUpFilled,
    IconChevronUp,
    IconMicrophone,
    IconMoon,
    IconPlayerSkipForward,
    IconPlayerTrackNext,
    IconPlayerTrackPrev,
    IconTable,
    IconVolume,
    IconVolume2,
    IconVolume3,
    IconSearch,
    IconWorld,
    IconCommand,
    IconCaretLeftFilled,
    IconCaretDownFilled,
  } from "@tabler/icons-svelte";
</script>

<div class="mx-1 h-full rounded-md bg-[#050505] p-1">
  <!-- First Row -->
  <div class="mb-[2px] flex w-full flex-shrink-0 gap-[2px]">
    <KBtn
      className="w-10 items-end justify-start pl-[4px] pb-[2px]"
      childrenClassName="items-start"
    >
      esc
    </KBtn>
    <KBtn>
      <IconBrightnessDown class="h-[6px] w-[6px]" />
      <span class="mt-1 inline-block">F1</span>
    </KBtn>

    <KBtn>
      <IconBrightnessUp class="h-[6px] w-[6px]" />
      <span class="mt-1 inline-block">F2</span>
    </KBtn>
    <KBtn>
      <IconTable class="h-[6px] w-[6px]" />
      <span class="mt-1 inline-block">F3</span>
    </KBtn>
    <KBtn>
      <IconSearch class="h-[6px] w-[6px]" />
      <span class="mt-1 inline-block">F4</span>
    </KBtn>
    <KBtn>
      <IconMicrophone class="h-[6px] w-[6px]" />
      <span class="mt-1 inline-block">F5</span>
    </KBtn>
    <KBtn>
      <IconMoon class="h-[6px] w-[6px]" />
      <span class="mt-1 inline-block">F6</span>
    </KBtn>
    <KBtn>
      <IconPlayerTrackPrev class="h-[6px] w-[6px]" />
      <span class="mt-1 inline-block">F7</span>
    </KBtn>
    <KBtn>
      <IconPlayerSkipForward class="h-[6px] w-[6px]" />
      <span class="mt-1 inline-block">F8</span>
    </KBtn>
    <KBtn>
      <IconPlayerTrackNext class="h-[6px] w-[6px]" />
      <span class="mt-1 inline-block">F8</span>
    </KBtn>
    <KBtn>
      <IconVolume3 class="h-[6px] w-[6px]" />
      <span class="mt-1 inline-block">F10</span>
    </KBtn>
    <KBtn>
      <IconVolume2 class="h-[6px] w-[6px]" />
      <span class="mt-1 inline-block">F11</span>
    </KBtn>
    <KBtn>
      <IconVolume class="h-[6px] w-[6px]" />
      <span class="mt-1 inline-block">F12</span>
    </KBtn>
    <KBtn>
      <div
        class="h-4 w-4 rounded-full bg-gradient-to-b from-neutral-900 from-20% via-black via-50% to-neutral-900 to-95% p-px"
      >
        <div class="h-full w-full rounded-full bg-black"></div>
      </div>
    </KBtn>
  </div>

  <!-- Second row -->
  <div class="mb-[2px] flex w-full flex-shrink-0 gap-[2px]">
    <KBtn>
      <span class="block">~</span>
      <span class="mt-1 block">`</span>
    </KBtn>

    <KBtn>
      <span class="block">!</span>
      <span class="block">1</span>
    </KBtn>
    <KBtn>
      <span class="block">@</span>
      <span class="block">2</span>
    </KBtn>
    <KBtn>
      <span class="block">#</span>
      <span class="block">3</span>
    </KBtn>
    <KBtn>
      <span class="block">$</span>
      <span class="block">4</span>
    </KBtn>
    <KBtn>
      <span class="block">%</span>
      <span class="block">5</span>
    </KBtn>
    <KBtn>
      <span class="block">^</span>
      <span class="block">6</span>
    </KBtn>
    <KBtn>
      <span class="block">&</span>
      <span class="block">7</span>
    </KBtn>
    <KBtn>
      <span class="block">*</span>
      <span class="block">8</span>
    </KBtn>
    <KBtn>
      <span class="block">(</span>
      <span class="block">9</span>
    </KBtn>
    <KBtn>
      <span class="block">)</span>
      <span class="block">0</span>
    </KBtn>
    <KBtn>
      <span class="block">&mdash;</span>
      <span class="block">_</span>
    </KBtn>
    <KBtn>
      <span class="block">+</span>
      <span class="block"> = </span>
    </KBtn>
    <KBtn
      className="w-10 items-end justify-end pr-[4px] pb-[2px]"
      childrenClassName="items-end"
    >
      delete
    </KBtn>
  </div>

  <!-- Third row -->
  <div class="mb-[2px] flex w-full flex-shrink-0 gap-[2px]">
    <KBtn
      className="w-10 items-end justify-start pl-[4px] pb-[2px]"
      childrenClassName="items-start"
    >
      tab
    </KBtn>
    <KBtn>
      <span class="block">Q</span>
    </KBtn>

    <KBtn>
      <span class="block">W</span>
    </KBtn>
    <KBtn>
      <span class="block">E</span>
    </KBtn>
    <KBtn>
      <span class="block">R</span>
    </KBtn>
    <KBtn>
      <span class="block">T</span>
    </KBtn>
    <KBtn>
      <span class="block">Y</span>
    </KBtn>
    <KBtn>
      <span class="block">U</span>
    </KBtn>
    <KBtn>
      <span class="block">I</span>
    </KBtn>
    <KBtn>
      <span class="block">O</span>
    </KBtn>
    <KBtn>
      <span class="block">P</span>
    </KBtn>
    <KBtn>
      <span class="block">{`{`}</span>
      <span class="block">{`[`}</span>
    </KBtn>
    <KBtn>
      <span class="block">{`}`}</span>
      <span class="block">{`]`}</span>
    </KBtn>
    <KBtn>
      <span class="block">{`|`}</span>
      <span class="block">{`\\`}</span>
    </KBtn>
  </div>

  <!-- Fourth Row -->
  <div class="mb-[2px] flex w-full flex-shrink-0 gap-[2px]">
    <KBtn
      className="w-[2.8rem] items-end justify-start pl-[4px] pb-[2px]"
      childrenClassName="items-start"
    >
      caps lock
    </KBtn>
    <KBtn>
      <span class="block">A</span>
    </KBtn>

    <KBtn>
      <span class="block">S</span>
    </KBtn>
    <KBtn>
      <span class="block">D</span>
    </KBtn>
    <KBtn>
      <span class="block">F</span>
    </KBtn>
    <KBtn>
      <span class="block">G</span>
    </KBtn>
    <KBtn>
      <span class="block">H</span>
    </KBtn>
    <KBtn>
      <span class="block">J</span>
    </KBtn>
    <KBtn>
      <span class="block">K</span>
    </KBtn>
    <KBtn>
      <span class="block">L</span>
    </KBtn>
    <KBtn>
      <span class="block">{`:`}</span>
      <span class="block">{`;`}</span>
    </KBtn>
    <KBtn>
      <span class="block">{`"`}</span>
      <span class="block">{`'`}</span>
    </KBtn>
    <KBtn
      className="w-[2.85rem] items-end justify-end pr-[4px] pb-[2px]"
      childrenClassName="items-end"
    >
      return
    </KBtn>
  </div>

  <!-- Fifth Row -->
  <div class="mb-[2px] flex w-full flex-shrink-0 gap-[2px]">
    <KBtn
      className="w-[3.65rem] items-end justify-start pl-[4px] pb-[2px]"
      childrenClassName="items-start"
    >
      shift
    </KBtn>
    <KBtn>
      <span class="block">Z</span>
    </KBtn>
    <KBtn>
      <span class="block">X</span>
    </KBtn>
    <KBtn>
      <span class="block">C</span>
    </KBtn>
    <KBtn>
      <span class="block">V</span>
    </KBtn>
    <KBtn>
      <span class="block">B</span>
    </KBtn>
    <KBtn>
      <span class="block">N</span>
    </KBtn>
    <KBtn>
      <span class="block">M</span>
    </KBtn>
    <KBtn>
      <span class="block">{`<`}</span>
      <span class="block">{`,`}</span>
    </KBtn>
    <KBtn>
      <span class="block">{`>`}</span>
      <span class="block">{`.`}</span>
    </KBtn>{" "}
    <KBtn>
      <span class="block">{`?`}</span>
      <span class="block">{`/`}</span>
    </KBtn>
    <KBtn
      className="w-[3.65rem] items-end justify-end pr-[4px] pb-[2px]"
      childrenClassName="items-end"
    >
      shift
    </KBtn>
  </div>

  <!-- Sixth Row -->
  <div class="mb-[2px] flex w-full flex-shrink-0 gap-[2px]">
    <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
      <div class="flex w-full justify-end pr-1">
        <span class="block">fn</span>
      </div>
      <div class="flex w-full justify-start pl-1">
        <IconWorld class="h-[6px] w-[6px]" />
      </div>
    </KBtn>
    <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
      <div class="flex w-full justify-end pr-1">
        <IconChevronUp class="h-[6px] w-[6px]" />
      </div>
      <div class="flex w-full justify-start pl-1">
        <span class="block">control</span>
      </div>
    </KBtn>
    <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
      <div class="flex w-full justify-end pr-1">
        <svg
          fill="none"
          version="1.1"
          id="icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          class="h-[6px] w-[6px]"
        >
          <rect
            stroke="currentColor"
            stroke-width={2}
            x="18"
            y="5"
            width="10"
            height="2"
          />
          <polygon
            stroke="currentColor"
            stroke-width={2}
            points="10.6,5 4,5 4,7 9.4,7 18.4,27 28,27 28,25 19.6,25 "
          />
          <rect
            id="_Transparent_Rectangle_"
            class="st0"
            width="32"
            height="32"
            stroke="none"
          />
        </svg>
      </div>
      <div class="flex w-full justify-start pl-1">
        <span class="block">option</span>
      </div>
    </KBtn>
    <KBtn className="w-8" childrenClassName="h-full justify-between py-[4px]">
      <div class="flex w-full justify-end pr-1">
        <IconCommand class="h-[6px] w-[6px]" />
      </div>
      <div class="flex w-full justify-start pl-1">
        <span class="block">command</span>
      </div>
    </KBtn>
    <KBtn className="w-[8.2rem]"></KBtn>
    <KBtn className="w-8" childrenClassName="h-full justify-between py-[4px]">
      <div class="flex w-full justify-start pl-1">
        <IconCommand class="h-[6px] w-[6px]" />
      </div>
      <div class="flex w-full justify-start pl-1">
        <span class="block">command</span>
      </div>
    </KBtn>
    <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
      <div class="flex w-full justify-start pl-1">
        <svg
          fill="none"
          version="1.1"
          id="icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          class="h-[6px] w-[6px]"
        >
          <rect
            stroke="currentColor"
            stroke-width={2}
            x="18"
            y="5"
            width="10"
            height="2"
          />
          <polygon
            stroke="currentColor"
            stroke-width={2}
            points="10.6,5 4,5 4,7 9.4,7 18.4,27 28,27 28,25 19.6,25 "
          />
          <rect
            id="_Transparent_Rectangle_"
            class="st0"
            width="32"
            height="32"
            stroke="none"
          />
        </svg>
      </div>
      <div class="flex w-full justify-start pl-1">
        <span class="block">option</span>
      </div>
    </KBtn>
    <div
      class="mt-[2px] flex h-6 w-[4.9rem] flex-col items-center justify-end rounded-[4px] p-[0.5px]"
    >
      <KBtn className="w-6 h-3">
        <IconCaretUpFilled class="h-[6px] w-[6px]" />
      </KBtn>
      <div class="flex">
        <KBtn className="w-6 h-3">
          <IconCaretLeftFilled class="h-[6px] w-[6px]" />
        </KBtn>
        <KBtn className="w-6 h-3">
          <IconCaretDownFilled class="h-[6px] w-[6px]" />
        </KBtn>
        <KBtn className="w-6 h-3">
          <IconCaretRightFilled class="h-[6px] w-[6px]" />
        </KBtn>
      </div>
    </div>
  </div>
</div>
