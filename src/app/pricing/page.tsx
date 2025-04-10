"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"

const tiers = [
  {
    name: "Free",
    id: "tier-free",
    href: "/dashboard",
    price: { monthly: "$0", annually: "$0" },
    description: "Everything you need to get started with DocMentor.",
    features: [
      "Upload documents up to 20MB",
      "Basic AI document analysis",
      "5 saved conversations",
      "Standard support",
      "Access to core features"
    ],
    mostPopular: false,
  },
  {
    name: "Premier",
    id: "tier-premier",
    href: "/dashboard",
    price: { monthly: "$19", annually: "$190" },
    description: "Advanced features for power users who need more.",
    features: [
      "Upload documents up to 100MB",
      "Advanced AI document analysis",
      "Unlimited saved conversations",
      "Priority support 24/7",
      "Advanced document insights",
      "Custom AI fine-tuning",
      "Collaboration with team members",
      "Document comparison tools",
      "Export analytics & reports",
      "API access"
    ],
    mostPopular: true,
  },
]

export default function PricingPage() {
  return (
    <div className="relative isolate bg-zinc-900 py-24 sm:py-32">
      {/* Background elements */}
      <div className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl" aria-hidden="true">
        <div className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-blue-500 to-blue-900 opacity-30" />
      </div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Plans for every need
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-300">
            Choose the perfect plan for your document analysis needs. Upgrade anytime as your requirements grow.
          </p>
        </div>

        <div className="mt-16 flex justify-center">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-6">
            {tiers.map((tier) => (
              <Card 
                key={tier.id}
                className={cn(
                  "relative rounded-2xl border bg-zinc-800/50 backdrop-blur-sm",
                  tier.mostPopular ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-zinc-700"
                )}
              >
                {tier.mostPopular && (
                  <div className="absolute right-4 top-4">
                    <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2.5 py-0.5 text-sm font-medium text-blue-400">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
                  <div className="mt-4 flex items-baseline text-zinc-100">
                    <span className="text-4xl font-bold tracking-tight">{tier.price.monthly}</span>
                    <span className="ml-1 text-sm font-semibold text-zinc-400">/month</span>
                  </div>
                  <CardDescription className="mt-2 text-zinc-400">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="mt-8 space-y-3 text-sm text-zinc-300">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <Check className="h-5 w-5 flex-shrink-0 text-blue-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className={cn(
                      "mt-2 w-full",
                      tier.mostPopular
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                    )}
                  >
                    <Link href={tier.href}>
                      {tier.name === "Free" ? "Get started" : "Upgrade now"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-20 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="mt-10 space-y-8 text-left">
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">What happens if I exceed my storage limit?</h3>
              <p className="mt-2 text-zinc-400">You'll receive a notification when approaching your limit. Free users can upgrade to Premier, while Premier users can contact support for custom solutions.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">Can I upgrade or downgrade at any time?</h3>
              <p className="mt-2 text-zinc-400">Yes, you can change your plan at any time. When upgrading, you'll be charged prorated for the remainder of your billing cycle.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">Is there a trial period for the Premier plan?</h3>
              <p className="mt-2 text-zinc-400">Yes, we offer a 14-day free trial of all Premier features. No credit card required to start.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}