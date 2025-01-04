<div class="flex flex-1 flex-col gap-8 items-center text-slate-500">
  <div class="size-40">
    <slot></slot>
  </div>
  
  <div class="text-xl"><slot name="text"></slot></div>

  <slot name="actions"></slot>
</div>