<template>
  <div class="min-h-screen bg-[#18181b] text-white flex flex-col items-center py-10">
    <div class="bg-[#23232a] rounded-2xl shadow-lg p-8 w-full max-w-2xl">
      <div class="flex items-center gap-4 mb-6">
        <img
          src="/src/assets/logo.svg"
          alt="Logo"
          class="w-12 h-12 rounded-full object-cover border border-white/20"
        />
        <div>
          <div class="font-bold text-sm">Acme Corporation</div>
          <div class="text-xs text-white/60">
            <span>+1 234 567 8901</span>
            <span class="mx-1">·</span>
            <span>info@acme.com</span>
          </div>
        </div>
        <div class="ml-auto text-xs text-white/40">
          Invoice Code: <span class="text-white">1234</span>
        </div>
      </div>
      <div class="flex justify-between items-center mb-4">
        <div>
          <div class="text-xs font-semibold">Issue Date</div>
          <div class="text-xs text-white/60">Apr 10, 2024</div>
        </div>
        <div>
          <div class="text-xs font-semibold">Status</div>
          <div class="text-yellow-400 text-xs">unpaid</div>
        </div>
      </div>
      <div class="mb-6">
        <div class="font-semibold mb-2">Items</div>
        <ul class="divide-y divide-white/10">
          <li class="py-2 flex justify-between text-xs">
            <span>Website Design</span>
            <span>1 × ₦500,000</span>
            <span class="font-bold">₦500,000</span>
          </li>
          <li class="py-2 flex justify-between text-xs">
            <span>Hosting (1 year)</span>
            <span>1 × ₦50,000</span>
            <span class="font-bold">₦50,000</span>
          </li>
          <li class="py-2 flex justify-between text-xs">
            <span>Domain Registration</span>
            <span>1 × ₦10,000</span>
            <span class="font-bold">₦10,000</span>
          </li>
        </ul>
      </div>
      <div class="flex justify-between items-center border-t border-white/10 pt-4 mt-4">
        <span class="font-bold text-sm">Total</span>
        <span class="font-bold text-sm">₦560,000</span>
      </div>
      <div class="mt-6 p-4 bg-white/5 rounded-lg text-xs text-white/80">
        <span class="font-semibold">Note:</span> Thank you for your business! Payment is due within
        14 days.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No logic needed for design-only dummy content
</script>
