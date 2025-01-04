<div class="flex flex-col gap-8 text-center items-center text-slate-500">
  <div class="size-40">
    <slot></slot>
  </div>
  
  <div class="text-xl"><slot name="text"></slot></div>

  <slot name="actions"></slot>
</div>