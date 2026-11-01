import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Reveal } from './MotionPrimitives';

export function PrivacyView() {
  return (
    <div className="bg-[#F8F8F3] py-12 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal
          y={18}
          className="rounded-3xl bg-white border border-[#E4E9E3] p-6 sm:p-12 shadow-xs space-y-8"
        >
          <div className="space-y-3 border-b border-[#E4E9E3] pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
              Gharmalak
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
              Privacy
            </h1>
            <p className="text-base text-[#073B30]/80 leading-relaxed">
              This page explains what we collect when you join Gharmalak and how we use it. It is a
              plain-language summary for the pilot; the full policy will be published before we
              leave Nagpur.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#073B30]">What we collect</h2>
            <p className="text-base text-[#073B30]/85 leading-relaxed">
              Your name, WhatsApp number, area, type of home and the deals you are interested in.
              When you pay, our payment partner Razorpay shares the payment id and the mobile number
              used, so we can match it to you. We do not see or store your card or UPI details.
            </p>
            <p className="flex items-center gap-2 text-sm font-semibold text-[#064E3B]">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>We never ask for your Aadhaar number.</span>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#073B30]">How we use it</h2>
            <p className="text-base text-[#073B30]/85 leading-relaxed">
              To run your membership, to send you round updates on WhatsApp (at most 4 messages a
              month), and to share your name, number and area with the vendor who wins a round, only
              after you opt in to that round.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#073B30]">Where it is kept</h2>
            <p className="text-base text-[#073B30]/85 leading-relaxed">
              On servers in India or with Indian data handling, for as long as you are a member and
              for up to 2 years after, unless the law asks us to keep it longer.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#073B30]">Your choices</h2>
            <p className="text-base text-[#073B30]/85 leading-relaxed">
              Reply STOP on WhatsApp to stop messages. To see, correct or delete your data, message
              us on WhatsApp. We will reply within 7 days.
            </p>
          </section>

          <section className="space-y-3 border-t border-[#E4E9E3] pt-6">
            <h2 className="text-xl font-bold text-[#073B30]">Gharmalak Check (Pune)</h2>
            <p className="text-base text-[#073B30]/85 leading-relaxed">
              If you ask to talk to an owner or for written answers about a building, we keep your
              name, WhatsApp number, the building and when you plan to decide, to set up your call
              or send the answers. Owners never see your number, and we connect calls without
              showing either side&apos;s number.
            </p>
            <p className="text-base text-[#073B30]/85 leading-relaxed">
              If you answer as an owner, we keep your name, WhatsApp number, building and answers.
              Your answers are shared with homebuyers without your name, phone or flat number. The
              sale agreement, Index II or bill you send as proof is used only to check that you own
              a flat there, and is deleted within 30 days.
            </p>
            <p className="font-bold text-[#064E3B]">We do not sell your data.</p>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
