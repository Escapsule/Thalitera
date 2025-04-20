import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, CheckCircle, BarChart, Building } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2 mr-auto">
            <div className="pl-12 flex items-center gap-2">
            <Image 
              src = "/icon.png?height=36&width=36"
              alt = "Thalitera"
              width = {36}
              height = {36}
            />
            <span className="text-xl font-bold">Thalitera</span>
            </div>
          </div>
          <nav className="hidden md:flex gap-6">
          </nav>
          <div className="flex items-center gap-4 justify-end">
            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
              Sign In
            </Link>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Book Meeting Rooms With Ease
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Streamline your workspace management with our intuitive meeting room booking system. No more double
                    bookings or confusion.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/login">Start Free Trial</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="/placeholder.jpg?height=550&width=550"
                width={550}
                height={550}
                alt="Dashboard Preview"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted flex items-center justify-center">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Everything You Need to Manage Meeting Spaces
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform offers a comprehensive suite of tools to make room booking simple, efficient, and
                  hassle-free.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <Calendar className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Easy Scheduling</h3>
                <p className="text-center text-muted-foreground">
                  Book rooms in seconds with our intuitive calendar interface. View availability at a glance.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <Users className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Team Integration</h3>
                <p className="text-center text-muted-foreground">
                  Sync with your team&apos;s calendars and tools like Google Calendar, Outlook, and Slack.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <Clock className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Real-time Updates</h3>
                <p className="text-center text-muted-foreground">
                  Get instant notifications about booking changes, cancellations, and confirmations.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <Building className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Multiple Locations</h3>
                <p className="text-center text-muted-foreground">
                  Manage rooms across different office locations from a single dashboard.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <BarChart className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Usage Analytics</h3>
                <p className="text-center text-muted-foreground">
                  Track room utilization and optimize your workspace with detailed reports.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <CheckCircle className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Resource Management</h3>
                <p className="text-center text-muted-foreground">
                  Book equipment, catering, and other resources alongside your meeting rooms.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 flex items-center justify-center">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Pricing
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Choose the Plan That Works for You
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Simple, transparent pricing to meet the needs of any organization.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2">
              {/* Community Plan */}
              <div className="flex flex-col rounded-lg border p-8">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold">Community</h3>
                  <p className="text-muted-foreground mt-2">For individuals and small teams getting started</p>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">Free</span>
                </div>
                <ul className="mb-8 space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary" /> Basic room booking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary" /> Calendar integration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary" /> Email notifications
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary" /> Up to 10 users
                  </li>
                </ul>
                <Button asChild className="mt-auto">
                  <Link href="/login">Get Started</Link>
                </Button>
              </div>
              
              {/* Enterprise Plan */}
              <div className="flex flex-col rounded-lg border border-primary bg-primary/5 p-8 relative">
                <div className="absolute -top-4 right-6 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium">
                  Most Popular
                </div>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold">Enterprise</h3>
                  <p className="text-muted-foreground mt-2">For organizations with advanced needs</p>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$500</span>
                  <span className="text-muted-foreground">/month</span>
                  <p className="text-sm text-muted-foreground">Up to 500 seats</p>
                </div>
                <ul className="mb-8 space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary" /> Everything in Community
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary" /> Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary" /> Priority support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary" /> Resource management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary" /> Multiple locations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary" /> Custom integrations
                  </li>
                </ul>
                <Button asChild variant="default" className="mt-auto">
                  <Link href="/login">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2 pl-12">
            <Image 
              src = "/icon.png?height=36&width=36"
              alt = "Thalitera"
              width = {36}
              height = {36}
            />
            <p className="text-sm font-medium">&copy; {new Date().getFullYear()} Thalitera. All rights reserved.</p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
          </nav>
        </div>
      </footer>
    </div>
  )
}

