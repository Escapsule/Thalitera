import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, Building, CheckCircle, BarChart, Mail, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <span className="text-xl font-bold">RoomBook</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Sign In
            </Link>
            <Button asChild>
              <Link href="#">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
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
                    <Link href="#">Start Free Trial</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#">Book a Demo</Link>
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
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
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

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get started in minutes with our simple three-step process.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="text-xl font-bold">Sign Up</h3>
                <p className="text-center text-muted-foreground">
                  Create your account and add your organization&apos;s details and team members.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  2
                </div>
                <h3 className="text-xl font-bold">Set Up Rooms</h3>
                <p className="text-center text-muted-foreground">
                  Add your meeting rooms, their capacities, equipment, and availability schedules.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="text-xl font-bold">Start Booking</h3>
                <p className="text-center text-muted-foreground">
                  Your team can immediately begin booking rooms through our web app or mobile app.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that works best for your organization.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col rounded-lg border bg-background p-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Starter</h3>
                  <p className="text-muted-foreground">Perfect for small teams</p>
                </div>
                <div className="mt-4 flex items-baseline text-3xl font-bold">
                  $9<span className="text-sm font-normal text-muted-foreground">/month per user</span>
                </div>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Up to 5 meeting rooms</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Basic calendar integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Email notifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Mobile app access</span>
                  </li>
                </ul>
                <Button className="mt-8" asChild>
                  <Link href="#">Get Started</Link>
                </Button>
              </div>
              <div className="flex flex-col rounded-lg border bg-background p-6 shadow-lg ring-2 ring-primary">
                <div className="space-y-2">
                  <div className="inline-block rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                    Popular
                  </div>
                  <h3 className="text-2xl font-bold">Professional</h3>
                  <p className="text-muted-foreground">For growing organizations</p>
                </div>
                <div className="mt-4 flex items-baseline text-3xl font-bold">
                  $19<span className="text-sm font-normal text-muted-foreground">/month per user</span>
                </div>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Unlimited meeting rooms</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Advanced calendar integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Resource booking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Usage analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="mt-8" asChild>
                  <Link href="#">Get Started</Link>
                </Button>
              </div>
              <div className="flex flex-col rounded-lg border bg-background p-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Enterprise</h3>
                  <p className="text-muted-foreground">For large organizations</p>
                </div>
                <div className="mt-4 flex items-baseline text-3xl font-bold">
                  Custom<span className="text-sm font-normal text-muted-foreground"> pricing</span>
                </div>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Everything in Professional</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>SLA guarantees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>On-premise deployment option</span>
                  </li>
                </ul>
                <Button className="mt-8" variant="outline" asChild>
                  <Link href="#">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Trusted by Teams Worldwide</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  See what our customers have to say about RoomBook.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2">
              <div className="flex flex-col justify-between rounded-lg border p-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    &quot;RoomBook has transformed how we manage our office spaces. No more double bookings or confusion
                    about meeting room availability.&quot;
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <div className="rounded-full bg-muted p-1">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      width={40}
                      height={40}
                      alt="Avatar"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Operations Manager, TechCorp</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border p-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    &quot;The analytics feature has helped us optimize our office space usage, saving us thousands in real
                    estate costs.&quot;
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <div className="rounded-full bg-muted p-1">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      width={40}
                      height={40}
                      alt="Avatar"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Michael Chen</p>
                    <p className="text-sm text-muted-foreground">Facilities Director, Global Finance</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border p-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    &quot;The mobile app makes it so easy to book a room on the go. I can reserve a space right before a
                    client meeting.&quot;
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <div className="rounded-full bg-muted p-1">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      width={40}
                      height={40}
                      alt="Avatar"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Jessica Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Sales Executive, Retail Solutions</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border p-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    &quot;The integration with our calendar system was seamless. Our team adopted RoomBook immediately with
                    no training needed.&quot;
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <div className="rounded-full bg-muted p-1">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      width={40}
                      height={40}
                      alt="Avatar"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">David Patel</p>
                    <p className="text-sm text-muted-foreground">IT Manager, Creative Agency</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Frequently Asked Questions</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Find answers to common questions about RoomBook.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">How easy is it to get started?</h3>
                <p className="text-muted-foreground">
                  Very easy! You can be up and running in minutes. Our onboarding process guides you through adding
                  rooms, team members, and configuring your settings.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Can I integrate with my existing calendar?</h3>
                <p className="text-muted-foreground">
                  Yes, RoomBook integrates with Google Calendar, Microsoft Outlook, and other popular calendar systems
                  to prevent double bookings and sync events.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Is there a mobile app?</h3>
                <p className="text-muted-foreground">
                  Yes, we offer mobile apps for both iOS and Android, allowing you to book rooms on the go and receive
                  notifications about your bookings.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">How secure is my data?</h3>
                <p className="text-muted-foreground">
                  We take security seriously. All data is encrypted in transit and at rest, and we comply with GDPR,
                  CCPA, and other privacy regulations.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Can I customize the system to match our branding?</h3>
                <p className="text-muted-foreground">
                  Yes, Professional and Enterprise plans allow you to customize the interface with your company logo,
                  colors, and branding elements.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Do you offer a free trial?</h3>
                <p className="text-muted-foreground">
                  Yes, we offer a 14-day free trial with full access to all features, no credit card required to get
                  started.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to Simplify Room Booking?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of satisfied teams who have transformed their workspace management.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="#">
                    Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#">Schedule a Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Stay Updated with RoomBook</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Subscribe to our newsletter for tips on optimizing your workspace, new feature announcements, and
                  special offers.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-4">
                <form className="flex w-full max-w-sm flex-col gap-2">
                  <div className="flex gap-2">
                    <div className="grid gap-1 w-full">
                      <label htmlFor="email" className="sr-only">
                        Email
                      </label>
                      <Input
                        id="email"
                        placeholder="Enter your email"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                      />
                    </div>
                    <Button type="submit">
                      <Mail className="h-4 w-4 mr-2" />
                      Subscribe
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">We respect your privacy. Unsubscribe at any time.</p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <p className="text-sm font-medium">&copy; {new Date().getFullYear()} RoomBook. All rights reserved.</p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Cookies
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

